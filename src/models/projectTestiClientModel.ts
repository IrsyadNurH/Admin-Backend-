import pool from '../config/database';
import { imagekit } from '../config/Imagekit';

export interface ProjectTestiClientData {
  id: number;
  name: string;
  image: Express.Multer.File;
  company: string;
  testimonial: string;
  created_at?: string;
  updated_at?: string;
}

export const ProjectTestimonialModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM project_testimonials ORDER BY created_at DESC');
    return result.rows;
  },

  findById: async (id: number) => {
    const result = await pool.query('SELECT * FROM project_testimonials WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data: Omit<ProjectTestiClientData, "id">) => {
    try {
      // Upload image to ImageKit
      const uploadResponse = await imagekit.upload({
        file: data.image.buffer.toString('base64'),
        fileName: `project-testimonial-${Date.now()}-${data.image.originalname}`,
        folder: '/project-testimonials'
      });

      // Insert into database
      const result = await pool.query(
        'INSERT INTO project_testimonials (name, company, testimonial, image) VALUES ($1, $2, $3, $4) RETURNING *',
        [data.name, data.company, data.testimonial, uploadResponse.url]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating project testimonial:", error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<ProjectTestiClientData>) => {
    try {
      let imageUrl = null;

      if (data.image) {
        const uploadResponse = await imagekit.upload({
          file: data.image.buffer.toString('base64'),
          fileName: `project-testimonial-${Date.now()}-${data.image.originalname}`,
          folder: '/project-testimonials'
        });
        imageUrl = uploadResponse.url;
      }

      const query = `
        UPDATE project_testimonials 
        SET 
          name = COALESCE($1, name),
          company = COALESCE($2, company),
          testimonial = COALESCE($3, testimonial),
          image = COALESCE($4, image),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 
        RETURNING *
      `;

      const result = await pool.query(query, [
        data.name || null,
        data.company || null,
        data.testimonial || null,
        imageUrl || null,
        id
      ]);

      return result.rows[0];
    } catch (error) {
      console.error("Error updating project testimonial:", error);
      throw error;
    }
  },

  delete: async (id: number) => {
    const result = await pool.query(
      'DELETE FROM project_testimonials WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};