interface IUser {
  _id?: string;
  userId: string;
  name: string;
  balance: number;
  // email: string;
  password?: string;
}

export default IUser;
