export interface UserInterface {
  _id?: string;
  id: string;
  name: string;
  balance: number;
  // email: string;
  password: string;
}

export interface GameInterface {
  _id?: string;
  id: string;
  userId: string;
  stake: number;
  date: Date;
  won: boolean;
  // numbers: number[];
}

export interface Envs {
  ATLAS_URI: string;
  COLLECTION_USERS: string;
  COLLECTION_GAMES: string;
  DB: string;
}
