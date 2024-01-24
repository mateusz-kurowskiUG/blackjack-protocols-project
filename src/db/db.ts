"yse strict";
import { Envs, IGame, IHash, IUser } from "../interfaces/interfaces";
import mongoose from "mongoose";
import { getEnvs } from "../utils";
import { Game, User, Hash } from "./schemas/schemas";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class Db {
  envs: Envs;
  connection: mongoose.Connection;
  User: mongoose.Model<UserInterface>;
  Game: mongoose.Model<GameInterface>;
  Hash: mongoose.Model<Hash>;
  constructor() {
    this.envs = getEnvs();
    this.setUp();
  }

  private async setUp() {
    this.connection = mongoose.createConnection(this.envs.ATLAS_URI);
    this.connection.useDb(this.envs.DB);
    this.Game = this.connection.model<IGame>("Game", Game);
    this.User = this.connection.model<IUser>("User", User);
    this.Hash = this.connection.model<IHash>("Hash", Hash);
    Promise.all([
      await this.deleteAllGames(),
      await this.deleteAllUsers(),
      await this.insertTestData(),
      // await this.createHash(),
    ]).then(() => {
      console.log("DB ready!");
    });
  }

  // async createHash(): Promise<boolean> {
  //   this.connection.model("Hash", Hash);
  //   const hash = await this.Hash.findOne();
  //   if (hash) return true;
  //   bcrypt.hash("s0//P4$$w0rD", 10, async (err, hash: string) => {
  //     if (err) throw err;
  //     const hashCreated = await this.Hash.create({
  //       hash: hash,
  //       createdAt: new Date(),
  //     });
  //     return hashCreated ? true : false;
  //   });
  //   return true;
  // }

  async authenticateUser(name, password): Promise<boolean> {
    const user = await this.User.findOne({ name });
    if (!user) return false;
    const match = await bcrypt.compare(password, user.password);
    return match;
  }

  async insertTestData() {
    const testUsers: IUser[] = [
      { id: "1", name: "test", balance: 100, password: "test" },
      { id: "2", name: "test2", balance: 100, password: "test2" },
    ];
    const testGames: IGame[] = [
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

  async createUser({
    name,
    password,
  }: {
    name: string;
    password: string;
  }): Promise<IUser | boolean> {
    const exists = await this.User.exists({ name: name });
    if (exists) return false;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.User.create({
      userId: uuidv4(),
      name: name,
      password: hashedPassword,
      balance: 100,
    });
    const created = await this.User.create(newUser);
    return created;
  }
  async deleteUser(id: string) {
    const user = this.User.findOneAndDelete({ id: id });
    return user;
  }
  async getUser(id: string): Promise<IUser> {
    const user = await this.User.findOne({ id: id });
    if (user) delete user.password;
    return user;
  }
  async getUsers(): Promise<IUser[]> {
    const users = await this.User.find({});
    return users;
  }

  async getUsersByNameRegex(name: string): Promise<IUser[]> {
    const users = await this.User.find({
      name: { $regex: name },
    });
    if (!users) return [];
    return users;
  }

  async updateUser(id: string, params: IUser): Promise<IUser> {
    const x = await this.connection
      .model("User")
      .findOneAndUpdate({ id: id }, params, { new: true });
    return x;
  }

  async createGame(userId: string, game: IGame) {
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
  async getGame(id: string): Promise<IGame> {
    const game = await this.Game.findOne({ id: id });
    return game;
  }
  async getGames(): Promise<IGame[]> {
    const games = await this.Game.find();
    return games;
  }

  updateGame(id: string, params: object): Promise<IGame> {}

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
