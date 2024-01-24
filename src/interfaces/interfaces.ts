export interface IUser {
  _id?: string;
  id: string;
  name: string;
  balance: number;
  // email: string;
  password: string;
}

export interface IGame {
  _id?: string;
  id: string;
  userId: string;
  stake: number;
  date: Date;
  won: boolean;
  // numbers: number[];
}

export interface IHash {
  hash: string;
  createdAt: Date;
  saltRounds: number;
}

export interface Envs {
  ATLAS_URI: string;
  COLLECTION_USERS: string;
  COLLECTION_GAMES: string;
  DB: string;
}
export interface IUserParams {
  name?: string;
  balance?: number;
}
