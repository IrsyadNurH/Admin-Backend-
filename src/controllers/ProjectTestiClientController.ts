import { Request, Response } from 'express';
import { ProjectTestiClientModel, ProjectTestiClientData } from '../models/ProjectTestiClient';

export class ProjectTestiClientController {
  async getAllProjectTestiClients(req: Request, res: Response) {
    try {
      const projectTestiClients = await ProjectTestiClientModel.findAll();
      res.status(200).json(projectTestiClients);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch project client testimonials' });
    }
  }

  async createProjectTestiClient(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const projectTestiClientData = {
        name: req.body.name,
        image_url: req.file,
        company: req.body.company,
        testimonial: req.body.testimonial
      };

      const newProjectTestiClient = await ProjectTestiClientModel.create(projectTestiClientData);
      res.status(201).json(newProjectTestiClient);
    } catch (err) {
      console.error('Error creating project client testimonial:', err);
      res.status(500).json({
        error: 'Failed to create project client testimonial',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async updateProjectTestiClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: Partial<ProjectTestiClientData> = {
        name: req.body.name,
        company: req.body.company,
        testimonial: req.body.testimonial
      };

      if (req.file) {
        updateData.image_url = req.file;
      }

      const updatedProjectTestiClient = await ProjectTestiClientModel.update(
        parseInt(id),
        updateData
      );

      if (!updatedProjectTestiClient) {
        return res.status(404).json({ error: 'Project client testimonial not found' });
      }

      res.status(200).json(updatedProjectTestiClient);
    } catch (err) {
      console.error('Error updating project client testimonial:', err);
      res.status(500).json({
        error: 'Failed to update project client testimonial',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async deleteProjectTestiClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedProjectTestiClient = await ProjectTestiClientModel.delete(parseInt(id));

      if (!deletedProjectTestiClient) {
        return res.status(404).json({ error: 'Project client testimonial not found' });
      }

      res.status(200).json({ 
        message: 'Project client testimonial deleted successfully',
        data: deletedProjectTestiClient
      });
    } catch (err) {
      console.error('Error deleting project client testimonial:', err);
      res.status(500).json({
        error: 'Failed to delete project client testimonial',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
}

export default new ProjectTestiClientController();