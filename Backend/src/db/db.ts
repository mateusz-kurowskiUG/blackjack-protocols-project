"yse strict";
import mongoose from "mongoose";
import { getEnvs } from "../utils";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import GameSchema from "./schemas/Game";
import UserSchema from "./schemas/User";
import IGame from "../interfaces/Game.model";
import IUser from "../interfaces/User.model";
import Envs from "../interfaces/Envs.model";
import IChat from "../interfaces/Chat.model";
import ChatSchema from "./schemas/Chat";

export class Db {
  envs: Envs;
  connection: mongoose.Connection;
  User: mongoose.Model<IUser>;
  Game: mongoose.Model<IGame>;
  Chat: mongoose.Model<IChat>;
  constructor() {
    this.envs = getEnvs();
    this.setUp();
  }

  private async setUp() {
    this.connection = mongoose.createConnection(this.envs.ATLAS_URI);
    this.connection.useDb(this.envs.DB);
    this.Game = this.connection.model<IGame>("Game", GameSchema);
    this.User = this.connection.model<IUser>("User", UserSchema);
    this.Chat = this.connection.model<IChat>("Chat", ChatSchema);
    Promise.all([
      await this.deleteAllGames(),
      await this.deleteAllUsers(),
      await this.deleteAllChats(),
    ]).then(() => {
      console.log("DB ready!");
    });
  }

  async deleteAllChats() {
    await this.Chat.deleteMany({});
  }

  async authenticateUser(name, userPassword): Promise<IUser | false> {
    const user = await this.User.findOne({ name });
    if (!user) return false;
    const match = await bcrypt.compare(userPassword, user.password!);
    if (!match) return false;
    const { password: _, _id, __v, password, ...newUser } = user.toObject();
    return newUser;
  }

  async updateChat(
    chatName: string,
    userId: string,
    params: object,
  ): Promise<IChat | null> {
    const chat = await this.Chat.findOne({ name: chatName, ownerId: userId });
    if (!chat) return null;
    const { password, newPassword } = params;
    if (password && newPassword) {
      const match = await bcrypt.compare(password, chat.password!);
      if (!match) return null;
      params["password"] = await bcrypt.hash(newPassword, 10);
    }
    const updatedChat = await this.Chat.findOneAndUpdate(
      { name: chatName },
      { name: chatName, password: params["password"] },
    );
    if (!updatedChat) return null;
    const { _id, __v, ...newChat } = updatedChat.toObject();
    return newChat;
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
    const user = this.User.findOneAndDelete({ userId: id });
    return user;
  }

  async getGamesByUserId(userId: string): Promise<IGame[]> {
    const user = await this.User.findOne({ userId: userId });
    if (!user) return [];
    const games = await this.Game.find({ userId: userId });
    const resultGames = games.map((game) => {
      const { _id, __v, ...newGame } = game.toObject();
      return newGame;
    });
    return resultGames;
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
    if (params["password"]) {
      params["password"] = await bcrypt.hash(params["password"], 10);
    }
    const user = await this.User.findOneAndUpdate({ userId: userId }, params);
    if (!user) return null;
    const { password, _id, __v, ...newUser } = user.toObject();
    return newUser;
  }

  randomCard(): string | number {
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, "A", "J", "Q", "K"];
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
  }

  async createGame(userId: string, stake: number): Promise<IGame | null> {
    const user = await this.User.findOne({ userId: userId });
    if (!user) return null;
    if (stake > user.balance || stake < 1) return null;
    const newGame = await this.Game.create({
      id: uuidv4(),
      userId: userId,
      stake,
      date: new Date(),
      status: "created",
      dealerCards: [this.randomCard()],
      playerCards: [this.randomCard(), this.randomCard()],
    });
    const updateUserBalance = await this.User.findOneAndUpdate(
      { userId: userId },
      { $inc: { balance: -stake } },
    );
    if (!updateUserBalance) return null;
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

  async updateGame(id: string, params: object): Promise<IGame> {
    const updatedGame = await this.Game.findOneAndUpdate({ id: id }, params);
    if (!updatedGame) return null;
    const { _id, __v, ...newGame } = updatedGame.toObject();
    console.log(newGame);

    return newGame;
  }

  async endGame(
    gameId: string,
    userWinnings: number,
    status: string,
  ): Promise<false | IGame> {
    const game = await this.Game.findOneAndUpdate(
      { id: gameId },
      { status: status },
      { new: true },
    );
    if (!game) return false;
    const updateUserBalance = await this.User.findOneAndUpdate(
      { userId: game.userId },
      { $inc: { balance: userWinnings } },
    );
    if (!updateUserBalance) return false;
    const { _id, __v, ...updatedGame } = game.toObject();
    return updatedGame;
  }
  async getChats(): Promise<IChat[]> {
    const chats = await this.Chat.find({});
    return chats;
  }

  async getChat(name: string): Promise<IChat | null> {
    const chat = await this.Chat.findOne({ name: name });
    if (!chat) return null;
    const { _id, __v, ...newChat } = chat.toObject();
    return newChat;
  }

  async createPrivateChat(name: string, password: string, userId: string) {
    const found = await this.Chat.findOne({ name: name });
    if (found) return false;
    const chat = await this.Chat.create({
      chatId: uuidv4(),
      name: name,
      password: await bcrypt.hash(password, 10),
      ownerId: userId,
    });
    const { _id, __v, ...newChat } = chat.toObject();
    return newChat;
  }
  async getUsername(userId: string): Promise<string | null> {
    const user = await this.User.findOne({ userId: userId });
    if (!user) return null;
    return user.name;
  }

  async getChatsByUserId(userId: string): Promise<IChat[]> {
    const chats = await this.Chat.find({ ownerId: userId });
    return chats;
  }

  async deletePrivateChat(userId: string, name: string) {
    const chat = await this.Chat.findOneAndDelete({
      name: name,
      ownerId: userId,
    });
    if (!chat) return null;
    const { _id, __v, ...newChat } = chat.toObject();
    return newChat;
  }

  async AuthOnPrivateChat(name: string, password: string): Promise<boolean> {
    const chat = await this.Chat.findOne({ name: name });
    if (!chat) return false;
    const match = await bcrypt.compare(password, chat.password!);
    if (!match) return false;
    return true;
  }

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
