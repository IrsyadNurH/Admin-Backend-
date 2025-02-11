import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes";  // Pastikan path-nya benar
import aboutUsRoutes from './routes/aboutUsRoutes';
import authRoutes from './routes/authRoutes';
import logoutRouter from './routes/logout'; 
import forgetPasswordRoute from "./routes/forgetPasswordRoute"; // Sesuaikan path dengan lokasi file
import konsultasiRoutes from './routes/konsultasiroute';
import projectBimbleRoutes from './routes/projectBimbleRoutes';
import { Request, Response, NextFunction } from 'express';
import footerRoutes from './routes/footerRoutes'; // Add this import
import kontakKamiRouter from './routes/KontakKamiRoutes';
import programContentRouter from './routes/ProgramContent';
import projectTestimoniRoutes from './routes/ProjectTestimoniRoutes';
import KerjasamaDevRoute from './routes/KerjasamaDevRoute';
import logsRoutes from './routes/logsRoute';
import testimonialRoutes from './routes/testimonialRoute';
import projectTestimonialRouter from './routes/projectTestimonialRoute';

dotenv.config();

const app = express();
app.use(express.json()); 
app.use(aboutUsRoutes);

app.use(cors({
  origin: ['http://localhost:3000','https://www.google.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-timezone', 'Accept','Cross-Origin-Resource-Policy'],
  exposedHeaders: ['Cross-Origin-Resource-Policy']
}));

app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(express.json());
app.use(bodyParser.json());

// Add error logging middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error details:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
});



// Routes API
app.get('/about-us', (req, res) => {
  res.json([{ id: 1, contentType: 'text', content: 'About Us content' }]);
});

// Menggunakan rute admin
app.use("/api", adminRoutes,aboutUsRoutes,authRoutes,logoutRouter,forgetPasswordRoute,konsultasiRoutes,projectBimbleRoutes,footerRoutes,kontakKamiRouter,programContentRouter,projectTestimoniRoutes,KerjasamaDevRoute,logsRoutes,testimonialRoutes,projectTestimonialRouter);  // Pastikan rute /api terhubung ke adminRoutes/aboutUsRoutes

// Error handler untuk menangani kesalahan yang tidak tertangani
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error received:', err);
  console.error('Request details:', req.body);
  res.status(500).send('Something went wrong!');
});


export default app;
