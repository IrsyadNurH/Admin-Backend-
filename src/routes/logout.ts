import express from 'express';
import pool from '../config/database';
const router = express.Router();

router.post('/logout', async (req, res) => {
  try {
    const userEmail = req.body.email; // Get email from request body
    
    // Clear auth token
    res.clearCookie('token');
    
    // Log the logout action
    await pool.query(
      'INSERT INTO logs (action, timestamp, user_email) VALUES ($1, CURRENT_TIMESTAMP, $2)',
      ['logout', userEmail]
    );
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      redirect: '/'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false, 
      message: 'Error during logout'
    });
  }
});

export default router;