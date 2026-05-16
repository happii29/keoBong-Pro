import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";

type TeamDashboardPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function TeamDashboardPage({
  params,
}: TeamDashboardPageProps) {
  const { teamSlug } = await params;

  return <DashboardOverview teamSlug={teamSlug} />;
}
