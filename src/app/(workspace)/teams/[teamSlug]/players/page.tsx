import { UsersRound } from "lucide-react";

import { ModulePlaceholder } from "@/modules/shared/components/module-placeholder";

export default function PlayersPage() {
  return (
    <ModulePlaceholder
      icon={UsersRound}
      title="Đội hình"
      metricLabel="Thành viên"
      metricValue="0"
    />
  );
}
