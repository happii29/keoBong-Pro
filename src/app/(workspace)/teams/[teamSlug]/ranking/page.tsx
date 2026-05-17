import { RankingModule } from "@/modules/ranking/components/ranking-module";

type RankingPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function RankingPage({ params }: RankingPageProps) {
  const { teamSlug } = await params;

  return <RankingModule teamSlug={teamSlug} />;
}
