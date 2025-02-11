import { Request, Response, Router } from "express";
import { upload, imagekit } from "../config/Imagekit";
import pool from '../config/database';
import { getImageKitFileId } from '../utils/imageKitHelper';

const router = Router();

router.get('/dokumentasi', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dokumentasi ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dokumentasi:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dokumentasi',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post("/dokumentasi", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `dokumentasi-${Date.now()}-${req.file.originalname}`,
      folder: '/dokumentasi'
    });

    const result = await pool.query(
      'INSERT INTO dokumentasi (image) VALUES ($1) RETURNING *',
      [uploadResponse.url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating dokumentasi:", err);
    res.status(500).json({ 
      error: "Failed to create dokumentasi",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

router.put('/dokumentasi/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `dokumentasi-${Date.now()}-${req.file.originalname}`,
      folder: '/dokumentasi'
    });

    const result = await pool.query(
      'UPDATE dokumentasi SET image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [uploadResponse.url, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Dokumentasi not found' });
      return;
    }

    res.json({
      message: 'Dokumentasi updated successfully',
      dokumentasi: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating dokumentasi:', err);
    res.status(500).json({
      error: 'Failed to update dokumentasi',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

router.delete('/dokumentasi/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dokumentasi = await pool.query(
      'SELECT * FROM dokumentasi WHERE id = $1',
      [id]
    );

    if (dokumentasi.rows.length === 0) {
      res.status(404).json({ error: 'Dokumentasi not found' });
      return;
    }

    const imageUrl = dokumentasi.rows[0].image;
    const fileId = getImageKitFileId(imageUrl);

    await Promise.all([
      fileId ? imagekit.deleteFile(fileId).catch(error => {
        console.warn('Failed to delete image from ImageKit:', error);
      }) : Promise.resolve(),
      pool.query('DELETE FROM dokumentasi WHERE id = $1', [id])
    ]);

    res.json({ 
      message: 'Dokumentasi deleted successfully',
      dokumentasi: dokumentasi.rows[0]
    });
  } catch (err) {
    console.error('Error deleting dokumentasi:', err);
    res.status(500).json({
      error: 'Failed to delete dokumentasi',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;