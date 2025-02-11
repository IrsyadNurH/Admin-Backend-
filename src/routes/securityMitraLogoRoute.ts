import { Request, Response, Router } from "express";
import { upload, imagekit } from "../config/Imagekit";
import pool from '../config/database';
import { getImageKitFileId } from '../utils/imageKitHelper';

const router = Router();

router.get('/security-mitra-logos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM security_mitra_logos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching security mitra logos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch security mitra logos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post("/security-mitra-logos", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `security-mitra-logo-${Date.now()}-${req.file.originalname}`,
      folder: '/security-mitra-logos'
    });

    const result = await pool.query(
      'INSERT INTO security_mitra_logos (image) VALUES ($1) RETURNING *',
      [uploadResponse.url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating security mitra logo:", err);
    res.status(500).json({ 
      error: "Failed to create security mitra logo",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

router.put('/security-mitra-logos/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `security-mitra-logo-${Date.now()}-${req.file.originalname}`,
      folder: '/security-mitra-logos'
    });

    const result = await pool.query(
      'UPDATE security_mitra_logos SET image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [uploadResponse.url, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Security mitra logo not found' });
      return;
    }

    res.json({
      message: 'Security mitra logo updated successfully',
      logo: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating security mitra logo:', err);
    res.status(500).json({
      error: 'Failed to update security mitra logo',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

router.delete('/security-mitra-logos/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM security_mitra_logos WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Security mitra logo not found' });
      return;
    }

    res.json({ 
      message: 'Security mitra logo deleted successfully',
      logo: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting security mitra logo:', err);
    res.status(500).json({
      error: 'Failed to delete security mitra logo',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;