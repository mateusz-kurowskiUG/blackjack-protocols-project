import { games, users } from "./db/db";
import { Envs, GameInterface, UserInterface } from "./interfaces/interfaces";
import dotenv from "dotenv";

export const isUnique = (
  collection: UserInterface[] | GameInterface[],
  value: string | number,
  key: string,
) => collection.every((item) => item[key] !== value);

export const getEnvs = (): Envs => {
  dotenv.config({ path: __dirname + "/.env" });
  const { ATLAS_URI, COLLECTION_USERS, COLLECTION_GAMES, DB } = process.env;
  if (!ATLAS_URI || !COLLECTION_GAMES || !COLLECTION_USERS || !DB) {
    throw new Error("URI, COLLECTION NAME or DB NAME not found in .env file");
  }
  return { ATLAS_URI, COLLECTION_GAMES, COLLECTION_USERS, DB };
};
