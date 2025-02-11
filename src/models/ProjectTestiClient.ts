import pool from '../config/database';
import { upload, imagekit } from '../config/Imagekit';

export interface ProjectTestiClientData {
  id: number;
  name: string;
  image_url: Express.Multer.File;
  company: string;
  testimonial: string;
  created_at?: string;
  updated_at?: string;
}

export const ProjectTestiClientModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM project_testi_clients ORDER BY id');
    return result.rows;
  },

  create: async (data: Omit<ProjectTestiClientData, "id">) => {
    try {
      const uploadResponse = await imagekit.upload({
        file: data.image_url.buffer,
        fileName: data.image_url.originalname,
        folder: "/project-testi-clients",
      });

      const result = await pool.query(
        `INSERT INTO project_testi_clients (name, image, company, testimonial) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.name, uploadResponse.url, data.company, data.testimonial]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error uploading image or inserting data:", error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<ProjectTestiClientData>) => {
    const result = await pool.query(
      `UPDATE project_testi_clients
       SET name = COALESCE($1, name),
           image_url = COALESCE($2, image_url),
           company = COALESCE($3, company),
           testimonial = COALESCE($4, testimonial),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [data.name, data.image_url, data.company, data.testimonial, id]
    );
    return result.rows[0];
  },

  delete: async (id: number) => {
    const result = await pool.query(
      'DELETE FROM project_testi_clients WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};