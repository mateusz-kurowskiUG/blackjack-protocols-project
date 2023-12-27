import express, { Request, Response, Router } from "express";
import { users } from "../../db/db";
import { isUnique } from "../../utils";
import User from "../../classes/User";
const router: Router = express.Router();
router.get("/", (req: Request, res: Response) => {
  return res.status(200).send(users);
});

router.post("/", (req: Request, res: Response) => {
  if (!req.body || !req.body.name || !req.body.password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }

  if (!isUnique(users, name, "name")) {
    res.status(400).send({ message: "Name must be unique" });
    return;
  }

  const user = new User(name, password);
  users.push(user);
  res.status(200).send(user);
  return;
});

export default router;
