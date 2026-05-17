import { AutomationSettingsModule } from "@/modules/settings/components/automation-settings-module";

type SettingsPageProps = {
  params: Promise<{
    teamSlug: string;
  }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { teamSlug } = await params;

  return <AutomationSettingsModule teamSlug={teamSlug} />;
}
