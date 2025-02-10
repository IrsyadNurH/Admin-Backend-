// src/models/adminModel.ts
import client from '../config/database';
import bcrypt from 'bcrypt';

interface AdminData {
  id: number;
  email: string;
  password: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  updatedAt?: Date;
}

// Fungsi untuk mengambil admin berdasarkan email
export const findAdminByEmail = async (email: string) => {
  try {
    const result = await client.query("SELECT * FROM admins WHERE email = $1", [email]);
    return result.rows[0];  // Mengembalikan admin yang ditemukan berdasarkan email
  } catch (error: unknown) {
    // Menangani error dengan tipe yang benar
    if (error instanceof Error) {
      console.error("Error finding admin by email:", error.message);
    }
    throw new Error("Database query failed");
  }
};

// Fungsi untuk mengambil semua admin
export const findAllAdmins = async () => {
  try {
    const result = await client.query("SELECT * FROM admins");
    return result.rows;  // Mengembalikan semua admin yang ada
  } catch (error: unknown) {
    // Menangani error dengan tipe yang benar
    if (error instanceof Error) {
      console.error("Error finding all admins:", error.message);
    }
    throw new Error("Database query failed");
  }
};

export const updateAdminEmail = async (id: number, email: string): Promise<AdminData> => {
  try {
    // First check if email exists
    const emailCheck = await client.query(
      'SELECT * FROM admins WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      throw new Error('Email already in use');
    }

    const result = await client.query(
      'UPDATE admins SET email = $1 WHERE id = $2 RETURNING *',
      [email, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Admin not found');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating admin email:', error.message);
    }
    throw error;
  }
};

export const updateAdminPassword = async (id: number, password: string): Promise<AdminData> => {
  try {
    // Add password validation
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password in database
    const result = await client.query(
      'UPDATE admins SET password = $1 WHERE id = $2 RETURNING *',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Admin not found');
    }

    // Return admin data without password
    const { password: _, ...adminWithoutPassword } = result.rows[0];
    return adminWithoutPassword as AdminData;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating admin password:', error.message);
    }
    throw error;
  }
};