import { v4 as uuidv4 } from "uuid";
export default class Game {
  id: string;
  userId: string;
  stake: number;
  date: Date;
  won: boolean;
  numbers: number[];
  constructor(userId: string, stake: number) {
    this.id = uuidv4();
    this.userId = userId;
    this.stake = stake;
    this.date = new Date();
  }
}
