import { AttendanceModule } from "@/modules/attendance/components/attendance-module";

type MatchesPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function MatchesPage({ params }: MatchesPageProps) {
  const { teamSlug } = await params;

  return <AttendanceModule teamSlug={teamSlug} />;
}
