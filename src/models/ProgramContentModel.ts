import pool from '../config/database';

interface ProgramContentData {
  content_type: string;
  content: string;
}

export class ProgramContentModel {
  async findAll() {
    const result = await pool.query('SELECT * FROM program_content ORDER BY id');
    return result.rows;
  }

  async findById(id: number) {
    const result = await pool.query('SELECT * FROM program_content WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(data: ProgramContentData) {
    const result = await pool.query(
      'INSERT INTO program_content (content_type, content) VALUES ($1, $2) RETURNING *',
      [data.content_type, data.content]
    );
    return result.rows[0];
  }

  async update(id: number, data: Partial<ProgramContentData>) {
    const result = await pool.query(
      `UPDATE program_content 
       SET content_type = COALESCE($1, content_type),
           content = COALESCE($2, content),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [data.content_type, data.content, id]
    );
    return result.rows[0];
  }

  async delete(id: number) {
    const result = await pool.query(
      'DELETE FROM program_content WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

export default new ProgramContentModel();