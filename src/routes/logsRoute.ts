import express from 'express';
import { Pool } from 'pg';
import pool from '../config/database';
import { UAParser } from 'ua-parser-js';

const router = express.Router();

interface LogEntry {
  id?: number;
  action: 'login' | 'logout';
  timestamp: Date;
  device_info: string;
  ip_address: string;
  user_timezone?: string;
}


// Helper function to get client IP
const getClientIP = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
  }
  return req.socket.remoteAddress || 'Unknown IP';
};


router.get('/logs', async (req, res) => {
  try {
    console.log('GET /logs request received');
    const userTimezone = req.headers['x-timezone'] as string || 'Asia/Jakarta';
    
    const query = `
      SELECT 
        id,
        action,
        timestamp AT TIME ZONE 'UTC' AT TIME ZONE $1 as timestamp,
        device_info,
        ip_address,
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

router.post('/logs', async (req, res) => {
  try {
    const { action, timezone } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const ipAddress = getClientIP(req);
    
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();
    
    const deviceInfo = `${device.type || 'Desktop'} - ${os.name || 'Unknown OS'} ${os.version || ''} (${browser.name || 'Unknown Browser'}) - IP: ${ipAddress}`;

    const result = await pool.query(
      'INSERT INTO logs (action, timestamp, device_info, ip_address, user_timezone) VALUES ($1, CURRENT_TIMESTAMP AT TIME ZONE $2, $3, $4, $5) RETURNING *',
      [action, timezone || 'Asia/Jakarta', deviceInfo, ipAddress, timezone || 'Asia/Jakarta']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating log:', err);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

router.put('/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const ipAddress = getClientIP(req);
    
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();
    
    const deviceInfo = `${device.type || 'Desktop'} - ${os.name || 'Unknown OS'} ${os.version || ''} (${browser.name || 'Unknown Browser'}) - IP: ${ipAddress}`;

    const result = await pool.query(
      'UPDATE logs SET action = $1, device_info = $2, ip_address = $3 WHERE id = $4 RETURNING *',
      [action, deviceInfo, ipAddress, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Log not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating log:', err);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

export default router;