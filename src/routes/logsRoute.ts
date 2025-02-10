import express from 'express';
import { Pool } from 'pg';
import pool from '../config/database';

const router = express.Router();

interface LogEntry {
  id?: number;
  action: 'login' | 'logout';
  timestamp: Date;
  user_email: string;
  user_timezone?: string;

}

router.get('/logs', async (req, res) => {
  try {
    console.log('GET /logs request received');
    const userTimezone = req.headers['x-timezone'] as string || 'Asia/Jakarta';
    
    // Test database connection
    await pool.query('SELECT NOW()');
    
    const query = `
      SELECT 
        id,
        action,
        timestamp AT TIME ZONE 'UTC' AT TIME ZONE $1 as timestamp,
        user_email,
        COALESCE(user_timezone, $1) as user_timezone
      FROM logs 
      ORDER BY timestamp DESC
    `;

    const result = await pool.query(query, [userTimezone]);
    console.log('Query executed, rows:', result.rowCount);
    
    res.json(result.rows || []);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      error: 'Database error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});
// GET all logs
router.post('/logs', async (req, res) => {
  const { action, user_email, timezone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO logs (action, timestamp, user_email, user_timezone) VALUES ($1, CURRENT_TIMESTAMP AT TIME ZONE $2, $3, $4) RETURNING *',
      [action, timezone || 'Asia/Jakarta', user_email, timezone || 'Asia/Jakarta']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating log:', err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});


// UPDATE log
router.put('/logs/:id', async (req, res) => {
  const { id } = req.params;
  const { action, user_email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE logs SET action = $1, user_email = $2 WHERE id = $3 RETURNING *',
      [action, user_email, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Log not found' });
      return ;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating log:', err);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

export default router;