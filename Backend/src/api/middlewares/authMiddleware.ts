import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// function verifyToken(req: Request, res: Response, next) {
//   const token = req.header("Authorization");
//   if (!token) return res.status(401).json({ error: "Access denied" });
//   try {
//     const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
//     req["userId"] = decoded.userId;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// }
function verifyToken(req: Request, res: Response, next) {
  next();
}

export default verifyToken;
