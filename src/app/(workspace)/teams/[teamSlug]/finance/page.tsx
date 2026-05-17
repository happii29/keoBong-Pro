import { FundManagementModule } from "@/modules/finance/components/fund-management-module";

type FinancePageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function FinancePage({ params }: FinancePageProps) {
  const { teamSlug } = await params;

  return <FundManagementModule teamSlug={teamSlug} />;
}
