import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Get all kerjasama dev
router.get('/kerjasama-dev', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM kerjasama_dev ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kerjasama dev' });
  }
});

// Get kerjasama dev by id
router.get('/kerjasama-dev/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM kerjasama_dev WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Kerjasama dev not found' });
      return ;
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kerjasama dev' });
  }
});

// Create kerjasama dev
router.post('/kerjasama-dev', async (req: Request, res: Response) => {
  try {
    const { content_type, content } = req.body;
    
    if (!content_type || !content) {
      res.status(400).json({ error: 'Content type and content are required' });
      return ;
    }

    const result = await pool.query(
      'INSERT INTO kerjasama_dev (content_type, content) VALUES ($1, $2) RETURNING *',
      [content_type, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create kerjasama dev' });
  }
});

// Update kerjasama dev
router.put('/kerjasama-dev/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content_type, content } = req.body;

    if (!content_type || !content) {
      res.status(400).json({ error: 'Content type and content are required' });
      return;
    }

    const checkRecord = await pool.query(
      'SELECT * FROM kerjasama_dev WHERE id = $1',
      [id]
    );

    if (checkRecord.rows.length === 0) {
      res.status(404).json({ error: 'Kerjasama dev not found' });
      return ;
    }

    const result = await pool.query(
      `UPDATE kerjasama_dev 
       SET content_type = $1,
           content = $2,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [content_type, content, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update kerjasama dev' });
  }
});

// Delete kerjasama dev
router.delete('/kerjasama-dev/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM kerjasama_dev WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
       res.status(404).json({ error: 'Kerjasama dev not found' });
       return;
    }
    
    res.json({ message: 'Kerjasama dev deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete kerjasama dev' });
  }
});

export default router;