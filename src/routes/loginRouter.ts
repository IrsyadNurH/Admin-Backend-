import express, { Router, Request, Response } from "express";
import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const loginRouter: Router = express.Router();

// Endpoint untuk login
loginRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find admin by email
        const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        const admin = result.rows[0];

        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        // Simpen JWT secret di env, biar bisa verifikasi valid token
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // Send response with token
        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default loginRouter;