import pool from '../config/database';
import { upload, imagekit } from '../config/Imagekit';

export interface TestimonialData {
  id: number;
  name: string;
  image_url : Express.Multer.File;
  university: string;
  testimonial: string;
  created_at?: string;
  updated_at?: string;
}

export const TestimonialModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY id');
    return result.rows;
  },

  create: async (data: Omit<TestimonialData, "id">) => {
    try {
      // Upload the image to ImageKit
      const uploadResponse = await imagekit.upload({
        file: data.image_url.buffer, // Use buffer instead of File object
        fileName: data.image_url.originalname, // Get original file name
        folder: "/testimonials", // Optional: Set ImageKit folder
      });

      // Insert testimonial data into the database with ImageKit URL
      const result = await pool.query(
        `INSERT INTO testimonials (name, image , university, testimonial) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.name, uploadResponse.url, data.university, data.testimonial]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error uploading image or inserting data:", error);
      throw error;
    }
  },


  update: async (id: number, data: Partial<TestimonialData>) => {
    const result = await pool.query(
      `UPDATE testimonials
       SET name = COALESCE($1, name),
           image_url = COALESCE($2, image_url),
           university = COALESCE($3, university),
           testimonial = COALESCE($4, testimonial),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [data.name, data.image_url, data.university, data.testimonial, id]
    );
    return result.rows[0];
  },

  delete: async (id: number) => {
    const result = await pool.query(
      'DELETE FROM testimonials WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};