"yse strict";
import { Envs, GameInterface, UserInterface } from "../interfaces/interfaces";
import mongoose from "mongoose";
import { getEnvs } from "../utils";
import { Game, User } from "./schemas/schemas";

export class Db {
  envs: Envs;
  connection: mongoose.Connection;
  constructor() {
    this.envs = getEnvs();
    this.connection = mongoose.createConnection(this.envs.ATLAS_URI);
    this.connection.useDb(this.envs.DB);
    this.connection.model("games", Game);
    this.connection.model("users", User);
    this.deleteAllGames();
    this.deleteAllUsers();
  }

  async deleteAllGames() {
    const deleted = await this.connection.model("games").deleteMany({});
    console.log(deleted.deletedCount);
  }
  async deleteAllUsers() {
    const deleted = await this.connection.model("users").deleteMany({});
    console.log(deleted.deletedCount);
  }

  async createUser(user: UserInterface): Promise<UserInterface> {
    const insert = await this.connection.model("users").create(user);
    return insert;
  }
  async deleteUser(id: string) {
    const user = await this.connection
      .model("users")
      .findOneAndDelete({ id: id });
    return user;
  }
  async getUser(id: string): Promise<UserInterface> {
    const user = await this.connection.model("users").findOne({ id: id });
    return user;
  }
  async getUsers(): Promise<UserInterface[]> {
    const users = await this.connection.model("users").find({});
    return users;
  }

  async updateUser(id: string, params: object): Promise<UserInterface> {
    const x = await this.connection
      .model("users")
      .findByIdAndUpdate(id, params);
  }

  async createGame(game: GameInterface) {
    const insert = await this.connection.model("games").create(game);
    return insert;
  }
  async getGame(id: string): Promise<GameInterface> {
    const game = await this.connection.model("games").findOne({ id: id });
    return game;
  }
  async getGames(): Promise<GameInterface[]> {
    const games = await this.connection.model("games").find();
    return games;
  }
  updateGame(id: string, params: object): Promise<GameInterface> {}

  async deleteGame(id: string) {
    const game = await this.connection.model("games").deleteOne({ id: id });
    return game;
  }

  disconnect() {
    this.connection
      .close()
      .then(() => {
        console.log("disconnected");
      })
      .catch(() => {
        console.log("error happened while disconnecting");
      });
  }
}
