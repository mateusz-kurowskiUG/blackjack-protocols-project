import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import gamesRoutes from "./routes/games.routes";
import usersRoutes from "./routes/users.routes";
import { Db } from "../db/db";

export const db = new Db();
export const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 3000;
// register routes
app.use("/users", usersRoutes);
app.use("/games", gamesRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Got a GET request");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
