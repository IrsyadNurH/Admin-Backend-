import { Router, Request, Response, RequestHandler } from 'express';
import pool from '../config/database';

const router = Router();

// Get all konsultasi
router.get('/konsultasi', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM konsultasi ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch konsultasi' });
  }
});

// Create konsultasi
router.post('/konsultasi', async (req, res) => {
  const { contentType, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO konsultasi (content_type, content) VALUES ($1, $2) RETURNING *',
      [contentType, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create konsultasi' });
  }
});

router.put('/konsultasi/:id', async (req, res) => {
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
      'SELECT * FROM konsultasi WHERE id = $1', 
      [id]
    );

    if (checkRecord.rows.length === 0) {
       res.status(404).json({ error: 'Record not found' });
    }

    // Update record
    const query = `
      UPDATE konsultasi 
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

  } catch (err) {
    // Log error details
    console.error('Update error:', err);
   res.status(500).json({
      error: 'Failed to update konsultasi',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Delete konsultasi
router.delete('/konsultasi/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM konsultasi WHERE id = $1', [id]);
    res.json({ message: 'Konsultasi deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete konsultasi' });
  }
});

export default router;