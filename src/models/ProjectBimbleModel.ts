import pool from '../config/database';

interface ProjectBimbleData {
  id: number;
  content_type: string;
  content: string;
}

export const ProjectBimbleModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM project_bimble ORDER BY id');
    return result.rows;
  },

  create: async (data: Omit<ProjectBimbleData, 'id'>) => {
    const result = await pool.query(
      `INSERT INTO project_bimble (content_type, content) 
       VALUES ($1, $2) 
       RETURNING *`,
      [data.content_type, data.content]
    );
    return result.rows[0];
  },

  update: async (id: number, data: Partial<ProjectBimbleData>) => {
    const result = await pool.query(
      `UPDATE project_bimble 
       SET content_type = $1, content = $2 
       WHERE id = $3 RETURNING *`,
      [data.content_type, data.content, id]
    );
    return result.rows[0];
  }
};