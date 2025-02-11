import { Request, Response } from 'express';
import { DevelopmentApplicationLogoModel } from '../models/DevelopmentApplicationLogoModel';
import { imagekit } from '../config/Imagekit';

export class DevelopmentApplicationLogoController {
  async getAllLogos(req: Request, res: Response) {
    try {
      const logos = await DevelopmentApplicationLogoModel.findAll();
      res.json(logos);
    } catch (err) {
      console.error('Error fetching logos:', err);
      res.status(500).json({ error: 'Failed to fetch logos' });
    }
  }

  async createLogo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const uploadResponse = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `dev-app-logo-${Date.now()}-${req.file.originalname}`,
        folder: '/development-app-logos'
      });

      const newLogo = await DevelopmentApplicationLogoModel.create(uploadResponse.url);
      res.status(201).json(newLogo);
    } catch (err) {
      console.error('Error creating logo:', err);
      res.status(500).json({ error: 'Failed to create logo' });
    }
  }

  async updateLogo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const uploadResponse = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `dev-app-logo-${Date.now()}-${req.file.originalname}`,
        folder: '/development-app-logos'
      });

      const updatedLogo = await DevelopmentApplicationLogoModel.update(parseInt(id), uploadResponse.url);
      
      if (!updatedLogo) {
        return res.status(404).json({ error: 'Logo not found' });
      }

      res.json(updatedLogo);
    } catch (err) {
      console.error('Error updating logo:', err);
      res.status(500).json({ error: 'Failed to update logo' });
    }
  }

  async deleteLogo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedLogo = await DevelopmentApplicationLogoModel.delete(parseInt(id));

      if (!deletedLogo) {
        return res.status(404).json({ error: 'Logo not found' });
      }

      res.json({ message: 'Logo deleted successfully' });
    } catch (err) {
      console.error('Error deleting logo:', err);
      res.status(500).json({ error: 'Failed to delete logo' });
    }
  }
}

export default new DevelopmentApplicationLogoController();