import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModulePlaceholderProps = {
  icon: LucideIcon;
  title: string;
  metricLabel: string;
  metricValue: string;
};

export function ModulePlaceholder({
  icon: Icon,
  title,
  metricLabel,
  metricValue,
}: ModulePlaceholderProps) {
  return (
    <section className="space-y-5">
      <PageHeader
        eyebrow="Module"
        title={title}
        description="Nền tảng UI và dữ liệu đã sẵn sàng để triển khai nghiệp vụ trong bước tiếp theo."
      />

      <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="premium-card-hover min-h-32">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {metricLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3">
              <p className="font-display text-2xl font-semibold">
                {metricValue}
              </p>
              <div className="flex size-10 items-center justify-center rounded-lg border border-emerald/20 bg-emerald/10 text-emerald">
                <Icon className="size-4" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="min-h-32">
          <CardHeader>
            <CardTitle>Hoạt động</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Icon}
              title="Chưa có dữ liệu"
              description="Module này đang ở trạng thái foundation, chưa triển khai feature nghiệp vụ."
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
