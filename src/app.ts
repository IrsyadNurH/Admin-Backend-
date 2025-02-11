import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
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
import loginRouter from "./routes/loginRouter";
import adminRouterDanger from "./routes/adminRoutes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(aboutUsRoutes);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-timezone', 'Accept']
}));

app.use(express.json());
app.use(bodyParser.json());

// Add error logging middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error details:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
  next()
});



// Routes API
app.get('/about-us', (req, res) => {
  res.json([{ id: 1, contentType: 'text', content: 'About Us content' }]);
});

// route non login user
app.use("/api", loginRouter);
//pisah antara route Logged In user dan Non-Logged In user
app.use("/api", adminRouterDanger, aboutUsRoutes, authRoutes, logoutRouter, forgetPasswordRoute, konsultasiRoutes, projectBimbleRoutes, footerRoutes, kontakKamiRouter, programContentRouter, projectTestimoniRoutes, KerjasamaDevRoute, logsRoutes, testimonialRoutes)

//Redundant, ada di line 38-44
// Error handler untuk menangani kesalahan yang tidak tertangani
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error('Error received:', err);
//   console.error('Request details:', req.body);
//   res.status(500).send('Something went wrong!');
// });


export default app;
