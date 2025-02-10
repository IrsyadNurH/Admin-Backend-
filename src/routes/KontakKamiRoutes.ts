import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Get all kontak kami
router.get('/kontak-kami', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM kontak_kami ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kontak kami' });
  }
});

// Create kontak kami
router.post('/kontak-kami', async (req: Request, res: Response) => {
  const { content_type, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO kontak_kami (content_type, content) VALUES ($1, $2) RETURNING *',
      [content_type, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create kontak kami' });
  }
});

// Update kontak kami
router.put('/kontak-kami/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content_type, content } = req.body;

    console.log('Update request:', { id, content_type, content });

    if (!content_type || !content) {
       res.status(400).json({ 
        error: 'Both content_type and content are required' 
      });return;
    }

    const checkRecord = await pool.query(
      'SELECT * FROM kontak_kami WHERE id = $1', 
      [id]
    );

    if (checkRecord.rows.length === 0) {
       res.status(404).json({ error: 'Record not found' });
       return;
    }

    const query = `
      UPDATE kontak_kami 
      SET content_type = $1, 
          content = $2,
          "updatedAt" = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING *
    `;

    const result = await pool.query(query, [content_type, content, id]);
    console.log('Update successful:', result.rows[0]);
    
    res.json(result.rows[0]);

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({
      error: 'Failed to update kontak kami',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Delete kontak kami
router.delete('/kontak-kami/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kontak_kami WHERE id = $1', [id]);
    res.json({ message: 'Kontak kami deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete kontak kami' });
  }
});

export default router;