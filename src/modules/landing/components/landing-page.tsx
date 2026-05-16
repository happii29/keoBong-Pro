"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  Check,
  Crown,
  GitBranch,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motionPresets, motionTransition } from "@/components/motion/presets";
import { appConfig } from "@/config/app";

const features = [
  {
    icon: CalendarCheck2,
    title: "Lịch đá gọn trong 30 giây",
    description:
      "Tạo trận, chốt sân, đối thủ và giờ đá theo luồng tối ưu cho đội bóng phủi.",
  },
  {
    icon: MessageCircle,
    title: "Sinh ra cho nhóm Zalo",
    description:
      "Chuẩn bị sẵn webhook để nhắc lịch, gọi điểm danh và tổng hợp phản hồi tự động.",
  },
  {
    icon: WalletCards,
    title: "Quỹ đội minh bạch",
    description:
      "Theo dõi đóng quỹ, nợ sân, phạt áo và lịch sử giao dịch theo từng thành viên.",
  },
  {
    icon: ShieldCheck,
    title: "Sẵn sàng nhiều đội",
    description:
      "Kiến trúc tenant-first, phù hợp captain quản một đội hoặc sân phủi quản nhiều đội.",
  },
];

const workflowSteps = [
  "Tạo lịch đá",
  "Đẩy nhắc Zalo",
  "Thu điểm danh",
  "Chốt đội hình",
  "Tổng kết sau trận",
];

const pricingPlans = [
  {
    name: "Starter",
    price: "0đ",
    description: "Cho đội mới bắt đầu số hóa lịch đá.",
    cta: "Dùng thử",
    highlighted: false,
    items: ["1 đội bóng", "Lịch thi đấu cơ bản", "Quản lý 25 thành viên"],
  },
  {
    name: "Pro Team",
    price: "149k",
    description: "Gói tốt nhất cho đội đá hằng tuần.",
    cta: "Bắt đầu Pro",
    highlighted: true,
    items: [
      "Không giới hạn thành viên",
      "Điểm danh tự động",
      "Quỹ đội và ranking",
      "Automation qua n8n webhook",
    ],
  },
  {
    name: "Club",
    price: "Liên hệ",
    description: "Cho sân, giải đấu nhỏ hoặc cộng đồng nhiều đội.",
    cta: "Trao đổi",
    highlighted: false,
    items: ["Nhiều đội bóng", "Quyền quản trị nâng cao", "Tích hợp tùy chỉnh"],
  },
];

export function LandingPage() {
  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground">
      <HeroSection />
      <FeaturesSection />
      <AutomationSection />
      <AiBalancingSection />
      <AttendanceSection />
      <RankingSection />
      <PricingSection />
      <FinalCtaSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      <Image
        src="/images/landing-hero-football-tech.png"
        alt="KeoBong Pro football technology command center"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,10,18,0.94)_0%,rgba(6,10,18,0.82)_34%,rgba(6,10,18,0.35)_68%,rgba(6,10,18,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_76%_18%,rgba(245,189,73,0.14),transparent_28%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="absolute left-4 right-4 top-5 flex items-center justify-between sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-gold/28 bg-gold/12 font-display text-sm font-bold text-gold shadow-gold backdrop-blur-xl">
              KB
            </div>
            <span className="font-display text-sm font-semibold">
              {appConfig.name}
            </span>
          </Link>
          <Button asChild variant="luxury" size="sm">
            <Link href="/teams/demo-fc">Mở demo</Link>
          </Button>
        </nav>

        <motion.div
          variants={motionPresets.fadeUp}
          initial="hidden"
          animate="visible"
          transition={motionTransition}
          className="max-w-3xl pt-20"
        >
          <Badge variant="gold">Premium SaaS cho bóng đá phủi</Badge>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-normal text-balance sm:text-6xl lg:text-7xl">
            Quản lý đội bóng như một câu lạc bộ chuyên nghiệp.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            KeoBong Pro gom lịch đá, điểm danh, quỹ đội, ranking và automation
            Zalo vào một cockpit hiện đại cho captain và anh em trong đội.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="xl">
              <Link href="/teams/demo-fc">
                Trải nghiệm demo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="luxury" size="xl">
              <a href="#pricing">Xem giá</a>
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["5 phút", "setup đội"],
              ["Zalo", "workflow-ready"],
              ["SaaS", "multi-team"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="rounded-xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl"
              >
                <p className="font-display text-xl font-semibold text-foreground">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <Section className="pt-16">
      <PageHeader
        eyebrow="Feature showcase"
        title="Tất cả nghiệp vụ đội bóng trong một giao diện premium"
        description="Không còn file Excel, tin nhắn trôi trong nhóm, hay captain phải nhắc từng người thủ công."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <MotionCard key={feature.title} index={index}>
              <Card className="premium-card-hover h-full">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-xl border border-emerald/20 bg-emerald/10 text-emerald">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="pt-2 text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </MotionCard>
          );
        })}
      </div>
    </Section>
  );
}

function AutomationSection() {
  return (
    <Section>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <PageHeader
          eyebrow="Automation workflow"
          title="Captain tạo lịch một lần, hệ thống tự chạy phần còn lại"
          description="Luồng automation được thiết kế sẵn cho n8n webhook và Zalo workflow trong tương lai."
        />
        <Card className="overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="grid gap-3">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ ...motionTransition, delay: index * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gold/12 text-sm font-semibold text-gold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{step}</span>
                  {index < workflowSteps.length - 1 ? (
                    <GitBranch className="ml-auto size-4 text-muted-foreground" />
                  ) : (
                    <Zap className="ml-auto size-4 text-emerald" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

function AiBalancingSection() {
  return (
    <Section>
      <ShowcasePanel
        eyebrow="AI team balancing"
        title="Chia đội cân hơn, trận đá vui hơn"
        description="Mô hình sẵn sàng cho dữ liệu phong độ, vị trí, tần suất đi đá và lịch sử thắng thua để gợi ý chia đội công bằng."
        icon={Bot}
        stats={[
          ["92%", "độ cân bằng mục tiêu"],
          ["4 tiêu chí", "vị trí, phong độ, stamina, kèo"],
          ["1 chạm", "tạo lineup đề xuất"],
        ]}
      />
    </Section>
  );
}

function AttendanceSection() {
  return (
    <Section>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <Card className="order-2 lg:order-1">
          <CardContent className="p-5 sm:p-6">
            <div className="space-y-3">
              {["Đi đá", "Bận", "Chưa phản hồi"].map((label, index) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                      <UsersRound className="size-4" />
                    </span>
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className="font-display text-xl font-semibold">
                    {[12, 3, 5][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <PageHeader
          className="order-1 lg:order-2"
          eyebrow="Attendance system"
          title="Điểm danh rõ ràng trước giờ bóng lăn"
          description="Captain biết ai đi, ai bận, còn thiếu vị trí nào và cần gọi bổ sung trước khi tới sân."
        />
      </div>
    </Section>
  );
}

function RankingSection() {
  const rows = [
    ["Minh", "ST", "18", "7.9"],
    ["Quân", "CM", "14", "7.6"],
    ["Hưng", "GK", "11", "7.4"],
  ];

  return (
    <Section>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <PageHeader
          eyebrow="Ranking showcase"
          title="Ranking biến dữ liệu thành động lực thi đấu"
          description="Ghi nhận chuyên cần, phong độ và đóng góp để đội bóng có culture rõ ràng hơn."
        />
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b border-white/10 p-5">
              <Badge variant="emerald">Season 2026</Badge>
            </div>
            <div className="divide-y divide-white/10">
              {rows.map(([name, role, matches, score], index) => (
                <div
                  key={name}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gold/12 text-gold">
                    {index === 0 ? <Crown className="size-4" /> : index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role} · {matches} trận
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold">
                      {score}
                    </p>
                    <p className="text-xs text-muted-foreground">rating</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

function PricingSection() {
  return (
    <Section id="pricing">
      <PageHeader
        eyebrow="Pricing"
        title="Giá đủ nhẹ cho đội phủi, đủ mạnh để vận hành nghiêm túc"
        description="Bắt đầu miễn phí, nâng cấp khi đội cần automation, ranking và quản trị nhiều dữ liệu hơn."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <MotionCard key={plan.name} index={index}>
            <Card
              className={
                plan.highlighted
                  ? "h-full border-gold/35 bg-gold/10 shadow-gold"
                  : "h-full"
              }
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.highlighted ? (
                    <Badge variant="gold">Best value</Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="font-display text-4xl font-semibold">
                  {plan.price}
                  {plan.price !== "0đ" && plan.price !== "Liên hệ" ? (
                    <span className="text-sm font-medium text-muted-foreground">
                      /tháng
                    </span>
                  ) : null}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.highlighted ? "gold" : "luxury"}
                  size="lg"
                  className="mt-7 w-full"
                >
                  <Link href="/teams/demo-fc">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          </MotionCard>
        ))}
      </div>
    </Section>
  );
}

function FinalCtaSection() {
  return (
    <Section className="pb-20">
      <div className="premium-card relative overflow-hidden px-5 py-10 text-center sm:px-8 sm:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,189,73,0.2),transparent_34%),radial-gradient(circle_at_15%_80%,rgba(16,185,129,0.18),transparent_36%)]" />
        <div className="relative mx-auto max-w-2xl">
          <Badge variant="gold">Ready for kickoff</Badge>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-normal sm:text-5xl">
            Biến nhóm bóng phủi thành một tổ chức vận hành bài bản.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Bắt đầu với dashboard demo, sau đó triển khai dần Supabase, n8n và
            Zalo Mini App khi sản phẩm sẵn sàng ra mắt.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="gold" size="xl">
              <Link href="/teams/demo-fc">
                Mở KeoBong Pro
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="luxury" size="xl">
              <a href="#pricing">Chọn gói</a>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ShowcasePanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stats: [string, string][];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/12 text-gold shadow-gold">
              <Icon className="size-6" />
            </div>
            <div>
              <p className="premium-kicker">Smart lineup engine</p>
              <p className="mt-1 font-display text-2xl font-semibold">
                Balanced XI
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {stats.map(([value, label]) => (
              <div
                key={value}
                className="rounded-xl border border-white/10 bg-white/[0.045] p-4"
              >
                <p className="font-display text-2xl font-semibold">{value}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-emerald/20 bg-emerald/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald">
              <Sparkles className="size-4" />
              AI-ready architecture
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Feature này được trình bày ở mức showcase, sẵn sàng nối dữ liệu
              thật khi module trận đấu và cầu thủ hoàn thiện.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function MotionCard({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  return (
    <motion.div
      variants={motionPresets.fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...motionTransition, delay: index * 0.05 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
