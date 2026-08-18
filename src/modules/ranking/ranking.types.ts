export type RankingPlayer = {
  id: string;
  rank: number;
  name: string;
  position: string;
  shirtNumber: number;
  goals: number;
  assists: number;
  mvp: number;
  attendance: number;
  winRate: number;
  rating: number;
  form: "hot" | "up" | "steady";
};

export type RankingMetric = "goals" | "assists" | "mvp" | "attendance" | "winRate";

export type RankingRole = "owner" | "manager" | "captain" | "member" | "viewer";

export type RankingStatPlayer = {
  id: string;
  name: string;
  shirtNumber: number | null;
  position: string | null;
  goals: number;
  assists: number;
  mvp: boolean;
};

export type RankingMatchInput = {
  id: string;
  label: string;
  startsAt: string;
  status: string;
  teamScore: number | null;
  opponentScore: number | null;
  players: RankingStatPlayer[];
};

export type RankingFormState = {
  error?: string;
  message?: string;
};
