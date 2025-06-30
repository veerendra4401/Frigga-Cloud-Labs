const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [user] = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user to request object
    req.user = user[0];
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

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [user] = await db.query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (user && user.length > 0) {
        req.user = user[0];
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

    // Get document
    const [documents] = await db.query(
      'SELECT * FROM documents WHERE id = ?',
      [documentId]
    );

    if (!documents || documents.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = documents[0];

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
    if (document.author_id === userId) {
      req.document = document;
      return next();
    }

    // Check if user has shared access
    const [shares] = await db.query(
      'SELECT * FROM document_shares WHERE document_id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (shares && shares.length > 0) {
      req.document = document;
      req.documentShare = shares[0];
      return next();
    }

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