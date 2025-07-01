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
    const documentId = req.params.id;
    const userId = req.user?.id;
    console.log('[checkDocumentAccess] documentId:', documentId, 'userId:', userId);

    // Defensive: ensure documentId is a number
    const docIdNum = Number(documentId);
    if (!docIdNum || isNaN(docIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID'
      });
    }

    // Get document
    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [docIdNum]
    );
    const document = documents && documents[0];
    if (!document) {
      console.log('[checkDocumentAccess] Document not found for id:', docIdNum);
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Public documents are accessible to everyone
    if (document.is_public) {
      req.document = document;
      return next();
    }

    // Private documents require authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required for private documents'
      });
    }

    // Check if user is the author
    if (document.author_id == userId) {
      req.document = document;
      return next();
    }

    // Check if user has shared access
    const [shares] = await db.query(
      'SELECT * FROM document_shares WHERE document_id = ? AND user_id = ?',
      [docIdNum, userId]
    );

    if (shares && shares.length > 0) {
      req.document = document;
      req.documentShare = shares[0];
      return next();
    }

    console.log('[checkDocumentAccess] Access denied for user', userId, 'to document', docIdNum);
    return res.status(403).json({
      success: false,
      error: 'Access denied to this document'
    });
  } catch (error) {
    console.error('Document access check error:', error);
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