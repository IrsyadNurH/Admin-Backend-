import express from "express";
import { Request, Response } from 'express-serve-static-core';
import pool from "../config/database";
import bcrypt from 'bcrypt';
import { z } from 'zod';

const router = express.Router();

// Define validation schemas
const emailSchema = z.object({
  email: z.string().email("Invalid email format")
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  resetToken: z.string()
});

// Request password reset endpoint
router.post("/admins/reset-password/request", async (req: Request, res: Response) => {
  try {
    // Validate email
    const validatedData = emailSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      res.status(400).json({ 
        message: "Validation error", 
        errors: validatedData.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });return ;
    }

    const { email } = validatedData.data;

    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Email tidak ditemukan" });
      return ;
    }

    const resetToken = "generated-reset-token";
    res.status(200).json({
      message: "Email ditemukan, token reset dikirim",
      resetToken: resetToken
    });

  } catch (error) {
    console.error("Error saat verifikasi email:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// Confirm password reset endpoint
router.post("/admins/reset-password/confirm", async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.safeParse(req.body);

    if (!validatedData.success) {
      res.status(400).json({ 
        message: "Validation error", 
        errors: validatedData.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const { email, password, resetToken } = validatedData.data;

    const admin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (admin.rows.length === 0) {
      res.status(404).json({ message: "Email not found" });
      return ;
    }

    if (resetToken !== "some-predefined-token") {
     res.status(400).json({ message: "Invalid reset token" });
     return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
      'UPDATE admins SET password = $1 WHERE email = $2', 
      [hashedPassword, email]
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during reset password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;