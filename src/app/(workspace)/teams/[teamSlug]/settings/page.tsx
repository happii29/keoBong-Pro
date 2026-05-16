import { Settings2 } from "lucide-react";

import { ModulePlaceholder } from "@/modules/shared/components/module-placeholder";

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={Settings2}
      title="Thiết lập"
      metricLabel="Cấu hình"
      metricValue="0"
    />
  );
}
