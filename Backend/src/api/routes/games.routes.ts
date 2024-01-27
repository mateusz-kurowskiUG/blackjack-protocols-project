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
  const userId = res.locals["userId"];

  if (!req.body || !req.body.stake) {
    res.status(400).send({ message: "Stake is required" });
    return;
  }
  const { stake } = req.body;
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

  const created = await db.createGame(userId, stake);
  if (!created) {
    res.status(400).send({ message: "Game not created" });
    return;
  }
  res.status(200).send(created);
  return;
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
  if (foundGame.status) foundUser.balance += foundGame.stake;
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
