import { Request, Response } from 'express';
import crypto from 'crypto';
import pool from '../config/database';

// Fungsi untuk mereset password tanpa mengirim email
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).send('Email is required');
    }
  
    try {
      const admin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
      if (admin.rows.length === 0) {
        return res.status(404).send('Email not found');
      }
  
      const token = crypto.randomBytes(20).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 jam
  
      await pool.query(
        'UPDATE admins SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
        [token, expires, email]
      );
  
      return res.status(200).send('Password reset successfully');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
  };
  
// Fungsi untuk mereset password tanpa mengirim email
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, newPassword } = req.body;
  
    try {
      // Verifikasi apakah email ada di database
      const admin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  
      if (admin.rows.length === 0) {
        return res.status(404).send('Email not found');
      }
  
      // Hash password baru
      const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
  
      // Update password di database
      await pool.query(
        'UPDATE admins SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
  
      return res.status(200).send('Password reset successfully');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
  };