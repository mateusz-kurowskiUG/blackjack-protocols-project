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

router.get(
  "/balance/:userIdParam",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { userIdParam } = req.params;
    if ((!userIdParam || !userId) && userIdParam !== userId) {
      res.status(400).send({ message: "User not found" });
      return;
    }

    const user = await db.getUser(userId);
    if (!user) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const { balance } = user;
    res.status(200).send({ message: "user balance", balance });
    return;
  },
);

router.get(
  "/data/:userIdParam",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { userIdParam } = req.params;
    if (!userIdParam || !userId || userIdParam !== userId) {
      res.status(400).send({ message: "User not found" });
      return;
    }

    const user = await db.getUser(userId);
    if (!user) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    res.status(200).send(user);
  },
);
router.get(
  "/user/games/:userIdParam",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { userIdParam } = req.params;
    if (!userId || !userIdParam || userIdParam !== userId) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const user = await db.getUser(userId);
    if (!user) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const games = await db.getGamesByUserId(userId);
    res.status(200).send(games);
    return;
  },
);

router.patch(
  "/:userIdParam",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { userIdParam } = req.params;
    if (!userId || !userIdParam || userIdParam !== userId) {
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
  },
);

router.delete(
  "/:userIdParam",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { userIdParam } = req.params;
    if (!userIdParam || !userId || userIdParam !== userId) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const deleted = await db.deleteUser(userIdParam);
    if (!deleted) {
      res.status(400).send({ message: "User not found", idiot: userIdParam });
      return;
    }
    const deletedGames = await db.deleteGamesByUserId(userIdParam);

    res.status(200).send({
      message: "deleted",
      user: deleted,
      gamesDeleted: deletedGames.deletedCount,
    });
    return;
  },
);

export default router;
