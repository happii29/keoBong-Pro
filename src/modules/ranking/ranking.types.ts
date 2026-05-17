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
