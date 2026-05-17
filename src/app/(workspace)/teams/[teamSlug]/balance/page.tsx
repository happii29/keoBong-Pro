import { TeamBalancingModule } from "@/modules/team-balancing/components/team-balancing-module";

type BalancePageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function BalancePage({ params }: BalancePageProps) {
  const { teamSlug } = await params;

  return <TeamBalancingModule teamSlug={teamSlug} />;
}
