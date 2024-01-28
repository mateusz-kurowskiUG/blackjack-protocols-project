import express, { Request, Response, Router } from "express";
import { db } from "..";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {});

router.post("/private", verifyToken, async (req: Request, res: Response) => {
    const {name,password} = req.body;
    
});
router.post(
  "/private/login",
  verifyToken,
  async (req: Request, res: Response) => {},
);

export default router;
