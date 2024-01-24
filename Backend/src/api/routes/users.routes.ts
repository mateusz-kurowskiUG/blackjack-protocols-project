import express, { Request, Response, Router } from "express";
import { db } from "..";
import verifyToken from "../middlewares/authMiddleware";

const router: Router = express.Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    const users = await db.getUsers();
    res.status(200).send(users);
    return;
  }

  const users = await db.getUsersByNameRegex(name);
  res.status(200).send(users);
});

router.get("/:userId", verifyToken, async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const user = await db.getUser(userId);
  if (!user) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  res.status(200).send(user);
});
router.get(
  "/:userId/balance",
  verifyToken,
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const user = await db.getUser(userId);
    if (!user) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const { balance } = user;
    res.status(200).send({ balance });
  },
);

router.patch("/:userId", verifyToken, async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const { name, balance, password } = req.body;
  if (!name && !balance && !password) {
    res.status(400).send({ message: "No data to change provided" });
    return;
  }
  const oldUser = await db.getUser(userId);
  if (!oldUser) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const newUser = {
    name: name || oldUser.name,
    balance: balance || oldUser.balance,
    password: password || oldUser.password,
  };

  const updated = await db.updateUser(userId, { userId, ...newUser });
  if (!updated) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  res.status(200).send({ message: "updated", user: updated });
  return;
});

router.delete("/:userId", verifyToken, async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const deleted = await db.deleteUser(userId);
  if (!deleted) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  const deletedGames = await db.deleteGamesByUserId(userId);

  res.status(200).send({
    message: "deleted",
    user: deleted,
    gamesDeleted: deletedGames.deletedCount,
  });
  return;
});

export default router;
