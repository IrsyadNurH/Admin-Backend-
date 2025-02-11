import { Request, Response, Router } from "express";
import { upload, imagekit } from "../config/Imagekit";
import pool from '../config/database';
import { getImageKitFileId } from '../utils/imageKitHelper';

const router = Router();

// Get all project testimonials
router.get('/project-testimonial', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM project_testimonials ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project testimonials:', error);
    res.status(500).json({ 
      error: 'Failed to fetch project testimonials',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create project testimonial
router.post("/project-testimonial", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    if (!req.body.name || !req.body.company || !req.body.testimonial) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `project-testimonial-${Date.now()}-${req.file.originalname}`,
      folder: '/project-testimonials'
    });

    // Insert into database
    const result = await pool.query(
      'INSERT INTO project_testimonials (name, company, testimonial, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.body.name, req.body.company, req.body.testimonial, uploadResponse.url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating project testimonial:", err);
    res.status(500).json({ 
      error: "Failed to create project testimonial",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Update project testimonial
router.put('/project-testimonial/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify testimonial exists
    const existingTestimonial = await pool.query(
      'SELECT * FROM project_testimonials WHERE id = $1',
      [id]
    );

    if (existingTestimonial.rows.length === 0) {
      res.status(404).json({ error: 'Project testimonial not found' });
      return;
    }

    let imageUrl = existingTestimonial.rows[0].image;

    // Handle new image upload if provided
    if (req.file) {
      try {
        const uploadResponse = await imagekit.upload({
          file: req.file.buffer.toString('base64'),
          fileName: `project-testimonial-${Date.now()}-${req.file.originalname}`,
          folder: '/project-testimonials'
        });
        
        // Delete old image if exists
        if (imageUrl) {
          const fileId = getImageKitFileId(imageUrl);
          if (fileId) {
            try {
              await imagekit.deleteFile(fileId);
            } catch (deleteError) {
              console.warn('Failed to delete old image:', deleteError);
            }
          }
        }
        
        imageUrl = uploadResponse.url;
      } catch (uploadError) {
        res.status(500).json({ 
          error: 'Failed to upload new image',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        });
        return;
      }
    }

    // Update database
    const query = `
      UPDATE project_testimonials 
      SET 
        name = COALESCE($1, name),
        company = COALESCE($2, company),
        testimonial = COALESCE($3, testimonial),
        image = COALESCE($4, image)
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      req.body.name || null,
      req.body.company || null,
      req.body.testimonial || null,
      imageUrl || null,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project testimonial not found' });
      return;
    }

    res.json({
      message: 'Project testimonial updated successfully',
      testimonial: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating project testimonial:', err);
    res.status(500).json({
      error: 'Failed to update project testimonial',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Delete project testimonial
router.delete('/project-testimonial/:id', async (req: Request, res: Response) => {
  try {
    // First get the testimonial
    const testimonial = await pool.query(
      'SELECT * FROM project_testimonials WHERE id = $1',
      [req.params.id]
    );

    if (testimonial.rows.length === 0) {
      res.status(404).json({ error: 'Project testimonial not found' });
      return;
    }

    // Extract image filename from URL
    const imageUrl = testimonial.rows[0].image;
    const filename = imageUrl.split('/').pop(); // Get the last part of URL

    // Delete both image and database record in parallel
    await Promise.all([
      // Delete from ImageKit if image exists
      imageUrl ? imagekit.deleteFile(filename).catch(error => {
        console.warn('Failed to delete image from ImageKit:', error);
        // We still continue even if image deletion fails
      }) : Promise.resolve(),

      // Delete from database
      pool.query('DELETE FROM project_testimonials WHERE id = $1 RETURNING *', [req.params.id])
    ]);

    res.json({ 
      message: 'Project testimonial deleted successfully',
      testimonial: testimonial.rows[0]
    });

  } catch (err) {
    console.error('Error deleting project testimonial:', err);
    res.status(500).json({
      error: 'Failed to delete project testimonial',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;