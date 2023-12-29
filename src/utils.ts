import { games, users } from "./db/db";
import { Envs, GameInterface, UserInterface } from "./interfaces/interfaces";
import dotenv from "dotenv";


export const isUnique = (collection: any[], value: any, key: string) =>
  collection.every((item) => item[key] !== value);

export const find = (collection: any[], value: any, key: string) =>
  collection.find((item) => item[key] === value);

export const findUserById = (id: string): UserInterface | undefined =>
  find(users, "id", "id");

const findGameById = (id: string): GameInterface | undefined =>
  find(games, "id", "id");

export const modifyInCollection = (
  collection: any[],
  value: any,
  key: string
) => {};

export const getEnvs = ():Envs=>{
  dotenv.config({path:__dirname+"/.env"});
  const {ATLAS_URI,COLLECTION_USERS,COLLECTION_GAMES,DB} = process.env;
  if(!ATLAS_URI || !COLLECTION_GAMES ||!COLLECTION_USERS || !DB){    
    throw new Error("URI, COLLECTION NAME or DB NAME not found in .env file");
  }
  return {ATLAS_URI,COLLECTION_GAMES,COLLECTION_USERS,DB};
};