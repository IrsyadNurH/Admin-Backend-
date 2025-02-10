import { Request, Response } from 'express';
import ProjectTestimoniModel from '../models/ProjectTestimoniModel';

export class ProjectTestimoniController {
  async getAllProjectTestimoni(req: Request, res: Response) {
    try {
      const projectTestimoni = await ProjectTestimoniModel.findAll();
      res.status(200).json(projectTestimoni);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch project testimoni data' });
    }
  }

  async getProjectTestimoniById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const testimoni = await ProjectTestimoniModel.findById(Number(id));
      
      if (!testimoni) {
        return res.status(404).json({ error: 'Project testimoni not found' });
      }
      
      res.status(200).json(testimoni);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch project testimoni' });
    }
  }

  async createProjectTestimoni(req: Request, res: Response) {
    try {
      const { content_type, content } = req.body;

      if (!content_type || !content) {
        return res.status(400).json({ error: 'Content type and content are required' });
      }

      const newTestimoni = await ProjectTestimoniModel.create({ content_type, content });
      res.status(201).json(newTestimoni);
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        error: 'Failed to create project testimoni',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async updateProjectTestimoni(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content_type, content } = req.body;

      if (!content_type || !content) {
        return res.status(400).json({ error: 'Content type and content are required' });
      }

      const testimoni = await ProjectTestimoniModel.findById(Number(id));
      if (!testimoni) {
        return res.status(404).json({ error: 'Project testimoni not found' });
      }

      const updatedTestimoni = await ProjectTestimoniModel.update(Number(id), { 
        content_type, 
        content 
      });
      
      res.status(200).json(updatedTestimoni);
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        error: 'Failed to update project testimoni',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async deleteProjectTestimoni(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const testimoni = await ProjectTestimoniModel.findById(Number(id));
      if (!testimoni) {
        return res.status(404).json({ error: 'Project testimoni not found' });
      }

      await ProjectTestimoniModel.delete(Number(id));
      res.status(200).json({ message: 'Project testimoni deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ 
        error: 'Failed to delete project testimoni',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
}

export default new ProjectTestimoniController();