import pool from '../config/database';

interface ProjectTestimoniData {
  id?: number;
  content_type: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectTestimoniModel {
  async findAll(): Promise<ProjectTestimoniData[]> {
    const result = await pool.query('SELECT * FROM project_testimoni ORDER BY id');
    return result.rows;
  }

  async findById(id: number): Promise<ProjectTestimoniData | null> {
    const result = await pool.query(
      'SELECT * FROM project_testimoni WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data: Omit<ProjectTestimoniData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTestimoniData> {
    const result = await pool.query(
      'INSERT INTO project_testimoni (content_type, content) VALUES ($1, $2) RETURNING *',
      [data.content_type, data.content]
    );
    return result.rows[0];
  }

  async update(id: number, data: Partial<ProjectTestimoniData>): Promise<ProjectTestimoniData | null> {
    const result = await pool.query(
      `UPDATE project_testimoni 
       SET content_type = $1,
           content = $2,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [data.content_type, data.content, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<ProjectTestimoniData | null> {
    const result = await pool.query(
      'DELETE FROM project_testimoni WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
}

export default new ProjectTestimoniModel();