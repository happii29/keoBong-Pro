"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Clock3,
  ExternalLink,
  Link2,
  Lock,
  MessageSquareText,
  PlayCircle,
  Power,
  RefreshCw,
  Trophy,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatTeamSlug } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { AutomationStatus, AutomationWorkflow } from "../settings.types";

type AutomationSettingsModuleProps = {
  teamSlug: string;
};

const initialWorkflows: AutomationWorkflow[] = [
  {
    key: "auto-create-match",
    name: "Auto tạo trận",
    description: "Tạo trận mới theo lịch cố định của đội.",
    schedule: "Hàng tuần · Thứ 5 · 09:00",
    status: "ready",
    enabled: true,
    nextRun: "21/05 · 09:00",
    webhookEvent: "match.auto_create",
  },
  {
    key: "send-attendance-link",
    name: "Gửi link điểm danh trước 2 ngày",
    description: "Gửi Zalo link điểm danh trước ngày đá 48 giờ.",
    schedule: "T-2 ngày · 10:00",
    status: "scheduled",
    enabled: true,
    nextRun: "22/05 · 10:00",
    webhookEvent: "attendance.link_send",
  },
  {
    key: "remind-pending-attendance",
    name: "Nhắc người chưa điểm danh",
    description: "Lọc người pending và gửi nhắc riêng trong Zalo.",
    schedule: "T-1 ngày · 20:00",
    status: "scheduled",
    enabled: true,
    nextRun: "23/05 · 20:00",
    webhookEvent: "attendance.pending_remind",
  },
  {
    key: "lock-match",
    name: "Chốt trận trước giờ đá 2 tiếng",
    description: "Chốt danh sách, thủ môn, người trễ và đội hình dự kiến.",
    schedule: "T-2 giờ",
    status: "ready",
    enabled: true,
    nextRun: "24/05 · 18:30",
    webhookEvent: "match.lock_before_kickoff",
  },
  {
    key: "calculate-fund",
    name: "Tính quỹ",
    description: "Tính tiền sân, tiền nước, tiền mỗi người và công nợ.",
    schedule: "Sau khi chốt trận",
    status: "ready",
    enabled: true,
    nextRun: "24/05 · 18:35",
    webhookEvent: "fund.calculate",
  },
  {
    key: "update-ranking",
    name: "Update ranking",
    description: "Cập nhật goals, assists, MVP, attendance và win rate.",
    schedule: "Sau trận · 23:00",
    status: "paused",
    enabled: false,
    nextRun: "Tạm dừng",
    webhookEvent: "ranking.update",
  },
];

const workflowIcons: Record<AutomationWorkflow["key"], LucideIcon> = {
  "auto-create-match": CalendarClock,
  "send-attendance-link": MessageSquareText,
  "remind-pending-attendance": BellRing,
  "lock-match": Lock,
  "calculate-fund": WalletCards,
  "update-ranking": Trophy,
};

const statusMeta: Record<AutomationStatus, { label: string; className: string }> = {
  ready: { label: "Ready", className: "border-emerald/30 bg-emerald/12 text-emerald" },
  scheduled: { label: "Scheduled", className: "border-sky-300/30 bg-sky-400/12 text-sky-200" },
  paused: { label: "Paused", className: "border-white/12 bg-white/[0.055] text-muted-foreground" },
  warning: { label: "Warning", className: "border-gold/30 bg-gold/12 text-gold" },
};

export function AutomationSettingsModule({ teamSlug }: AutomationSettingsModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const [webhookUrl, setWebhookUrl] = useState("https://n8n.keobong.pro/webhook/team-automation");
  const [secret, setSecret] = useState("kbp_live_••••••••");
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const { copied, copy } = useCopyToClipboard(1600);

  const enabledCount = workflows.filter((workflow) => workflow.enabled).length;
  const scheduledCount = workflows.filter((workflow) => workflow.enabled && workflow.status === "scheduled").length;
  const automationHealth = automationEnabled && webhookUrl ? "Online" : "Paused";

  const zaloPreview = useMemo(() => {
    return [
      `[${teamName}] Điểm danh trận Chủ nhật`,
      "Sân Phú Thọ - Sân 3 · 20:30",
      "Anh em bấm link điểm danh trước 20:00 ngày mai.",
      "Chưa phản hồi sẽ được hệ thống nhắc tự động.",
    ].join("\n");
  }, [teamName]);

  const webhookPayload = useMemo(
    () =>
      JSON.stringify(
        {
          event: "attendance.link_send",
          teamSlug,
          automationEnabled,
          scheduledFor: "2026-05-22T03:00:00.000Z",
          payload: {
            matchId: "match_20260524_2030",
            channel: "zalo",
            preview: zaloPreview,
          },
        },
        null,
        2,
      ),
    [automationEnabled, teamSlug, zaloPreview],
  );

  const toggleWorkflow = (key: AutomationWorkflow["key"]) => {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.key === key
          ? {
              ...workflow,
              enabled: !workflow.enabled,
              status: workflow.enabled ? "paused" : "ready",
              nextRun: workflow.enabled ? "Tạm dừng" : workflow.nextRun === "Tạm dừng" ? "24/05 · 20:30" : workflow.nextRun,
            }
          : workflow,
      ),
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Automation settings"
        title="Thiết lập automation"
        description={`${teamName} · n8n webhook, Zalo preview, lịch chạy và trạng thái workflow`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AutomationMetric icon={Bot} label="Automation status" value={automationHealth} detail={`${enabledCount}/6 workflows enabled`} tone="emerald" />
        <AutomationMetric icon={Link2} label="Webhook URL" value={webhookUrl ? "Configured" : "Missing"} detail="Future n8n integration ready" tone="sky" />
        <AutomationMetric icon={Clock3} label="Scheduled" value={scheduledCount.toString()} detail="Workflow đang có lịch chạy" tone="gold" />
        <AutomationMetric icon={Activity} label="Last sync" value="09:42" detail="Mock status · chờ API thật" tone="slate" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="space-y-5">
          <WebhookConfig
            webhookUrl={webhookUrl}
            secret={secret}
            automationEnabled={automationEnabled}
            onWebhookUrlChange={setWebhookUrl}
            onSecretChange={setSecret}
            onAutomationEnabledChange={setAutomationEnabled}
          />
          <ScheduleAutomation workflows={workflows} onToggleWorkflow={toggleWorkflow} />
        </div>

        <div className="space-y-5">
          <AutomationStatusPanel workflows={workflows} automationEnabled={automationEnabled} />
          <ZaloPreview
            preview={zaloPreview}
            copied={copied}
            onCopy={() => void copy(zaloPreview)}
          />
          <FutureWebhookPayload payload={webhookPayload} />
        </div>
      </div>
    </section>
  );
}

function AutomationMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "gold" | "sky" | "slate";
}) {
  const toneClass = {
    emerald: "border-emerald/25 bg-emerald/12 text-emerald shadow-emerald",
    gold: "border-gold/25 bg-gold/12 text-gold shadow-gold",
    sky: "border-sky-300/25 bg-sky-400/12 text-sky-200 shadow-luxury",
    slate: "border-white/12 bg-white/[0.055] text-foreground shadow-luxury",
  }[tone];

  return (
    <Card className="premium-card-hover py-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-2 truncate font-display text-2xl font-semibold">{value}</p>
          </div>
          <div className={cn("grid size-10 shrink-0 place-items-center rounded-md border", toneClass)}>
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 truncate text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function WebhookConfig({
  webhookUrl,
  secret,
  automationEnabled,
  onWebhookUrlChange,
  onSecretChange,
  onAutomationEnabledChange,
}: {
  webhookUrl: string;
  secret: string;
  automationEnabled: boolean;
  onWebhookUrlChange: (value: string) => void;
  onSecretChange: (value: string) => void;
  onAutomationEnabledChange: (value: boolean) => void;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="size-5 text-emerald" />
            Webhook URL config
          </CardTitle>
          <ToggleButton active={automationEnabled} onClick={() => onAutomationEnabledChange(!automationEnabled)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="space-y-2">
            <span className="text-sm font-semibold">n8n webhook URL</span>
            <Input value={webhookUrl} onChange={(event) => onWebhookUrlChange(event.target.value)} placeholder="https://n8n.example.com/webhook/keobong" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Webhook secret</span>
            <Input value={secret} onChange={(event) => onSecretChange(event.target.value)} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ConfigPill icon={CheckCircle2} label="Method" value="POST" />
          <ConfigPill icon={Lock} label="Header" value="x-keobong-secret" />
          <ConfigPill icon={ExternalLink} label="Endpoint" value="/api/webhooks/n8n" />
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <Button variant={active ? "emerald" : "luxury"} onClick={onClick}>
      <Power className="size-4" />
      {active ? "Automation enabled" : "Automation disabled"}
    </Button>
  );
}

function ConfigPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-4 text-gold" />
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ScheduleAutomation({
  workflows,
  onToggleWorkflow,
}: {
  workflows: AutomationWorkflow[];
  onToggleWorkflow: (key: AutomationWorkflow["key"]) => void;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarClock className="size-5 text-gold" />
          Schedule automation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-3">
          {workflows.map((workflow, index) => (
            <WorkflowRow key={workflow.key} workflow={workflow} index={index} onToggle={() => onToggleWorkflow(workflow.key)} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowRow({
  workflow,
  index,
  onToggle,
}: {
  workflow: AutomationWorkflow;
  index: number;
  onToggle: () => void;
}) {
  const Icon = workflowIcons[workflow.key];
  const meta = statusMeta[workflow.status];

  return (
    <div className="grid gap-3 rounded-md border border-white/10 bg-white/[0.045] p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-md border border-gold/20 bg-gold/10 text-gold">
          <Icon className="size-5" />
        </div>
        <div className="sm:hidden">
          <p className="text-sm font-semibold">{workflow.name}</p>
          <p className="text-xs text-muted-foreground">{workflow.schedule}</p>
        </div>
      </div>
      <div className="hidden min-w-0 sm:block">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{index + 1}. {workflow.name}</p>
          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", meta.className)}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{workflow.schedule} · Next: {workflow.nextRun}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Badge variant="glass" className="sm:hidden">
          {meta.label}
        </Badge>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "relative h-7 w-12 rounded-full border transition-all",
            workflow.enabled ? "border-emerald/40 bg-emerald/30" : "border-white/12 bg-white/[0.08]",
          )}
          aria-label={`Toggle ${workflow.name}`}
        >
          <span
            className={cn(
              "absolute top-1 size-5 rounded-full bg-white transition-all",
              workflow.enabled ? "left-6" : "left-1",
            )}
          />
        </button>
      </div>
    </div>
  );
}

function AutomationStatusPanel({
  workflows,
  automationEnabled,
}: {
  workflows: AutomationWorkflow[];
  automationEnabled: boolean;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="size-5 text-emerald" />
          Automation status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        <div className="rounded-lg border border-emerald/20 bg-emerald/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{automationEnabled ? "System online" : "System paused"}</p>
              <p className="mt-1 text-xs text-muted-foreground">n8n dispatcher prepared for webhook integration</p>
            </div>
            <span className={cn("size-3 rounded-full", automationEnabled ? "bg-emerald shadow-emerald" : "bg-muted-foreground")} />
          </div>
        </div>
        {workflows.map((workflow) => {
          const meta = statusMeta[workflow.status];

          return (
            <div key={workflow.key} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{workflow.webhookEvent}</p>
                <p className="text-xs text-muted-foreground">{workflow.nextRun}</p>
              </div>
              <span className={cn("rounded-md border px-2 py-1 text-xs font-semibold", meta.className)}>{workflow.enabled ? meta.label : "Off"}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ZaloPreview({
  preview,
  copied,
  onCopy,
}: {
  preview: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquareText className="size-5 text-gold" />
            Zalo message preview
          </CardTitle>
          <Button variant="luxury" size="sm" onClick={onCopy}>
            <Clipboard className="size-4" />
            {copied ? "Đã copy" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <pre className="whitespace-pre-wrap rounded-lg border border-white/10 bg-luxury-black/55 p-4 text-sm leading-6 text-foreground shadow-luxury">
          {preview}
        </pre>
      </CardContent>
    </Card>
  );
}

function FutureWebhookPayload({ payload }: { payload: string }) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PlayCircle className="size-5 text-emerald" />
          Future webhook payload
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <pre className="max-h-72 overflow-auto rounded-lg border border-white/10 bg-luxury-black/60 p-4 text-xs leading-5 text-muted-foreground shadow-luxury">
          {payload}
        </pre>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5 text-gold" />
          Payload shape aligned with n8n event dispatcher.
        </div>
      </CardContent>
    </Card>
  );
}
