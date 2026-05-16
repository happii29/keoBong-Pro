import { WalletCards } from "lucide-react";

import { ModulePlaceholder } from "@/modules/shared/components/module-placeholder";

export default function FinancePage() {
  return (
    <ModulePlaceholder
      icon={WalletCards}
      title="Quỹ đội"
      metricLabel="Số dư"
      metricValue="0 đ"
    />
  );
}
