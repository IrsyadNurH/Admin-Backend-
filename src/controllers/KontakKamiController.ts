import { Request, Response } from 'express';
import KontakKamiModel from '../models/KotankKami';

export class KontakKamiController {
  // Get all Kontak Kami data
  async getAllKontakKami(req: Request, res: Response) {
    try {
      const kontakKamiData = await KontakKamiModel.findAll();
      res.status(200).json(kontakKamiData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch Kontak Kami data' });
    }
  }

  // Get Kontak Kami by ID
  async getKontakKamiById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const kontakKami = await KontakKamiModel.findById(Number(id));
      
      if (!kontakKami) {
        return res.status(404).json({ error: 'Kontak Kami not found' });
      }
      
      res.status(200).json(kontakKami);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch Kontak Kami data' });
    }
  }

  // Create new Kontak Kami data
  async createKontakKami(req: Request, res: Response) {
    const { content_type, content } = req.body;

    if (!content_type || !content) {
      return res.status(400).json({ error: 'Content type and Content are required' });
    }

    try {
      const newKontakKami = await KontakKamiModel.create({ content_type, content });
      res.status(201).json(newKontakKami);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create Kontak Kami data' });
    }
  }

  // Update Kontak Kami data
  async updateKontakKami(req: Request, res: Response) {
    const { id } = req.params;
    const { content_type, content } = req.body;

    if (!id || !content_type || !content) {
      return res.status(400).json({ error: 'ID, Content type and Content are required' });
    }

    try {
      const updatedKontakKami = await KontakKamiModel.update(Number(id), { content_type, content });
      
      if (!updatedKontakKami) {
        return res.status(404).json({ error: 'Kontak Kami not found' });
      }

      res.status(200).json(updatedKontakKami);
    } catch (err) {
      console.error('Error updating Kontak Kami:', err);
      res.status(500).json({ error: 'Failed to update Kontak Kami data' });
    }
  }

  // Delete Kontak Kami data
  async deleteKontakKami(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const deletedKontakKami = await KontakKamiModel.delete(Number(id));
      
      if (!deletedKontakKami) {
        return res.status(404).json({ error: 'Kontak Kami not found' });
      }

      res.status(200).json({ message: 'Kontak Kami deleted successfully' });
    } catch (err) {
      console.error('Error deleting Kontak Kami:', err);
      res.status(500).json({ error: 'Failed to delete Kontak Kami data' });
    }
  }
}

export default new KontakKamiController();