import pool from '../config/database';

interface KerjaSamaDevData {
  id?: number;
  content_type: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class KerjaSamaDevModel {
  async findAll(): Promise<KerjaSamaDevData[]> {
    const result = await pool.query('SELECT * FROM kerjasama_dev ORDER BY id');
    return result.rows;
  }

  async findById(id: number): Promise<KerjaSamaDevData | null> {
    const result = await pool.query(
      'SELECT * FROM kerjasama_dev WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data: KerjaSamaDevData): Promise<KerjaSamaDevData> {
    const result = await pool.query(
      'INSERT INTO kerjasama_dev (content_type, content) VALUES ($1, $2) RETURNING *',
      [data.content_type, data.content]
    );
    return result.rows[0];
  }

  async update(id: number, data: Partial<KerjaSamaDevData>): Promise<KerjaSamaDevData | null> {
    const result = await pool.query(
      `UPDATE kerjasama_dev 
       SET content_type = COALESCE($1, content_type),
           content = COALESCE($2, content),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [data.content_type, data.content, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<KerjaSamaDevData | null> {
    const result = await pool.query(
      'DELETE FROM kerjasama_dev WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
}

export default new KerjaSamaDevModel();