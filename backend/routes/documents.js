const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, checkDocumentAccess, authorizeRoles, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all documents (with pagination and search)
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Parse page and limit as integers with fallback values
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    console.log('Document request params:', { page, limit, search, offset, userId });

    // Build base query without LIMIT/OFFSET
    let query = `
      SELECT SQL_CALC_FOUND_ROWS
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM documents d
      JOIN users u ON d.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Add search condition
    if (search) {
      query += ` AND (d.title LIKE ? OR d.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add visibility conditions
    if (userId) {
      query += ` AND (d.is_public = 1 OR d.author_id = ? OR EXISTS (
        SELECT 1 FROM document_shares ds WHERE ds.document_id = d.id AND ds.user_id = ?
      ))`;
      params.push(userId, userId);
    } else {
      query += ` AND d.is_public = 1`;
    }

    // Add ORDER BY and append LIMIT/OFFSET directly
    query += ` ORDER BY d.updated_at DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log('Query:', query);
    console.log('Params:', params);

    // Execute query
    let documents = await db.query(query, params);
    // Handle both [rows, fields] and rows-only style
    if (Array.isArray(documents) && Array.isArray(documents[0])) {
      documents = documents[0];
    }

    // Get total count using FOUND_ROWS()
    let totalResult = await db.query('SELECT FOUND_ROWS() as total');
    let total;
    if (Array.isArray(totalResult)) {
      if (Array.isArray(totalResult[0])) {
        total = totalResult[0][0]?.total || 0;
      } else {
        total = totalResult[0]?.total || 0;
      }
    } else {
      total = 0;
    }

    // Format the response
    const response = {
      success: true,
      data: (Array.isArray(documents) ? documents : []).map(doc => ({
        ...doc,
        id: Number(doc.id), // Ensure id is always a number
        is_public: Boolean(doc.is_public),
        created_at: doc.created_at instanceof Date ? doc.created_at.toISOString() : doc.created_at,
        updated_at: doc.updated_at instanceof Date ? doc.updated_at.toISOString() : doc.updated_at
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages: Math.ceil(total / limit)
      }
    };

    console.log('Response:', {
      documentCount: response.data.length,
      documentIds: response.data.map(d => d.id),
      pagination: response.pagination
    });

    res.json(response);
  } catch (error) {
    console.error('Get documents error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
});

// Get document by ID
router.get('/:id', checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;
    
    // Get author information
    const authors = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [document.author_id]
    );

    // Get shares information
    const shares = await db.query(`
      SELECT ds.id, ds.permission, ds.created_at,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM document_shares ds
      JOIN users u ON ds.user_id = u.id
      WHERE ds.document_id = ?
    `, [document.id]);

    // Get mentions
    const mentions = await db.query(`
      SELECT m.id, m.created_at,
             u.id as user_id, u.name as user_name, u.email as user_email,
             mu.id as mentioned_by_id, mu.name as mentioned_by_name
      FROM mentions m
      JOIN users u ON m.user_id = u.id
      JOIN users mu ON m.mentioned_by = mu.id
      WHERE m.document_id = ?
    `, [document.id]);

    res.json({
      success: true,
      data: {
        ...document,
        author: authors[0],
        shares,
        mentions
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new document
router.post(
  '/',
  authenticateToken,
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('isPublic').custom((value, { req }) => {
      // Accept both boolean and string 'true'/'false' from frontend
      if (typeof value === 'boolean') return true;
      if (typeof value === 'string' && (value === 'true' || value === 'false')) return true;
      throw new Error('isPublic must be a boolean');
    })
  ],
  async (req, res) => {
  try {
    console.log('Document creation request:', {
      body: req.body,
      headers: req.headers,
      user: req.user
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }


    let { title, content, isPublic } = req.body;
    // Accept string 'true'/'false' from frontend and convert to boolean
    if (typeof isPublic === 'string') {
      isPublic = isPublic === 'true';
    }
    // Always use req.user.id (guaranteed by authenticateToken)
    let authorId = parseInt(req.user.id);
    if (!authorId || isNaN(authorId)) {
      return res.status(400).json({
        success: false,
        error: 'Authenticated user ID missing.'
      });
    }

    console.log('Creating document with:', {
      title,
      contentLength: content?.length,
      isPublic,
      authorId
    });

    // Create document (MySQL: use 0/1 for booleans, no CAST needed)
    const result = await db.query(
      'INSERT INTO documents (title, content, is_public, author_id) VALUES (?, ?, ?, ?)',
      [title, content, isPublic ? 1 : 0, authorId]
    );

    console.log('Document created:', { insertId: result.insertId });

    // Get created document
    const [documents] = await db.query(`
      SELECT 
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM documents d
      JOIN users u ON d.author_id = u.id
      WHERE d.id = ?
    `, [result.insertId]);

    // Create initial version
    await db.query(
      'INSERT INTO document_versions (document_id, content, version, author_id) VALUES (?, ?, ?, ?)',
      [result.insertId, content, 1, authorId]
    );

    res.status(201).json({
      success: true,
      data: documents[0],
      message: 'Document created successfully'
    });
  } catch (error) {
    console.error('Create document error:', error);
    console.error('Request details:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create document',
      message: error.message
    });
  }
});

// Update document
router.put('/:id', authenticateToken, checkDocumentAccess, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const document = req.document;
    const { title, content, isPublic } = req.body;
    const userId = req.user.id;

    // Check if user can edit
    if (document.author_id !== userId && req.documentShare?.permission !== 'EDIT') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit this document'
      });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }

    if (isPublic !== undefined) {
      updates.push('is_public = ?');
      params.push(isPublic);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(document.id);

    // Update document
    await db.query(
      `UPDATE documents SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Create new version if content changed
    if (content !== undefined) {
      const [versions] = await db.query(
        'SELECT MAX(version) as max_version FROM document_versions WHERE document_id = ?',
        [document.id]
      );
      const nextVersion = (versions[0].max_version || 0) + 1;

      await db.query(
        'INSERT INTO document_versions (document_id, content, version, author_id) VALUES (?, ?, ?, ?)',
        [document.id, content, nextVersion, userId]
      );
    }

    // Get updated document
    const documents = await db.query(`
      SELECT 
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM documents d
      JOIN users u ON d.author_id = u.id
      WHERE d.id = ?
    `, [document.id]);

    res.json({
      success: true,
      data: documents[0],
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete document
router.delete('/:id', authenticateToken, checkDocumentAccess, async (req, res) => {
  try {
    const document = req.document;
    const userId = req.user.id;

    // Only author can delete
    if (document.author_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can delete this document'
      });
    }

    await db.query('DELETE FROM documents WHERE id = ?', [document.id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Search documents
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user?.id;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    let searchQuery = `
      SELECT 
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email,
        MATCH(d.title, d.content) AGAINST(? IN BOOLEAN MODE) as relevance
      FROM documents d
      JOIN users u ON d.author_id = u.id
      WHERE MATCH(d.title, d.content) AGAINST(? IN BOOLEAN MODE)
    `;
    const params = [query, query];

    // Add visibility conditions
    if (userId) {
      searchQuery += ` AND (d.is_public = 1 OR d.author_id = ? OR EXISTS (
        SELECT 1 FROM document_shares ds WHERE ds.document_id = d.id AND ds.user_id = ?
      ))`;
      params.push(userId, userId);
    } else {
      searchQuery += ` AND d.is_public = 1`;
    }

    searchQuery += ` ORDER BY relevance DESC, d.updated_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const documents = await db.query(searchQuery, params);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        query
      }
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Share document
router.post('/:id/share', authenticateToken, checkDocumentAccess, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('permission').isIn(['VIEW', 'EDIT']).withMessage('Permission must be VIEW or EDIT')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const document = req.document;
    const { userId, permission } = req.body;
    const currentUserId = req.user.id;

    // Only author can share
    if (document.author_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can share this document'
      });
    }

    // Check if user exists
    const users = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Create or update share
    await db.query(
      'INSERT INTO document_shares (document_id, user_id, permission) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE permission = VALUES(permission)',
      [document.id, userId, permission]
    );

    // Create notification
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [userId, 'SHARE', 'Document shared with you', `Document "${document.title}" has been shared with you`]
    );

    res.json({
      success: true,
      message: 'Document shared successfully'
    });
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove document share
router.delete('/:id/share', authenticateToken, checkDocumentAccess, [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const document = req.document;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    // Only author can remove shares
    if (document.author_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can remove shares'
      });
    }

    await db.query(
      'DELETE FROM document_shares WHERE document_id = ? AND user_id = ?',
      [document.id, userId]
    );

    res.json({
      success: true,
      message: 'Share removed successfully'
    });
  } catch (error) {
    console.error('Remove share error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get document versions
router.get('/:id/versions', checkDocumentAccess, async (req, res) => {
  try {
    const documentId = req.params.id;

    const versions = await db.query(`
      SELECT 
        dv.id, dv.content, dv.version, dv.created_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM document_versions dv
      JOIN users u ON dv.author_id = u.id
      WHERE dv.document_id = ?
      ORDER BY dv.version DESC
    `, [documentId]);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get specific version
router.get('/:id/versions/:versionId', checkDocumentAccess, async (req, res) => {
  try {
    const { id: documentId, versionId } = req.params;

    const versions = await db.query(`
      SELECT 
        dv.id, dv.content, dv.version, dv.created_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM document_versions dv
      JOIN users u ON dv.author_id = u.id
      WHERE dv.document_id = ? AND dv.id = ?
    `, [documentId, versionId]);

    if (versions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Version not found'
      });
    }

    res.json({
      success: true,
      data: versions[0]
    });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 