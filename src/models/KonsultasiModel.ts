import pool from '../config/database';

export class KonsultasiModel {
  async findAll() {
    const result = await pool.query('SELECT * FROM konsultasi ORDER BY id');
    return result.rows;
  }

  async create(data: { contentType: string; content: string }) {
    const result = await pool.query(
      'INSERT INTO konsultasi (content_type, content) VALUES ($1, $2) RETURNING *',
      [data.contentType, data.content]
    );
    return result.rows[0];
  }

  async update(id: number, data: { contentType?: string; content?: string }) {
    const result = await pool.query(
      'UPDATE konsultasi SET content_type = COALESCE($1, content_type), content = COALESCE($2, content) WHERE id = $3 RETURNING *',
      [data.contentType, data.content, id]
    );
    return result.rows[0];
  }

  async delete(id: number) {
    const result = await pool.query('DELETE FROM konsultasi WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}