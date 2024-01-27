import express, { Request, Response, Router } from "express";
import { db } from "..";
import verifyToken from "../middlewares/authMiddleware";
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

const calcPoints = (cards: (string | number)[]) => {
  let score = 0;
  let ace = 0;
  cards.forEach((card) => {
    if (card === "J" || card === "Q" || card === "K") {
      score += 10;
    } else if (card === "A") {
      ace += 1;
    } else {
      score += card;
    }
  });
  if (ace > 0) {
    if (score + ace * 11 <= 21) {
      score += ace * 11;
    } else {
      score += ace;
    }
  }
  return score;
};
const findWinner = (playerScore, dealerScore) => {
  if (playerScore === 21 && dealerScore === 21) return "draw"; // Obie strony mają Blackjacka
  if (playerScore === dealerScore) return "draw"; // Remis w innych przypadkach

  if (dealerScore === 21) return "dealer"; // Dealer ma Blackjacka
  if (playerScore === 21) return "player"; // Gracz ma Blackjacka

  if (playerScore > 21) return "dealer"; // Gracz przekroczył 21 punktów
  if (dealerScore > 21) return "player"; // Dealer przekroczył 21 punktów

  if (playerScore > dealerScore) return "player"; // Gracz ma więcej punktów
  if (playerScore < dealerScore) return "dealer"; // Dealer ma więcej punktów

  return "draw"; // Pozostałe przypadki remisu
};
router.post(
  "/:gameId/solve",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { gameId } = req.params;
    if (!gameId || !userId) {
      res.status(400).send({ message: "Game not found" });
      return;
    }
    const foundGame = await db.getGame(gameId);
    if (!foundGame) {
      res.status(400).send({ message: "Game not found" });
      return;
    }
    if (foundGame.userId !== userId) {
      res.status(400).send({ message: "Game not found" });
      return;
    }
    if (foundGame.status !== "created") {
      res.status(400).send({ message: "Game already solved" });
      return;
    }
    const foundUser = await db.getUser(userId);
    if (!foundUser) {
      res.status(400).send({ message: "User not found" });
      return;
    }
    const { player_cards, dealer_cards } = foundGame;

    const playerScore = calcPoints(player_cards);
    const dealerScore = calcPoints(dealer_cards);
    const result = findWinner(playerScore, dealerScore);
    if (result === "player") {
      const wonAmount = foundGame.stake * 2;
      const updateUserBalance = await db.updateUser(userId, {
        balance: foundUser.balance + wonAmount,
      });
    } else if (result === "draw") {
      const wonAmount = foundGame.stake;
    } else {
      const wonAmount = 0;
    }
    foundGame.status = "solved";
  },
);

router.post(
  ":gameId/stand",
  verifyToken,
  async (req: Request, res: Response) => {},
);

router.post(
  ":gameId/hit",
  verifyToken,
  async (req: Request, res: Response) => {},
);

export default router;
