import express, { Request, Response, Router } from "express";
import { db } from "..";
import jwt from "jsonwebtoken";
import { mqttClient } from "../../mqtt";
const router: Router = express.Router();

const genToken = ({
  userId,
  name,
  balance,
}: {
  userId: string;
  name: string;
  balance: number;
}) => {
  return jwt.sign({ userId, name, balance }, process.env.TOKEN_SECRET!, {
    expiresIn: "10h",
  });
};

router.post("/login", async (req: Request, res: Response) => {
  const { name, password } = req.body;
  if (!name || !password) {
    res.status(400).send({ message: "Name and password are required" });
    return;
  }
  const user = await db.authenticateUser(name, password);
  if (!user) {
    res.status(400).send({ loggedIn: false, message: "User not found" });
    return;
  }
  const token = genToken({
    userId: user.userId,
    name: user.name,
    balance: user.balance,
  });
  res.cookie("token", token, { httpOnly: true });
  res.cookie("userId", user.userId, { httpOnly: true });
  res.cookie("username", user.name, { httpOnly: true });
  res.status(200).send({ loggedIn: true });
  setTimeout(() => {
    mqttClient.publish(`users/${user.userId}`, "MQTT:You logged in");
  }, 1000);
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

router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.clearCookie("userId");
  res.clearCookie("username");
  res.status(200).send({ message: "Logged out" });
  return;
});
export default router;
