export type PlayerPosition =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "DM"
  | "CM"
  | "AM"
  | "LW"
  | "RW"
  | "ST";

export type BalancePlayer = {
  id: string;
  name: string;
  shirtNumber: number;
  level: number;
  position: PlayerPosition;
  isGoalkeeper?: boolean;
  isLate?: boolean;
};

export type BalancedTeam = {
  key: "red" | "blue";
  name: string;
  players: BalancePlayer[];
};
