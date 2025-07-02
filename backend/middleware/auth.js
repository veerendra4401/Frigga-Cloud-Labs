const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth Middleware: Received token:', token);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth Middleware: Decoded payload:', decoded);
    } catch (err) {
      console.error('Auth Middleware: JWT verification error:', err);
      throw err;
    }

    // Get user from database
    const [rows] = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    console.log('Auth Middleware: DB user rows:', rows);

    if (!rows || rows.length === 0) {
      console.log('Auth Middleware: No user found for userId:', decoded.userId);
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user to request object (handle both array and object)
    req.user = Array.isArray(rows) ? rows[0] : rows;
    console.log('Auth Middleware: req.user set to:', req.user);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('OptionalAuth Middleware: Received token:', token);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('OptionalAuth Middleware: Decoded payload:', decoded);
        const [rows] = await db.query(
          'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
          [decoded.userId]
        );

        if (rows && rows.length > 0) {
          req.user = rows[0];
          console.log('OptionalAuth Middleware: req.user set to:', req.user);
        } else {
          console.log('OptionalAuth Middleware: No user found for userId:', decoded.userId);
        }
      } catch (err) {
        console.error('OptionalAuth Middleware: JWT verification error:', err);
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Document access middleware
const checkDocumentAccess = async (req, res, next) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    console.log('Checking document access:', {
      rawDocumentId: req.params.id,
      parsedDocumentId: documentId,
      userId,
      documentIdType: typeof documentId,
      userIdType: typeof userId,
      isAuthenticated: !!userId
    });

    // Validate document ID
    if (isNaN(documentId)) {
      console.log('Invalid document ID:', req.params.id);
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }

    // Get document
    let result;
    try {
      result = await db.query(
        'SELECT * FROM documents WHERE id = ?',
        [documentId]
      );
      
      // MySQL2 returns an array with [rows, fields]
      // We need to handle both array of arrays and simple array results
      const documents = Array.isArray(result[0]) ? result[0] : result;
      
      console.log('Raw query result:', {
        resultType: typeof result,
        isArray: Array.isArray(result),
        length: result?.length,
        firstElement: result?.[0],
        documents
      });

      if (!documents || documents.length === 0) {
        console.log('Document not found in database:', documentId);
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const document = documents[0];
      
      console.log('Document found:', {
        id: document.id,
        isPublic: document.is_public,
        authorId: document.author_id
      });

      // Public documents are accessible to everyone
      if (document.is_public === 1 || document.is_public === true) {
        console.log('Document is public, granting access');
        req.document = document;
        return next();
      }

      // Private documents require authentication
      if (!userId) {
        console.log('Document is private and user is not authenticated');
        return res.status(401).json({
          success: false,
          error: 'Authentication required to access this document'
        });
      }

      // Check if user is the author
      const authorId = parseInt(document.author_id, 10);
      const currentUserId = parseInt(userId, 10);

      console.log('Checking author access:', {
        authorId,
        currentUserId,
        isAuthor: authorId === currentUserId
      });

      if (authorId === currentUserId) {
        console.log('User is the author, granting access');
        req.document = document;
        return next();
      }

      // Check if user has shared access
      let shareResult;
      try {
        shareResult = await db.query(
          'SELECT * FROM document_shares WHERE document_id = ? AND user_id = ?',
          [documentId, currentUserId]
        );
        
        // Handle MySQL2 result format
        const shares = Array.isArray(shareResult[0]) ? shareResult[0] : shareResult;

        console.log('Share check result:', {
          hasShares: shares && shares.length > 0,
          shareCount: shares?.length
        });

        if (shares && shares.length > 0) {
          console.log('User has shared access, granting access');
          req.document = document;
          req.documentShare = shares[0];
          return next();
        }
      } catch (dbError) {
        console.error('Share query error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database error while checking document access'
        });
      }

      console.log('Access denied to document');
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this document'
      });

    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Database error while fetching document'
      });
    }
  } catch (error) {
    console.error('Document access check error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      error: 'Error checking document access'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  checkDocumentAccess
};