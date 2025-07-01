const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Delete current user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
