import { v4 as uuidv4 } from "uuid";
export default class User {
  id: string;
  name: string;
  balance: number;
  password: string;
  constructor(name: string, password: string) {
    this.id = uuidv4();
    this.name = name;
    this.password = password;
    this.balance = 0;
  }
}
