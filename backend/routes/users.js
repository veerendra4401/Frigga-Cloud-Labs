const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Search users endpoint (public)
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ data: [] });
    }

    const searchQuery = `
      SELECT id, name, email 
      FROM users 
      WHERE LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)
      LIMIT 10
    `;

    const searchPattern = `%${query}%`;
    const result = await db.query(searchQuery, [searchPattern, searchPattern]);
    
    // Return data in the expected format
    return res.json({
      data: result.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
      }))
    });
  } catch (error) {
    console.error('Error searching users:', error);
    // Return empty array instead of error to handle gracefully
    return res.json({ data: [] });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Users can only view their own profile or admins can view any
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const users = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email')
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

    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken
    if (email) {
      const existingUsers = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(userId);

    // Update user
    await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Get updated user
    const users = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: users[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, parseInt(limit), offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's documents
router.get('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Users can only view their own documents or admins can view any
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const documents = await db.query(`
      SELECT 
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email
      FROM documents d
      JOIN users u ON d.author_id = u.id
      WHERE d.author_id = ?
      ORDER BY d.updated_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM documents WHERE author_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's shared documents
router.get('/:id/shared-documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Users can only view their own shared documents or admins can view any
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const documents = await db.query(`
      SELECT 
        d.id, d.title, d.content, d.is_public, d.created_at, d.updated_at,
        u.id as author_id, u.name as author_name, u.email as author_email,
        ds.permission, ds.created_at as shared_at
      FROM document_shares ds
      JOIN documents d ON ds.document_id = d.id
      JOIN users u ON d.author_id = u.id
      WHERE ds.user_id = ?
      ORDER BY ds.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM document_shares WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get shared documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's mentions
router.get('/:id/mentions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Users can only view their own mentions or admins can view any
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const mentions = await db.query(`
      SELECT 
        m.id, m.created_at,
        d.id as document_id, d.title as document_title,
        u.id as mentioned_by_id, u.name as mentioned_by_name, u.email as mentioned_by_email
      FROM mentions m
      JOIN documents d ON m.document_id = d.id
      JOIN users u ON m.mentioned_by = u.id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM mentions WHERE user_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: mentions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get mentions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 