import { Pool } from 'pg';
import pool from '../config/database';
import database from '../config/database';

// Membuat interface untuk data AboutUs
export interface AboutUsData {
  id: number;
  contentType: string;
  content: string;
}

// Fungsi untuk mendapatkan semua data "About Us"
export const getAboutUs = async () => {
  try {
    const result = await database.query('SELECT * FROM about_us');
    return result.rows;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw new Error('Database error');
  }
};


// Fungsi untuk mengupdate data "About Us" berdasarkan id
export const updateAboutUs = async (id: number, contentType: string, content: string): Promise<void> => {
  try {
    const result = await pool.query(
      'UPDATE about_us SET content_type = $1, content = $2 WHERE id = $3',
      [contentType, content, id]
    );
    if (result.rowCount === 0) {
      throw new Error(`No record found with id ${id}`);
    }
  } catch (err: any) {
    console.error('Error updating data:', err);
    throw new Error(`Error updating data: ${err.message}`);
  }
};


// Fungsi untuk memasukkan data "About Us" ke dalam database
export const insertAboutUs = async (contentType: string, content: string): Promise<void> => {
  if (!contentType || !content) {
    throw new Error('contentType and content are required');
  }
  try {
    await pool.query(
      'INSERT INTO about_us (content_type, content) VALUES ($1, $2)',
      [contentType, content]
    );
  } catch (err) {
    console.error('Error inserting data:', err); // Log error yang lebih jelas
    throw new Error('Error inserting data');
  }
}