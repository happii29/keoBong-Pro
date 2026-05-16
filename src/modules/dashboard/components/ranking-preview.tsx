import { Crown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RankingPlayer = {
  rank: number;
  name: string;
  position: string;
  matches: number;
  score: number;
  trend: string;
};

type RankingPreviewProps = {
  players: RankingPlayer[];
};

export function RankingPreview({ players }: RankingPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Ranking preview</CardTitle>
          <Badge variant="gold">Tháng này</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.name}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/12 text-gold">
                {player.rank === 1 ? (
                  <Crown className="size-4" />
                ) : (
                  <span className="text-sm font-semibold">{player.rank}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  {player.position} · {player.matches} trận
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-semibold">
                  {player.score}
                </p>
                <p className="flex items-center justify-end gap-1 text-xs text-emerald">
                  <TrendingUp className="size-3" />
                  {player.trend}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
