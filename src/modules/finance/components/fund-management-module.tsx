"use client";

import { useActionState, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Edit3,
  FileText,
  Plus,
  ReceiptText,
  Trash2,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTeamSlug } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActionFeedback } from "@/hooks/use-action-feedback";

import {
  createFundTransactionAction,
  deleteFundTransactionAction,
  updateFundTransactionAction,
} from "../actions";
import type {
  FinanceMatch,
  FinancePlayer,
  FinanceRole,
  FinanceTransaction,
  FundFormState,
  MatchPaymentSummary,
} from "../finance.types";

type FundManagementModuleProps = {
  teamSlug: string;
  role: FinanceRole;
  currentUserId: string;
  players: FinancePlayer[];
  matches: FinanceMatch[];
  transactions: FinanceTransaction[];
  matchPaymentSummaries: MatchPaymentSummary[];
};

const managerRoles: FinanceRole[] = ["owner", "manager", "captain"];
const initialState: FundFormState = {};

const fieldClass =
  "h-11 w-full rounded-lg border border-white/12 bg-white/[0.055] px-3.5 py-2 text-sm text-foreground shadow-luxury outline-none focus:border-emerald/45 focus:ring-3 focus:ring-emerald/14";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function FundManagementModule({
  teamSlug,
  role,
  currentUserId,
  players,
  matches,
  transactions,
  matchPaymentSummaries,
}: FundManagementModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const canManage = managerRoles.includes(role);
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount_vnd, 0);
  const totalFund = totalIncome - totalExpense;
  const myPlayerIds = new Set(players.filter((player) => player.user_id === currentUserId).map((player) => player.id));
  const myDebt = matchPaymentSummaries
    .flatMap((summary) => summary.players)
    .filter((player) => player.isCurrentUser || myPlayerIds.has(player.playerId))
    .reduce((sum, player) => sum + player.debtAmount, 0);
  const paidPlayers = matchPaymentSummaries
    .flatMap((summary) => summary.players)
    .filter((player) => player.dueAmount > 0 && player.paidAmount >= player.dueAmount).length;
  const debtPlayers = matchPaymentSummaries
    .flatMap((summary) => summary.players)
    .filter((player) => player.debtAmount > 0).length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Fund management"
        title="Quản lý quỹ đội"
        description={`${teamName} · Theo dõi tổng quỹ, thu chi và công nợ theo từng trận`}
        action={canManage ? (
          <TransactionDialog teamSlug={teamSlug} players={players} matches={matches} mode="create" />
        ) : null}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceMetric icon={WalletCards} label="Tổng quỹ" value={formatCurrency(totalFund)} detail="Thu trừ chi toàn đội" tone="emerald" />
        <FinanceMetric icon={ArrowUpRight} label="Tổng thu" value={formatCurrency(totalIncome)} detail="Bao gồm tiền cầu thủ đóng" tone="sky" />
        <FinanceMetric icon={ArrowDownRight} label="Tổng chi" value={formatCurrency(totalExpense)} detail="Sân, nước và chi phí khác" tone="gold" />
        <FinanceMetric
          icon={CircleDollarSign}
          label={canManage ? "Còn nợ" : "Nợ của tôi"}
          value={formatCurrency(canManage ? matchPaymentSummaries.reduce((sum, summary) => sum + summary.debtTotal, 0) : myDebt)}
          detail={canManage ? `${debtPlayers} lượt chưa đủ tiền` : "Tính theo cầu thủ gắn với tài khoản"}
          tone="slate"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="space-y-5">
          <MatchPaymentPanel summaries={matchPaymentSummaries} canManage={canManage} />
          {canManage ? (
            <TransactionHistory
              teamSlug={teamSlug}
              players={players}
              matches={matches}
              transactions={transactions}
            />
          ) : null}
        </div>
        <div className="space-y-5">
          <FundSnapshot
            totalFund={totalFund}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            paidPlayers={paidPlayers}
            debtPlayers={debtPlayers}
            canManage={canManage}
          />
          {!canManage ? <MemberHint hasLinkedPlayer={myPlayerIds.size > 0} /> : null}
        </div>
      </div>
    </section>
  );
}

function FinanceMetric({
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
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
            <p className="mt-2 truncate font-display text-2xl font-semibold">{value}</p>
          </div>
          <div className={cn("grid size-11 shrink-0 place-items-center rounded-lg border", toneClass)}>
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function FundSnapshot({
  totalFund,
  totalIncome,
  totalExpense,
  paidPlayers,
  debtPlayers,
  canManage,
}: {
  totalFund: number;
  totalIncome: number;
  totalExpense: number;
  paidPlayers: number;
  debtPlayers: number;
  canManage: boolean;
}) {
  const rows = [
    { label: "Tổng quỹ", value: formatCurrency(totalFund) },
    { label: "Tổng thu", value: formatCurrency(totalIncome) },
    { label: "Tổng chi", value: formatCurrency(totalExpense) },
    { label: canManage ? "Lượt đã đóng đủ" : "Trạng thái", value: canManage ? paidPlayers.toString() : debtPlayers ? "Còn nợ" : "Ổn" },
  ];

  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ReceiptText className="size-5 text-gold" />
          Tổng quan quỹ
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-white/8 p-0">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MemberHint({ hasLinkedPlayer }: { hasLinkedPlayer: boolean }) {
  return (
    <Card className="py-0">
      <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
        {hasLinkedPlayer
          ? "Bạn đang xem phần đóng quỹ của cầu thủ được gắn với tài khoản của mình."
          : "Tài khoản của bạn chưa được gắn với hồ sơ cầu thủ, nên hệ thống chưa xác định được công nợ cá nhân."}
      </CardContent>
    </Card>
  );
}

function MatchPaymentPanel({
  summaries,
  canManage,
}: {
  summaries: MatchPaymentSummary[];
  canManage: boolean;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UsersRound className="size-5 text-emerald" />
          {canManage ? "Đóng quỹ theo trận" : "Tình trạng đóng quỹ của tôi"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {summaries.length ? (
          summaries.map((summary) => <MatchPaymentCard key={summary.matchId} summary={summary} />)
        ) : (
          <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.035] p-6 text-center text-sm text-muted-foreground">
            Chưa có dữ liệu điểm danh hoặc giao dịch gắn với trận.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchPaymentCard({ summary }: { summary: MatchPaymentSummary }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 p-4">
        <div>
          <p className="font-semibold">{summary.matchLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Chi phí trận {formatCurrency(summary.totalExpense)} · Mỗi người {formatCurrency(summary.duePerPlayer)}
          </p>
        </div>
        <Badge variant={summary.debtTotal > 0 ? "gold" : "emerald"}>
          {summary.debtTotal > 0 ? `Còn nợ ${formatCurrency(summary.debtTotal)}` : "Đã đủ"}
        </Badge>
      </div>
      <div className="divide-y divide-white/8">
        {summary.players.map((player) => (
          <div key={player.playerId} className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-md bg-white/[0.07] text-sm font-semibold">
                {player.shirtNumber ?? "-"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{player.name}</p>
                <p className="text-xs text-muted-foreground">Đã đóng {formatCurrency(player.paidAmount)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn("text-sm font-semibold", player.debtAmount > 0 ? "text-gold" : "text-emerald")}>
                {player.debtAmount > 0 ? formatCurrency(player.debtAmount) : "Đủ"}
              </p>
              <p className="text-xs text-muted-foreground">Cần {formatCurrency(player.dueAmount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionHistory({
  teamSlug,
  players,
  matches,
  transactions,
}: {
  teamSlug: string;
  players: FinancePlayer[];
  matches: FinanceMatch[];
  transactions: FinanceTransaction[];
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="size-5 text-gold" />
          Lịch sử thu chi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Liên kết</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead className="w-[120px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-muted-foreground">{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>
                    <p className="font-semibold">{transaction.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{transaction.note || transaction.category}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <p>{transaction.matchLabel || "Không gắn trận"}</p>
                    {transaction.playerName ? <p>{transaction.playerName}</p> : null}
                  </TableCell>
                  <TableCell className={cn("text-right font-semibold", transaction.type === "income" ? "text-emerald" : "text-gold")}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount_vnd)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <TransactionDialog
                        teamSlug={teamSlug}
                        players={players}
                        matches={matches}
                        transaction={transaction}
                        mode="edit"
                      />
                      <DeleteTransactionForm
                        teamSlug={teamSlug}
                        transactionId={transaction.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Chưa có giao dịch quỹ.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DeleteTransactionForm({
  teamSlug,
  transactionId,
}: {
  teamSlug: string;
  transactionId: string;
}) {
  const [state, formAction, pending] = useActionState(
    (_previousState: FundFormState, formData: FormData) =>
      deleteFundTransactionAction(formData),
    initialState,
  );

  useActionFeedback(state, pending, {
    successTitle: "Đã xóa giao dịch",
    errorTitle: "Không thể xóa giao dịch",
  });

  return (
    <form action={formAction}>
      <input type="hidden" name="teamSlug" value={teamSlug} />
      <input type="hidden" name="transactionId" value={transactionId} />
      <Button
        type="submit"
        variant="destructive"
        size="icon"
        aria-label="Xóa giao dịch"
        loading={pending}
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function TransactionDialog({
  teamSlug,
  players,
  matches,
  mode,
  transaction,
}: {
  teamSlug: string;
  players: FinancePlayer[];
  matches: FinanceMatch[];
  mode: "create" | "edit";
  transaction?: FinanceTransaction;
}) {
  const action = mode === "create" ? createFundTransactionAction : updateFundTransactionAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);
  useActionFeedback(state, pending, {
    successTitle: mode === "create" ? "Đã thêm giao dịch" : "Đã cập nhật giao dịch",
    onSuccess: () => setOpen(false),
  });
  const title = mode === "create" ? "Thêm thu/chi" : "Sửa giao dịch";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === "create" ? "gold" : "outline"} size={mode === "create" ? "default" : "icon"}>
          {mode === "create" ? <Plus className="size-4" /> : <Edit3 className="size-4" />}
          {mode === "create" ? "Thêm thu/chi" : <span className="sr-only">Sửa giao dịch</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Gắn `match` và `player` cho khoản thu để tính người đã đóng/còn nợ theo từng trận.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="teamSlug" value={teamSlug} />
          {transaction ? <input type="hidden" name="transactionId" value={transaction.id} /> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Loại
              <select name="type" defaultValue={transaction?.type ?? "income"} className={fieldClass}>
                <option value="income">Thu</option>
                <option value="expense">Chi</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Ngày
              <Input name="transactionDate" type="date" defaultValue={transaction?.transaction_date ?? new Date().toISOString().slice(0, 10)} />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium">
            Nội dung
            <Input name="title" defaultValue={transaction?.title ?? ""} placeholder="VD: Thu quỹ trận Chủ nhật" required />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Danh mục
              <Input name="category" defaultValue={transaction?.category ?? "Quỹ"} placeholder="Quỹ, Sân, Nước..." required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Số tiền
              <Input name="amountVnd" type="number" min={1} step={1} defaultValue={transaction?.amount_vnd ?? ""} required />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-medium">
            Trận đấu
            <select name="matchId" defaultValue={transaction?.match_id ?? ""} className={fieldClass}>
              <option value="">Không gắn trận</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(match.starts_at))} - {match.opponent_name || "Chưa có đối thủ"}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Cầu thủ đã đóng
            <select name="playerId" defaultValue={transaction?.player_id ?? ""} className={fieldClass}>
              <option value="">Không gắn cầu thủ</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.shirt_number ? `#${player.shirt_number} ` : ""}
                  {player.display_name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium">
            Ghi chú
            <textarea
              name="note"
              defaultValue={transaction?.note ?? ""}
              rows={3}
              className={cn(fieldClass, "h-auto resize-none py-3")}
              placeholder="Thông tin chuyển khoản, hóa đơn, sân..."
            />
          </label>

          {state.error ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}
          {state.message ? <p className="text-sm font-medium text-emerald">{state.message}</p> : null}

          <Button
            type="submit"
            variant="emerald"
            loading={pending}
            loadingText={mode === "create" ? "Đang thêm..." : "Đang lưu..."}
          >
            {mode === "create" ? "Thêm giao dịch" : "Lưu giao dịch"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
