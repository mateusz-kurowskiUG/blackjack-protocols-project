"yse strict";
import { Envs, IGame, INewGame, IUser } from "../interfaces/interfaces";
import mongoose from "mongoose";
import { getEnvs } from "../utils";
import { Game, User } from "./schemas/schemas";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class Db {
  envs: Envs;
  connection: mongoose.Connection;
  User: mongoose.Model<IUser>;
  Game: mongoose.Model<IGame>;
  constructor() {
    this.envs = getEnvs();
    this.setUp();
  }

  private async setUp() {
    this.connection = mongoose.createConnection(this.envs.ATLAS_URI);
    this.connection.useDb(this.envs.DB);
    this.Game = this.connection.model<IGame>("Game", Game);
    this.User = this.connection.model<IUser>("User", User);
    Promise.all([
      await this.deleteAllGames(),
      await this.deleteAllUsers(),
      await this.insertTestData(),
    ]).then(() => {
      console.log("DB ready!");
    });
  }

  async authenticateUser(name, password): Promise<IUser | boolean> {
    const user = await this.User.findOne({ name });
    if (!user) return false;
    const match = await bcrypt.compare(password, user.password!);
    if (!match) return false;
    const { password: _, _id, __v, ...newUser } = user.toObject();
    return newUser;
  }

  async insertTestData() {
    const testUsers: IUser[] = [
      { userId: "1", name: "test", balance: 100, password: "test" },
      { userId: "2", name: "test2", balance: 100, password: "test2" },
    ];
    const testGames: IGame[] = [
      { id: "1", userId: "1", stake: 10, date: new Date(), status: "created" },
      { id: "2", userId: "2", stake: 10, date: new Date(), status: "created" },
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
    const { password: _, _id, __v, ...user } = created.toObject();
    return user;
  }
  async deleteUser(id: string) {
    const user = this.User.findOneAndDelete({ id: id });
    return user;
  }
  async getUser(id: string): Promise<IUser | null> {
    const user = await this.User.findOne({ userId: id });
    if (!user) return null;
    const { password, ...newUser } = user.toObject();

    return newUser;
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

  async updateUser(userId: string, params: IUser): Promise<IUser | null> {
    const foundUser = this.User.findOne({ userId: userId });
    if (!foundUser) return null;
  }

  async createGame(userId: string, game: INewGame): Promise<IGame | null> {
    const user = await this.User.findOne({ userId: userId });
    if (!user) return null;
    if (game.stake > user.balance || game.stake < 1) return null;
    const newGame = await this.Game.create({
      id: uuidv4(),
      userId: userId,
      stake: game.stake,
      date: new Date(),
      status: "created",
    });
    const updateUserBalance = await this.User.findOneAndUpdate(
      { userId: userId },
      { balance: $dec(game.stake) },
    );
    const created = await this.Game.create(newGame);
    const { _id, __v, ...createdGame } = created.toObject();
    return createdGame;
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