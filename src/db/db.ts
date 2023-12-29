import { Envs, GameInterface, UserInterface } from "../interfaces/interfaces";
import mongoose from "mongoose";
import { getEnvs } from "../utils";
import { Game, User } from "./schemas/schemas";
export const games: GameInterface[] = [];
export const users: UserInterface[] = [
  { id: "1", name: "test", balance: 100, password: "test" },
];

export class Db{
  envs:Envs;
  connection:any
  constructor(){
    this.envs = getEnvs();
    this.connection = mongoose.createConnection(this.envs.ATLAS_URI)
    this.connection.model("Game",Game);
    this.connection.model("User",User);
    this.connection.Game.find().then((games)=>{})
    
  }
  getUser(id:string){

  }
  getGame(id:string){}
  createUser(){}
  createGame(){}
  updateUser(){}
  updateGame(){}
  deleteUser(){}
  deleteGame(){}
  getGames(){
  }
  getUsers(){}
}