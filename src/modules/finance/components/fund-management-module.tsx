"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Droplets,
  FileText,
  Landmark,
  ReceiptText,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import type { FundMember, FundTransaction, MonthlyCashflow } from "../finance.types";

type FundManagementModuleProps = {
  teamSlug: string;
};

const perPlayerAmount = 120000;
const pitchFee = 720000;
const waterFee = 180000;

const members: FundMember[] = [
  { id: "m1", name: "Minh Nguyễn", shirtNumber: 9, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "16/05" },
  { id: "m2", name: "Quân Trần", shirtNumber: 8, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "16/05" },
  { id: "m3", name: "Hưng Phạm", shirtNumber: 1, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "15/05" },
  { id: "m4", name: "Long Lê", shirtNumber: 5, amountDue: perPlayerAmount, paidAmount: 60000 },
  { id: "m5", name: "Tuấn Anh", shirtNumber: 11, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "15/05" },
  { id: "m6", name: "Khải Võ", shirtNumber: 2, amountDue: perPlayerAmount, paidAmount: 0 },
  { id: "m7", name: "Duy Hoàng", shirtNumber: 6, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "16/05" },
  { id: "m8", name: "Nam Phạm", shirtNumber: 7, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "14/05" },
  { id: "m9", name: "Bảo Trần", shirtNumber: 4, amountDue: perPlayerAmount, paidAmount: 0 },
  { id: "m10", name: "Khoa Đặng", shirtNumber: 10, amountDue: perPlayerAmount, paidAmount: 120000, paidAt: "16/05" },
];

const transactions: FundTransaction[] = [
  { id: "t1", date: "17/05", title: "Thu quỹ trận Chủ nhật", category: "Quỹ", type: "income", amount: 900000, note: "8 người đã đóng, 1 người đóng một phần" },
  { id: "t2", date: "17/05", title: "Tiền sân Phú Thọ - Sân 3", category: "Sân", type: "expense", amount: 720000, note: "Khung 20:30 - 22:00" },
  { id: "t3", date: "17/05", title: "Nước suối + điện giải", category: "Nước", type: "expense", amount: 180000, note: "2 thùng nước, 12 chai điện giải" },
  { id: "t4", date: "10/05", title: "Thu bù quỹ tuần trước", category: "Quỹ", type: "income", amount: 360000, note: "3 thành viên chuyển khoản" },
  { id: "t5", date: "09/05", title: "Băng keo thể thao", category: "Khác", type: "expense", amount: 85000, note: "Y tế trận đấu" },
];

const monthlyCashflow: MonthlyCashflow[] = [
  { month: "T1", income: 2200000, expense: 1780000 },
  { month: "T2", income: 2460000, expense: 1920000 },
  { month: "T3", income: 2380000, expense: 2140000 },
  { month: "T4", income: 2640000, expense: 2060000 },
  { month: "T5", income: 1260000, expense: 985000 },
];

const expenseBreakdown = [
  { label: "Tiền sân", value: pitchFee, color: "#34d399", dot: "bg-emerald" },
  { label: "Tiền nước", value: waterFee, color: "#f5bd49", dot: "bg-gold" },
  { label: "Khác", value: 85000, color: "#7dd3fc", dot: "bg-sky-300" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}tr`;
  }

  return `${Math.round(value / 1000)}k`;
}

export function FundManagementModule({ teamSlug }: FundManagementModuleProps) {
  const teamName = formatTeamSlug(teamSlug);
  const paidMembers = members.filter((member) => member.paidAmount >= member.amountDue);
  const unpaidMembers = members.filter((member) => member.paidAmount < member.amountDue);
  const expectedIncome = members.reduce((sum, member) => sum + member.amountDue, 0);
  const collected = members.reduce((sum, member) => sum + member.paidAmount, 0);
  const outstanding = expectedIncome - collected;
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalFund = 3485000 + income - expense;
  const collectionRate = Math.round((collected / expectedIncome) * 100);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Fund management"
        title="Quản lý quỹ đội"
        description={`${teamName} · Theo dõi tiền sân, tiền nước, công nợ và lịch sử thu chi`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceMetric
          icon={WalletCards}
          label="Tổng quỹ"
          value={formatCurrency(totalFund)}
          detail={`Còn phải thu ${formatCurrency(outstanding)}`}
          tone="emerald"
        />
        <FinanceMetric icon={Landmark} label="Tiền sân" value={formatCurrency(pitchFee)} detail="Sân Phú Thọ · 20:30" tone="slate" />
        <FinanceMetric icon={Droplets} label="Tiền nước" value={formatCurrency(waterFee)} detail="Nước suối và điện giải" tone="gold" />
        <FinanceMetric
          icon={CircleDollarSign}
          label="Tiền mỗi người"
          value={formatCurrency(perPlayerAmount)}
          detail={`${members.length} thành viên trong kèo`}
          tone="sky"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-5">
          <FundHero
            totalFund={totalFund}
            collected={collected}
            expectedIncome={expectedIncome}
            collectionRate={collectionRate}
            paidCount={paidMembers.length}
            unpaidCount={unpaidMembers.length}
          />
          <CashflowChart data={monthlyCashflow} />
          <TransactionHistory transactions={transactions} />
        </div>
        <div className="space-y-5">
          <ExpenseBreakdown />
          <MemberPayments paidMembers={paidMembers} unpaidMembers={unpaidMembers} />
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

function FundHero({
  totalFund,
  collected,
  expectedIncome,
  collectionRate,
  paidCount,
  unpaidCount,
}: {
  totalFund: number;
  collected: number;
  expectedIncome: number;
  collectionRate: number;
  paidCount: number;
  unpaidCount: number;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="relative p-5 sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),transparent_42%),linear-gradient(225deg,rgba(245,189,73,0.14),transparent_36%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_260px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald">Healthy cashflow</Badge>
              <Badge variant="glass">Tháng 05/2026</Badge>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Số dư hiện tại</p>
            <p className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{formatCurrency(totalFund)}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HeroPill icon={ArrowUpRight} label="Đã thu" value={formatCurrency(collected)} />
              <HeroPill icon={ReceiptText} label="Dự kiến" value={formatCurrency(expectedIncome)} />
              <HeroPill icon={UsersRound} label="Đã đóng" value={`${paidCount}/${paidCount + unpaidCount}`} />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tiến độ thu</p>
                <p className="mt-2 font-display text-3xl font-semibold">{collectionRate}%</p>
              </div>
              <Badge variant={unpaidCount > 0 ? "gold" : "emerald"}>{unpaidCount} còn nợ</Badge>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald shadow-emerald" style={{ width: `${collectionRate}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-emerald/20 bg-emerald/10 p-3">
                <p className="text-muted-foreground">Người đã đóng</p>
                <p className="font-display text-2xl font-semibold text-emerald">{paidCount}</p>
              </div>
              <div className="rounded-md border border-gold/20 bg-gold/10 p-3">
                <p className="text-muted-foreground">Người còn nợ</p>
                <p className="font-display text-2xl font-semibold text-gold">{unpaidCount}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeroPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4 text-gold" />
        {label}
      </div>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function CashflowChart({ data }: { data: MonthlyCashflow[] }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.income, item.expense]));

  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-emerald" />
            Cashflow 5 tháng
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald" />
              Thu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-gold" />
              Chi
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex h-64 items-end gap-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:gap-5">
          {data.map((item) => (
            <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
              <div className="flex flex-1 items-end justify-center gap-1.5 sm:gap-2">
                <Bar value={item.income} maxValue={maxValue} tone="emerald" />
                <Bar value={item.expense} maxValue={maxValue} tone="gold" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold">{item.month}</p>
                <p className="hidden text-[10px] text-muted-foreground sm:block">{compactCurrency(item.income)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Bar({ value, maxValue, tone }: { value: number; maxValue: number; tone: "emerald" | "gold" }) {
  const height = Math.max(12, Math.round((value / maxValue) * 100));

  return (
    <div
      className={cn(
        "w-full max-w-8 rounded-t-md transition-all",
        tone === "emerald" ? "bg-emerald shadow-emerald" : "bg-gold shadow-gold",
      )}
      style={{ height: `${height}%` }}
      title={formatCurrency(value)}
    />
  );
}

function ExpenseBreakdown() {
  const totalExpense = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);
  const segments = expenseBreakdown.reduce<
    Array<(typeof expenseBreakdown)[number] & { percent: number; start: number; end: number }>
  >((items, item) => {
    const start = items.at(-1)?.end ?? 0;
    const percent = (item.value / totalExpense) * 100;

    return [...items, { ...item, percent, start, end: start + percent }];
  }, []);
  const gradient = segments.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(", ");

  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowDownRight className="size-5 text-gold" />
          Cơ cấu chi phí
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center xl:grid-cols-1">
          <div className="mx-auto grid size-36 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
            <div className="grid size-24 place-items-center rounded-full border border-white/10 bg-card text-center">
              <div>
                <p className="text-xs text-muted-foreground">Tổng chi</p>
                <p className="font-display text-xl font-semibold">{compactCurrency(totalExpense)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {segments.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", item.dot)} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(item.value)}</p>
                  <p className="text-xs text-muted-foreground">{item.percent.toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberPayments({
  paidMembers,
  unpaidMembers,
}: {
  paidMembers: FundMember[];
  unpaidMembers: FundMember[];
}) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UsersRound className="size-5 text-emerald" />
          Thành viên đóng quỹ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <PaymentGroup title="Người đã đóng" tone="paid" members={paidMembers} />
        <PaymentGroup title="Người còn nợ" tone="debt" members={unpaidMembers} />
      </CardContent>
    </Card>
  );
}

function PaymentGroup({
  title,
  tone,
  members,
}: {
  title: string;
  tone: "paid" | "debt";
  members: FundMember[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <Badge variant={tone === "paid" ? "emerald" : "gold"}>{members.length}</Badge>
      </div>
      <div className="space-y-2">
        {members.map((member) => {
          const debt = member.amountDue - member.paidAmount;

          return (
            <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("grid size-9 shrink-0 place-items-center rounded-md text-sm font-semibold", tone === "paid" ? "bg-emerald/12 text-emerald" : "bg-gold/12 text-gold")}>
                  {member.shirtNumber}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.paidAt ? `Đã đóng ${member.paidAt}` : "Chưa thanh toán đủ"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-sm font-semibold", debt > 0 ? "text-gold" : "text-emerald")}>
                  {debt > 0 ? formatCurrency(debt) : "Done"}
                </p>
                {member.paidAmount > 0 && debt > 0 ? (
                  <p className="text-xs text-muted-foreground">đã đóng {compactCurrency(member.paidAmount)}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TransactionHistory({ transactions }: { transactions: FundTransaction[] }) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b border-white/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="size-5 text-gold" />
          Lịch sử thu chi
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                  <TableCell>
                    <p className="font-semibold">{transaction.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{transaction.note}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "emerald" : "gold"}>{transaction.category}</Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-semibold", transaction.type === "income" ? "text-emerald" : "text-gold")}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{transaction.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {transaction.date} · {transaction.note}
                  </p>
                </div>
                <Badge variant={transaction.type === "income" ? "emerald" : "gold"}>{transaction.category}</Badge>
              </div>
              <p className={cn("mt-3 text-right font-semibold", transaction.type === "income" ? "text-emerald" : "text-gold")}>
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
