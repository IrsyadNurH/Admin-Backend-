import { Request, Response, Router } from "express";
import { upload, imagekit } from "../config/Imagekit";
import pool from '../config/database';
import { getImageKitFileId } from '../utils/imageKitHelper';

const router = Router();

// Get all project testi clients
router.get('/project-testi-client', async (req, res) => {
    try {
      console.log('GET request received for /project-testi-client');
      
      const result = await pool.query(
        'SELECT * FROM project_testi_clients ORDER BY created_at DESC'
      );
      console.log('Query result:', result.rows);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error fetching project testi clients:', error);
      res.status(500).json({ 
        error: 'Failed to fetch project testi clients',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

// Create project testi client
router.post("/project-testi-client", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
       res.status(400).json({ error: "Image file is required" });
       return;
    }

    if (!req.body.name || !req.body.company || !req.body.testimonial) {
       res.status(400).json({ error: "All fields are required" });
       return;
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `project-testi-client-${Date.now()}-${req.file.originalname}`,
      folder: '/project-testi-clients'
    });

    const result = await pool.query(
        'INSERT INTO project_testi_clients (name, company, testimonial, image) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.body.name, req.body.company, req.body.testimonial, uploadResponse.url]
      );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating project testi client:", err);
    res.status(500).json({ 
      error: "Failed to create project testi client",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Update project testi client
router.put('/project-testi-client/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify client exists
    const existingClient = await pool.query(
      'SELECT * FROM project_testi_clients WHERE id = $1',
      [id]
    );

    if (existingClient.rows.length === 0) {
      res.status(404).json({ error: 'Project testi client not found' });
      return;
    }

    let imageUrl = existingClient.rows[0].image;

    // Handle new image upload if provided
    if (req.file) {
      try {
        const uploadResponse = await imagekit.upload({
          file: req.file.buffer.toString('base64'),
          fileName: `project-testi-client-${Date.now()}-${req.file.originalname}`,
          folder: '/project-testi-clients'
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
      UPDATE project_testi_clients 
      SET 
        name = COALESCE($1, name),
        company = COALESCE($2, company),
        testimonial = COALESCE($3, testimonial),
        image = COALESCE($4, image),
        updated_at = CURRENT_TIMESTAMP
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
       res.status(404).json({ error: 'Project testi client not found' });
       return;
    }

    res.json({
      message: 'Project testi client updated successfully',
      client: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating project testi client:', err);
     res.status(500).json({
      error: 'Failed to update project testi client',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Delete project testi client
router.delete('/project-testi-client/:id', async (req: Request, res: Response) => {
  try {
    // First get the client
    const client = await pool.query(
      'SELECT * FROM project_testi_clients WHERE id = $1',
      [req.params.id]
    );

    if (client.rows.length === 0) {
      res.status(404).json({ error: 'Project testi client not found' });
      return;
    }

    // Extract image filename from URL
    const imageUrl = client.rows[0].image;
    const fileId = getImageKitFileId(imageUrl);

    // Delete both image and database record in parallel
    await Promise.all([
      // Delete from ImageKit if image exists
      fileId ? imagekit.deleteFile(fileId).catch(error => {
        console.warn('Failed to delete image from ImageKit:', error);
      }) : Promise.resolve(),

      // Delete from database
      pool.query('DELETE FROM project_testi_clients WHERE id = $1 RETURNING *', [req.params.id])
    ]);

    res.json({ 
      message: 'Project testi client deleted successfully',
      client: client.rows[0]
    });

  } catch (err) {
    console.error('Error deleting project testi client:', err);
    res.status(500).json({
      error: 'Failed to delete project testi client',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;