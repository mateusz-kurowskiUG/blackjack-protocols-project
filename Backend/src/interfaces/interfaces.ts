export interface IUser {
  _id?: string;
  userId: string;
  name: string;
  balance: number;
  // email: string;
  password?: string;
}
type TCard = string | number;
export interface IGame {
  _id?: string;
  id: string;
  userId: string;
  stake: number;
  date: Date;
  status: string;
  playerCards: TCard[];
  dealerCards: TCard[];
}
export interface INewGame {
  userId: string;
  stake: number;
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
