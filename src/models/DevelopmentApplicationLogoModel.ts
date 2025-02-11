import pool from '../config/database';
import { imagekit } from '../config/Imagekit';

export interface DevelopmentApplicationLogoData {
  id: number;
  image: string;
  created_at?: string;
  updated_at?: string;
}

export const DevelopmentApplicationLogoModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM development_application_logos ORDER BY created_at DESC');
    return result.rows;
  },

  create: async (imageUrl: string) => {
    const result = await pool.query(
      'INSERT INTO development_application_logos (image) VALUES ($1) RETURNING *',
      [imageUrl]
    );
    return result.rows[0];
  },

  update: async (id: number, imageUrl: string) => {
    const result = await pool.query(
      'UPDATE development_application_logos SET image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [imageUrl, id]
    );
    return result.rows[0];
  },

  delete: async (id: number) => {
    const result = await pool.query(
      'DELETE FROM development_application_logos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};