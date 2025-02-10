import { Request, Response } from 'express';
import { getAboutUs, insertAboutUs, updateAboutUs } from '../models/AboutUs';
import { AboutUsData } from '../models/AboutUs';

// Get all About Us data
export const getAllAboutUsHandler = async (req: Request, res: Response) => {
  try {
    const aboutUsData = await getAboutUs();
    res.status(200).json(aboutUsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch About Us data' });
  }
};

// Create new About Us data
export const createAboutUsHandler = async (req: Request, res: Response) => {
  const { contentType, content } = req.body;

  if (!contentType || !content) {
    return res.status(400).json({ error: 'ContentType and Content are required' });
  }

  try {
    await insertAboutUs(contentType, content);
    res.status(201).json({ message: 'Data created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create About Us data' });
  }
};

// Update About Us data
export const updateAboutUsHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { contentType, content } = req.body;

  if (!id || !contentType || !content) {
    return res.status(400).json({ error: 'ID, ContentType and Content are required' });
  }

  try {
    await updateAboutUs(Number(id), contentType, content);
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (err: any) {
    console.error('Error updating About Us:', err);
    if (err.message.includes('No record found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update About Us data' });
  }
};