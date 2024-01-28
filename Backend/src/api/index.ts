import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import https from "https";
import gamesRoutes from "./routes/games.routes";
import usersRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";
import { Db } from "../db/db";
import { mqttClient, io } from "../mqtt";
import chatRoutes from "./routes/chats.routes";
import log from "./middlewares/logMiddleware";
const privateKey = fs.readFileSync("./key", "utf8");
const certificate = fs.readFileSync("./cert", "utf8");
const credentials = {
  key: privateKey,
  cert: certificate,
  passphrase: "express",
};

export const db = new Db();
export const app = express();

app.use(bodyParser.json());
app.use(cors());
const port = 3000;
const httpsServer = https.createServer(credentials, app);
// register routes
app.use(log);
app.use("/users", usersRoutes);
app.use("/games", gamesRoutes);
app.use("/chats", chatRoutes);
app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Got a GET request");
});

const messages = [];

httpsServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  setTimeout(() => {
    db.createUser({ name: "aaa", password: "aaa" }).then((res) => {
      console.log("created");
    });
    db.createUser({ name: "bbb", password: "bbb" }).then((res) => {
      console.log("created");
    });
  }, 1000);

  mqttClient.subscribe("public");
  mqttClient.on("message", (topic, message) => {
    if (topic === "public") {
      const msg = message.toString().split(":");
      messages.push({ sender: msg[0], msgContent: msg[1] });
      console.log(msg);
    }
  });
  io.on("connection", (socket) => {
    console.log("a user connected");
  });
});
