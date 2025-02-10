import * as bcrypt from 'bcrypt';
import pool from '../config/database';

const hashPasswords = async () => {
  try {
    const result = await pool.query('SELECT id, password FROM admins');

    for (const admin of result.rows) {
      const { id, password } = admin;
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE admins SET password = $1 WHERE id = $2', [hashedPassword, id]);
      console.log(`Password untuk admin dengan ID ${id} berhasil di-hash.`);
    }

    console.log("Semua password berhasil di-hash.");
  } catch (error) {
    console.error("Terjadi kesalahan saat meng-hash password:", error);
  } finally {
    pool.end();
  }
};

hashPasswords();
