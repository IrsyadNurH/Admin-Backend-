import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Secret key diambil dari environment variable
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string; // Express menggunakan process.env untuk secret key

interface JwtPayload {
  id: string;
  email: string;
}

// Middleware untuk Express
export const authMiddlewareExpress = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email }; // Menambahkan properti user ke req
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

