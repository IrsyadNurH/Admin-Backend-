import { Request, Response } from 'express';
import { TestimonialModel, TestimonialData } from '../models/TestimonialModel';

export class TestimonialController {
  async getAllTestimonials(req: Request, res: Response) {
    try {
      const testimonials = await TestimonialModel.findAll();
      res.status(200).json(testimonials);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
  }

  async createTestimonial(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const testimonialData = {
        name: req.body.name,
        image_url: req.file,
        university: req.body.university,
        testimonial: req.body.testimonial
      };

      const newTestimonial = await TestimonialModel.create(testimonialData);
      res.status(201).json(newTestimonial);
    } catch (err) {
      console.error('Error creating testimonial:', err);
      res.status(500).json({
        error: 'Failed to create testimonial',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async updateTestimonial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: Partial<TestimonialData> = {
        name: req.body.name,
        university: req.body.university,
        testimonial: req.body.testimonial
      };

      if (req.file) {
        updateData.image_url = req.file;
      }

      const updatedTestimonial = await TestimonialModel.update(
        parseInt(id),
        updateData
      );

      if (!updatedTestimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }

      res.status(200).json(updatedTestimonial);
    } catch (err) {
      console.error('Error updating testimonial:', err);
      res.status(500).json({
        error: 'Failed to update testimonial',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async deleteTestimonial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedTestimonial = await TestimonialModel.delete(parseInt(id));

      if (!deletedTestimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }

      res.status(200).json({ 
        message: 'Testimonial deleted successfully',
        data: deletedTestimonial
      });
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      res.status(500).json({
        error: 'Failed to delete testimonial',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
}

export default new TestimonialController();