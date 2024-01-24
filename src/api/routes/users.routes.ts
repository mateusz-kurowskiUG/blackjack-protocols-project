import express, { Request, Response, Router } from "express";
import { isUnique } from "../../utils";
import { db } from "..";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    const users = await db.getUsers();
    res.status(200).send(users);
    return;
  }
  const users = await db.getUsersByNameRegex(name);
  res.status(200).send(users);
});



router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const user = await db.getUser(id);
  if (!user) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  res.status(200).send(user);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const { name, balance, password } = req.body;
  if (!name && !balance && !password) {
    res.status(400).send({ message: "No data to change provided" });
    return;
  }
  const oldUser = await db.getUser(id);
  if (!oldUser) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const newUser = {
    name: name || oldUser.name,
    balance: balance || oldUser.balance,
    password: password || oldUser.password,
  };

  const updated = await db.updateUser(id, { id, ...newUser });
  if (!updated) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  res.status(200).send({ message: "updated", user: updated });
  return;
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const deleted = await db.deleteUser(id);
  if (!deleted) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const deletedGames = await db.deleteGamesByUserId(id);

  res.status(200).send({
    message: "deleted",
    user: deleted,
    gamesDeleted: deletedGames.deletedCount,
  });
  return;
});

export default router;
