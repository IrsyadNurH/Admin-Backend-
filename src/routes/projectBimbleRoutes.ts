import { Router } from 'express';
import { ProjectBimbleModel } from '../models/ProjectBimbleModel';
import pool from '../config/database';

const router = Router();

router.get('/project-bimble', async (req, res) => {
  try {
    const data = await ProjectBimbleModel.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.put('/project-bimble/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content_type, content } = req.body;

    // Log incoming request
    console.log('Update request:', { id, content_type, content });

    // Validate input
    if (!content_type || !content) {
       res.status(400).json({ 
        error: 'Both content_type and content are required' 
      });
    }

    // Check if record exists
    const checkRecord = await pool.query(
      'SELECT * FROM project_bimble WHERE id = $1', 
      [id]
    );

    if (checkRecord.rows.length === 0) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    // Update record
    const query = `
      UPDATE project_bimble 
      SET content_type = $1, 
          content = $2,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING *
    `;

    const result = await pool.query(query, [content_type, content, id]);

    // Log successful update
    console.log('Update successful:', result.rows[0]);

    res.json(result.rows[0]);
    return;
  } catch (err) {
    // Log error details
    console.error('Update error:', err);
    res.status(500).json({
      error: 'Failed to update project_bimble',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

router.post('/project-bimble', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    console.log('Create request body:', items);

    // Validate all items
    for (const item of items) {
      if (!item.content_type || !item.content) {
        res.status(400).json({
          error: 'Both content_type and content are required for each item',
          invalidItem: item
        }); return;
      }
    }

    // Batch insert
    const values = items.map(item => [item.content_type, item.content]);
    const placeholders = values.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',');
    const flatValues = values.flat();

    const query = `
      INSERT INTO project_bimble (content_type, content)
      VALUES ${placeholders}
      RETURNING *
    `;

    const result = await pool.query(query, flatValues);
    console.log('Create successful:', result.rows);
     res.status(201).json(result.rows);
     return;
  } catch (err) {
    console.error('Create error:', err);
     res.status(500).json({
      error: 'Failed to create project_bimble',
      details: err instanceof Error ? err.message : 'Unknown error'
    });return;
  }
});

export default router;