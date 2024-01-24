import express, { Request, Response, Router } from "express";
import { db } from "..";
import verifyToken from "../middlewares/authMiddleware";
import { INewGame } from "../../interfaces/interfaces";
const router: Router = express.Router();
router.get("/", verifyToken, async (req: Request, res: Response) => {
  const games = await db.getGames();
  return res.status(200).send(games);
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const game = await db.getGame(id);
  if (!game) {
    res.status(400).send({ message: "Game not found" });
    return;
  }
  res.status(200).send(game);
});

router.post("/", verifyToken, async (req: Request, res: Response) => {
  if (!req.body || !req.body.userId || !req.body.stake) {
    res.status(400).send({ message: "User ID and stake are required" });
  }
  const { userId, stake } = req.body;
  const foundUser = await db.getUser(userId);
  if (!foundUser) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  if (stake > foundUser.balance) {
    res.status(400).send({
      message: "Stake cannot be greater than balance",
      stake: stake,
      balance: foundUser.balance,
    });
    return;
  }
  if (stake < 0) {
    res.status(400).send({ message: "Stake cannot be negative" });
    return;
  }

  const game: INewGame = { userId, stake };
  const created = await db.createGame(userId, game);
  if (!created) {
    res.status(400).send({ message: "Game not created" });
    return;
  }
  res.status(200).send(created);
});

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  const foundGame = await db.getGame(id);
  if (!foundGame) {
    res.status(400).send({ message: "Game not found" });
    return;
  }
  const foundUser = await db.getUser(foundGame.userId);
  if (!foundUser) {
    res.status(400).send({ message: "User not found" });
    return;
  }
  if (foundGame.won) foundUser.balance += foundGame.stake;
  const deleted = await db.deleteGame(id);
  if (!deleted.deletedCount) {
    res.status(400).send({ message: "Game not found" });
    return;
  }
  res.status(200).send({ message: "Game deleted" });
});

router.post(
  "/:id/solve",
  verifyToken,
  async (req: Request, res: Response) => {},
);

export default router;
