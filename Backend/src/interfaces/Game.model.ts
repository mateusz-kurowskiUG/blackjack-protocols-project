type TCard = string | number;
interface IGame {
  _id?: string;
  id: string;
  userId: string;
  stake: number;
  date: Date;
  status: string;
  playerCards: TCard[];
  dealerCards: TCard[];
}
export default IGame;
