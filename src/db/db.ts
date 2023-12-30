"yse strict";
import { Envs, GameInterface, UserInterface } from "../interfaces/interfaces";
import mongoose from "mongoose";
import { getEnvs } from "../utils";
import { Game, User } from "./schemas/schemas";

export class Db {
  envs: Envs;
  connection: mongoose.Connection;
  User: mongoose.Model<UserInterface>;
  Game: mongoose.Model<GameInterface>;
  constructor() {
    this.envs = getEnvs();
    this.setUp();
  }

  private async setUp() {
    this.connection = await mongoose.createConnection(this.envs.ATLAS_URI);
    await this.connection.useDb(this.envs.DB);
    this.Game = await this.connection.model("Game", Game);
    this.User = await this.connection.model("User", User);
    await this.deleteAllGames();
    await this.deleteAllUsers();
    await this.insertTestData();
  }

  async insertTestData() {
    const testUsers: UserInterface[] = [
      { id: "1", name: "test", balance: 100, password: "test" },
      { id: "2", name: "test2", balance: 100, password: "test2" },
    ];
    const testGames: GameInterface[] = [
      { id: "1", userId: "1", stake: 10, date: new Date(), won: true },
      { id: "2", userId: "2", stake: 10, date: new Date(), won: false },
    ];
    await this.User.insertMany(testUsers);
    await this.Game.insertMany(testGames);
  }

  async deleteAllGames() {
    (await this.Game.deleteMany({})).deletedCount;
  }
  async deleteAllUsers() {
    (await this.User.deleteMany({})).deletedCount;
  }

  async createUser(user: UserInterface): Promise<UserInterface> {
    await this.Game.create(user);
  }
  async deleteUser(id: string) {
    const user = this.User.findOneAndDelete({ id: id });
    return user;
  }
  async getUser(id: string): Promise<UserInterface> {
    const user = await this.User.findOne({ id: id });
    return user;
  }
  async getUsers(): Promise<UserInterface[]> {
    const users = await this.User.find({});
    return users;
  }

  async updateUser(id: string, params: UserInterface): Promise<UserInterface> {
    const x = await this.connection
      .model("User")
      .findOneAndUpdate({ id: id }, params, { new: true });
    return x;
  }

  async createGame(userId: string, game: GameInterface) {
    const session = await this.connection.startSession();
    const transaction = await session.withTransaction(async () => {
      await this.Game.create(game);
      const result = await this.connection
        .model("User")
        .findOneAndUpdate(
          { id: userId },
          { $inc: { balance: -game.stake } },
          { new: true },
        );
      return result;
    });
    return transaction;
  }
  async getGame(id: string): Promise<GameInterface> {
    const game = await this.Game.findOne({ id: id });
    return game;
  }
  async getGames(): Promise<GameInterface[]> {
    const games = await this.Game.find();
    return games;
  }

  updateGame(id: string, params: object): Promise<GameInterface> {}

  async deleteGame(id: string) {
    const game = await this.Game.deleteOne({ id: id });
    return game;
  }
  async deleteGamesByUserId(userId: string) {
    const games = await this.connection
      .model("Game")
      .deleteMany({ userId: userId });
    return games;
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
