import { Router } from 'express';
import { FooterModel } from '../models/FooterModel';
import pool from '../config/database';

const router = Router();

router.get('/footer', async (req, res) => {
  try {
    const data = await FooterModel.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.put('/footer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content_type, content } = req.body;

    if (!content_type || !content) {
       res.status(400).json({ error: 'Content type and content are required' });
       return;
    }

    const updated = await FooterModel.update(Number(id), { content_type, content });
    if (!updated) {
       res.status(404).json({ error: 'Record not found' });
      return;
    }
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

router.post('/footer', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    console.log('Create request body:', items);

    // Validate all items
    for (const item of items) {
      if (!item.content_type || !item.content) {
        res.status(400).json({
          error: 'Both content_type and content are required for each item',
          invalidItem: item
        }); 
        return;
      }
    }

    // Batch insert
    const values = items.map(item => [item.content_type, item.content]);
    const placeholders = values.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',');
    const flatValues = values.flat();

    const query = `
      INSERT INTO footer (content_type, content)
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
      error: 'Failed to create footer',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
    return;
  }
});

export default router;