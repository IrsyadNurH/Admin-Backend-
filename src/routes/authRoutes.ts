import express, { Request, Response } from 'express';
import { forgotPassword, resetPassword } from '../controllers/authController';
import { authMiddleware, loginHandler } from '../middleware/authMiddleware';

const router = express.Router();

// Login route
router.post('/login', loginHandler);

// Verify token route
router.get('/verify', authMiddleware, (req: Request, res: Response) => {
  res.json({ 
    success: true,
    user: req.user 
  });
});

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
