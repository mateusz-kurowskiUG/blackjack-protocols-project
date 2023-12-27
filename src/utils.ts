import { games, users } from "./db/db";
import { GameInterface, UserInterface } from "./interfaces/interfaces";

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
