import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Get all project testimoni
router.get('/project-testimoni', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM project_testimoni ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project testimoni' });
  }
});

// Get project testimoni by id
router.get('/project-testimoni/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM project_testimoni WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
       res.status(404).json({ error: 'Project testimoni not found' });
       return;
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project testimoni' });
  }
});

// Create project testimoni
router.post('/project-testimoni', async (req: Request, res: Response) => {
  try {
    const { content_type, content } = req.body;
    
    if (!content_type || !content) {
      res.status(400).json({ error: 'Content type and content are required' });
      return ;
    }

    const result = await pool.query(
      'INSERT INTO project_testimoni (content_type, content) VALUES ($1, $2) RETURNING *',
      [content_type, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project testimoni' });
  }
});

// Update project testimoni
router.put('/project-testimoni/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content_type, content } = req.body;

    console.log('Update request:', { id, content_type, content });

    if (!content_type || !content) {
       res.status(400).json({ error: 'Content type and content are required' });
       return;
    }

    const checkRecord = await pool.query(
      'SELECT * FROM project_testimoni WHERE id = $1',
      [id]
    );

    if (checkRecord.rows.length === 0) {
       res.status(404).json({ error: 'Project testimoni not found' });
       return;
    }

    const result = await pool.query(
      `UPDATE project_testimoni 
       SET content_type = $1,
           content = $2,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [content_type, content, id]
    );

    console.log('Update successful:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ 
      error: 'Failed to update project testimoni',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Delete project testimoni
router.delete('/project-testimoni/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM project_testimoni WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project testimoni not found' });
      return ;
    }
    
    res.json({ message: 'Project testimoni deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project testimoni' });
  }
});

export default router;