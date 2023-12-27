import express, { Request, Response, Router } from "express";
import { games, users } from "../../db/db";
import { find } from "../../utils";
import Game from "../../classes/Game";
const router: Router = express.Router();
router.get("/", (req: Request, res: Response) => {
  return res.status(200).send(games);
});
router.post("/", (req: Request, res: Response) => {
  if (!req.body || !req.body.userId || !req.body.stake) {
    res.status(400).send({ message: "User ID and stake are required" });
  }
  const { userId, stake } = req.body;
  const foundUser = find(users, userId, "id");
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

  const game = new Game(userId, stake);
  foundUser.balance -= stake;
  games.push(game);
  res.status(200).send({ message: "Game created" });
});
export default router;
