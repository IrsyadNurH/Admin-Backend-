import pool from '../config/database';

interface FooterData {
  id: number;
  content_type: string;
  content: string;
}

export const FooterModel = {
  findAll: async () => {
    const result = await pool.query('SELECT * FROM footer ORDER BY id');
    return result.rows;
  },

  update: async (id: number, data: Partial<FooterData>) => {
    const result = await pool.query(
      `UPDATE footer 
       SET content_type = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [data.content_type, data.content, id]
    );
    return result.rows[0];
  }
};