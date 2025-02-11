import express from 'express';
import pool from '../config/database';
import { UAParser } from 'ua-parser-js';

const router = express.Router();

// Helper function to get client IP
const getClientIP = (req: express.Request): string => {
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress?.replace(/^::ffff:/, '') || 'Unknown IP';
};

router.post('/logout', async (req, res) => {
  try {
    // Get device information
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const ipAddress = getClientIP(req);
    
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();
    
    const deviceInfo = `${device.type || 'Desktop'} - ${os.name || 'Unknown OS'} ${os.version || ''} (${browser.name || 'Unknown Browser'}) - IP: ${ipAddress}`;
    
    // Clear auth token
    res.clearCookie('token');
    
    // Log the logout action with device info
    await pool.query(
      'INSERT INTO logs (action, timestamp, device_info, ip_address) VALUES ($1, CURRENT_TIMESTAMP, $2, $3)',
      ['logout', deviceInfo, ipAddress]
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