import express from 'express';
import { getAboutUs, updateAboutUs, insertAboutUs } from '../models/AboutUs';

const router = express.Router();

// Endpoint untuk mendapatkan semua data "About Us"
router.get('/about-us', async (req, res) => {
  try {
    const aboutUsData = await getAboutUs();
    res.json(aboutUsData);
  } catch (err: any) {  // Menggunakan 'any' untuk 'err'
    console.error('Error fetching data: ', err);
    res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
});



// Endpoint untuk mengupdate data "About Us" berdasarkan ID
router.put('/about-us/:id', async (req, res) => {
  const { id } = req.params;
  const { content_type, content } = req.body;

  // Validasi jika ID atau konten yang dikirim valid
  if (!id || !content_type || !content) {
     res.status(400).json({ message: 'ID, contentType, and content are required' });
     return;
    }

  try {
    // Lakukan pembaruan pada data berdasarkan ID
    await updateAboutUs(Number(id), content_type, content);
    res.json({ message: 'Data updated successfully' });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ message: 'Error updating data', error: (err as Error).message });
  }
});



// Endpoint untuk menambahkan data baru "About Us"
router.post('/about-us', async (req, res) => {
  const { content_type, content } = req.body;

  try {
    await insertAboutUs(content_type, content);
    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error inserting data' });
  }
});

export default router;
