import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/database';

interface User {
  id: number;
  email: string;
  password: string;
}

interface JWTPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied'
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ 
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const loginHandler = async (
  req: Request, 
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
      return;
    }

    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};