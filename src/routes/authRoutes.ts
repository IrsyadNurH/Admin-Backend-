import express, { Request, Response } from 'express';
import { forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    await forgotPassword(req, res);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
    try {
      await resetPassword(req, res);
    } catch (err) {
      res.status(500).send('Server error');
    }
  });

export default router;
