import { Request, Response } from 'express';
import ProgramContentModel from '../models/ProgramContentModel';

export class ProgramContentController {
  async getAllProgramContent(req: Request, res: Response) {
    try {
      const programContent = await ProgramContentModel.findAll();
      res.status(200).json(programContent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch program content data' });
    }
  }

  async getProgramContentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await ProgramContentModel.findById(Number(id));
      
      if (!content) {
        return res.status(404).json({ error: 'Program content not found' });
      }
      
      res.status(200).json(content);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch program content' });
    }
  }

  async createProgramContent(req: Request, res: Response) {
    const { content_type, content } = req.body;

    if (!content_type || !content) {
      return res.status(400).json({ error: 'Content type and Content are required' });
    }

    try {
      const newContent = await ProgramContentModel.create({ content_type, content });
      res.status(201).json(newContent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create program content' });
    }
  }

  async updateProgramContent(req: Request, res: Response) {
    const { id } = req.params;
    const { content_type, content } = req.body;

    try {
      const updatedContent = await ProgramContentModel.update(Number(id), { 
        content_type, 
        content 
      });
      
      if (!updatedContent) {
        return res.status(404).json({ error: 'Program content not found' });
      }

      res.status(200).json(updatedContent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update program content' });
    }
  }

  async deleteProgramContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedContent = await ProgramContentModel.delete(Number(id));
      
      if (!deletedContent) {
        return res.status(404).json({ error: 'Program content not found' });
      }

      res.status(200).json({ message: 'Program content deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete program content' });
    }
  }
}

export default new ProgramContentController();