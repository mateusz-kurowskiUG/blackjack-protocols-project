import express, { Request, Response, Router } from "express";
import { isUnique } from "../../utils";
import User from "../../classes/User";
import { db } from "..";
const router: Router = express.Router();
router.get("/", async (req: Request, res: Response) => {
  const users = await db.getUsers();
  return res.status(200).send(users);
});

router.post("/", async (req: Request, res: Response) => {
  if (!req.body || !req.body.name || !req.body.password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }

  const users = await db.getUsers();

  if (!isUnique(users, name, "name")) {
    res.status(400).send({ message: "Name must be unique" });
    return;
  }

  const user = new User(name, password);
  db.createUser(user);
  res.status(200).send(user);
  return;
});

router.patch("/:id", async (req: Request, res: Response) => {});
export default router;
