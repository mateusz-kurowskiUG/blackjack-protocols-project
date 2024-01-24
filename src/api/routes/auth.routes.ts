import express, { Request, Response, Router } from "express";
import { db } from "..";
import jwt from "jsonwebtoken";
const router: Router = express.Router();

const genToken = (username: string) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
};

router.get("/logout", async (req: Request, res: Response) => {});

router.post("/login", async (req: Request, res: Response) => {
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }
  const authenticated = await db.authenticateUser(name, password);
  if (!authenticated) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const token = genToken(name);
  res.status(200).send({ token: token });
  return;
});

router.post("/register", async (req: Request, res: Response) => {
  if (!req.body || !req.body.name || !req.body.password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }
  const user = { name, password };
  const response = await db.createUser(user);
  if (!response) {
    res.status(400).send({ message: "User not created" });
    return;
  }

  res.status(200).send(response);
  return;
});
export default router;
