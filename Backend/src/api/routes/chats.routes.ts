import express, { Request, Response, Router } from "express";
import { db } from "..";
import verifyToken from "../middlewares/authMiddleware";
import { mqttClient } from "../../mqtt";
const router: Router = express.Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  const chats = await db.getChats();
  return res.status(200).send(chats);
});

router.post("/private", verifyToken, async (req: Request, res: Response) => {
  const { name, password } = req.body;
  if (!name || !password)
    return res.status(400).send("Name and password are required");
  const userId = res.locals["userId"];
  const chat = await db.createPrivateChat(name, password, userId);
  if (!chat) return res.status(400).send("Chat already exists");
  return res.status(201).send(chat);
});

router.delete("/private", verifyToken, async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = res.locals["userId"];
  const chat = await db.deletePrivateChat(userId, name);
  if (!chat) return res.status(404).send("Chat not found");
  return res.status(200).send(chat);
});

router.post(
  "/:chatName/join",
  verifyToken,
  async (req: Request, res: Response) => {
    const userId = res.locals["userId"];
    const { chatName } = req.params;
    const { password } = req.body;
    const userName = await db.getUsername(userId);
    if (!userName) return res.status(404).send("User not found");
    if (!chatName || !password)
      return res.status(400).send("Chat name and password are required");
    const auth = await db.AuthOnPrivateChat(chatName, password);
    if (!auth) return res.status(404).send("Chat not found");
    mqttClient.publish(`chat/${chatName}`, `${userName} joined the chat`);
    return res.status(200).send(auth);
  },
);

export default router;
