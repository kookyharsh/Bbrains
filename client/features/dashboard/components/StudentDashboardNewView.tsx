import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BellRing,
  BookOpenText,
  CalendarDays,
  NotebookText,
  Sparkles,
  Trophy,
  WalletCards,
} from "lucide-react";
import { DailyRewardCard } from "@/features/dashboard/components/DailyRewardCard";
import { WalletMiniCard } from "@/features/dashboard/components/WalletMiniCard";
import { AttendanceCard } from "@/features/dashboard/components/AttendanceCard";
import { LeaderboardCard } from "@/features/dashboard/components/LeaderboardCard";
import { UpcomingEventsCard } from "@/features/dashboard/components/UpcomingEventsCard";
import { AnnouncementsCard } from "@/features/dashboard/components/AnnouncementsCard";
import { MyTasksCard } from "@/features/dashboard/components/MyTasksCard";
import { DashboardContent } from "@/components/dashboard-content";
import { LevelWidget } from "@/features/dashboard/components/LevelWidget";
import { FeeStatusCard } from "@/features/dashboard/components/FeeStatusCard";
import { HandButton } from "@/components/hand-drawn/button";
import {
  HandCard,
  HandCardContent,
  HandCardDescription,
  HandCardHeader,
  HandCardTitle,
} from "@/components/hand-drawn/card";
import { cn } from "@/lib/utils";
import type { DashboardData, LeaderboardEntry } from "@/services/api/client";

function formatCurrency(amount: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

function formatShortDate(dateString?: string) {
  if (!dateString) return "No date yet";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "No date yet";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatFullDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function SketchPanel({
  children,
  className,
  tilt = "rotate-[-1deg]",
  tapeClassName,
  accentClassName = "bg-hand-yellow/25",
}: {
  children: ReactNode;
  className?: string;
  tilt?: string;
  tapeClassName?: string;
  accentClassName?: string;
}) {
  return (
    <div className={cn("relative pt-5", className)}>
      <div
        className={cn(
          "absolute left-1/2 top-0 h-6 w-24 -translate-x-1/2 rounded bg-white/75 shadow-sm backdrop-blur",
          tapeClassName
        )}
      />
      <div className={cn("relative transition-transform duration-300 hover:rotate-0", tilt)}>
        <div
          className={cn(
            "absolute inset-3 rounded-[28px] border-2 border-hand-pencil/10",
            accentClassName
          )}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

export function StudentDashboardNewView({
  dashboardData,
  transformedLeaderboard,
  username,
  resolvedLevel,
  resolvedXp,
}: {
  dashboardData: DashboardData | null;
  transformedLeaderboard: LeaderboardEntry[];
  username: string;
  resolvedLevel: number;
  resolvedXp: number;
}) {
  const leaderboardRank = dashboardData?.stats?.leaderboardRank;
  const streakDays = Math.max(
    0,
    Number(dashboardData?.streak?.currentStreak ?? dashboardData?.stats?.streak ?? 0)
  );
  const walletBalance = Number(
    dashboardData?.wallet?.balance ?? dashboardData?.stats?.walletBalance ?? 0
  );
  const attendancePercentage = Number(dashboardData?.attendance?.percentage ?? 0);
  const feeRemaining = dashboardData?.feeSummary?.remainingAmount;
  const feeCurrency = dashboardData?.feeSummary?.currency || "INR";
  const nextEvent = dashboardData?.events?.[0];
  const latestAnnouncement = dashboardData?.announcements?.[0];

  const quickStats = [
    {
      label: "Current level",
      value: `Lvl ${resolvedLevel}`,
      note: `${resolvedXp.toLocaleString("en-IN")} XP collected`,
      color: "yellow" as const,
      tilt: "-rotate-2",
      textClassName: "text-hand-pencil",
      noteClassName: "text-hand-pencil/75",
      labelClassName: "text-hand-pencil/65",
    },
    {
      label: "Study streak",
      value: `${streakDays} day${streakDays === 1 ? "" : "s"}`,
      note: streakDays > 0 ? "Momentum is building nicely" : "Claim today and start the chain",
      color: "default" as const,
      tilt: "rotate-1",
      textClassName: "text-hand-pencil",
      noteClassName: "text-hand-pencil/75",
      labelClassName: "text-hand-pencil/65",
    },
    {
      label: "Class rank",
      value: leaderboardRank ? `#${leaderboardRank}` : "Unranked",
      note: leaderboardRank ? "Keep climbing the board" : "Jump into the leaderboard this week",
      color: "blue" as const,
      tilt: "-rotate-1",
      textClassName: "text-white",
      noteClassName: "text-white/80",
      labelClassName: "text-white/70",
    },
  ];

  const deskNotes = [
    {
      title: "Wallet ready",
      body: `${walletBalance.toLocaleString("en-IN")} available in your wallet`,
      icon: WalletCards,
    },
    {
      title: "Fees snapshot",
      body:
        feeRemaining == null
          ? "Class fees are still being configured."
          : `${formatCurrency(feeRemaining, feeCurrency)} remaining for your classes`,
      icon: NotebookText,
    },
    {
      title: "Next event",
      body: nextEvent
        ? `${nextEvent.title} on ${formatShortDate(nextEvent.date)}`
        : "No upcoming events on the board right now.",
      icon: CalendarDays,
    },
  ];

  return (
    <DashboardContent maxWidth="max-w-[92rem]" className="space-y-8">
      <div className="relative overflow-hidden rounded-[42px] border-[3px] border-hand-pencil bg-hand-paper bg-paper-texture [background-size:18px_18px] shadow-[10px_10px_0px_0px_rgba(45,45,45,0.12)]">
        <div className="absolute -left-10 top-20 h-40 w-40 rounded-full bg-hand-yellow/60 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-hand-blue/10 blur-3xl" />
        <div className="absolute bottom-8 right-8 hidden h-24 w-24 rounded-full border-[3px] border-dashed border-hand-red/50 lg:block" />

        <svg
          className="pointer-events-none absolute left-10 top-10 hidden text-hand-blue/60 md:block"
          width="110"
          height="110"
          viewBox="0 0 110 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 48C27 24 53 10 79 15C95 18 99 33 93 45C88 56 74 60 62 63C47 66 31 69 19 80C13 85 9 92 10 99"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="7 9"
          />
        </svg>

        <section className="relative grid gap-8 border-b-[3px] border-dashed border-hand-pencil/20 px-5 py-8 md:px-8 xl:grid-cols-[1.25fr_0.92fr] xl:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-hand-pencil bg-white/80 px-4 py-2 font-patrick text-base text-hand-pencil shadow-[3px_3px_0px_0px_rgba(45,45,45,0.08)]">
              <Sparkles className="h-4 w-4 text-hand-red" />
              Student Study Board
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="font-kalam text-4xl font-bold leading-tight text-hand-pencil md:text-6xl">
                Welcome back,
                <span className="relative ml-3 inline-block text-hand-red">
                  {username}
                  <span className="absolute -bottom-1 left-0 h-3 w-full -rotate-1 bg-hand-yellow/90" />
                </span>
              </h1>
              <p className="max-w-2xl font-patrick text-xl leading-relaxed text-hand-pencil/80 md:text-2xl">
                Your dashboard now feels like the landing page grew up with you:
                warmer, more human, and centered around the things you need to
                act on today.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <HandButton asChild className="-rotate-1">
                <Link href="/assignments">
                  Open assignments <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </HandButton>
              <HandButton asChild variant="secondary" className="rotate-1">
                <Link href="/transactions">View fee history</Link>
              </HandButton>
              <HandButton asChild variant="outline" className="-rotate-1">
                <Link href="/announcements">See announcements</Link>
              </HandButton>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {quickStats.map((stat) => (
                <HandCard
                  key={stat.label}
                  variant={stat.color}
                  decoration="tape"
                  className={cn("p-5", stat.tilt)}
                >
                  <p className={cn("font-patrick text-sm uppercase tracking-[0.18em]", stat.labelClassName)}>
                    {stat.label}
                  </p>
                  <p className={cn("mt-3 font-kalam text-3xl font-bold", stat.textClassName)}>
                    {stat.value}
                  </p>
                  <p className={cn("mt-2 font-patrick text-lg", stat.noteClassName)}>
                    {stat.note}
                  </p>
                </HandCard>
              ))}
            </div>
          </div>

          <HandCard
            variant="yellow"
            decoration="tack"
            className="overflow-hidden bg-white/90 xl:ml-auto xl:max-w-[30rem]"
          >
            <HandCardHeader className="space-y-3 border-b-2 border-dashed border-hand-pencil/15 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-patrick text-sm uppercase tracking-[0.2em] text-hand-pencil/60">
                    Today at a glance
                  </p>
                  <HandCardTitle className="mt-2 text-4xl">
                    Your desk note
                  </HandCardTitle>
                </div>
                <div className="self-start rounded-full border-2 border-hand-pencil bg-white px-3 py-1.5 font-patrick text-sm text-hand-pencil/75">
                  {formatFullDate()}
                </div>
              </div>
              <HandCardDescription className="text-xl">
                A quick handwritten snapshot of what needs your attention before
                the day gets busy.
              </HandCardDescription>
            </HandCardHeader>
            <HandCardContent className="space-y-4 pt-6">
              {deskNotes.map((note) => {
                const Icon = note.icon;

                return (
                  <div
                    key={note.title}
                    className="flex items-start gap-4 rounded-[22px] border-2 border-hand-pencil/15 bg-white/80 p-4 shadow-[3px_3px_0px_0px_rgba(45,45,45,0.06)]"
                  >
                    <div className="mt-1 rounded-full border-2 border-hand-pencil bg-hand-yellow p-2 text-hand-blue">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-kalam text-2xl font-bold text-hand-pencil">
                        {note.title}
                      </p>
                      <p className="font-patrick text-lg leading-relaxed text-hand-pencil/75">
                        {note.body}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[24px] border-2 border-dashed border-hand-pencil/25 bg-hand-blue/10 p-4">
                <div className="flex items-start gap-3">
                  <BellRing className="mt-1 h-5 w-5 text-hand-red" />
                  <div>
                    <p className="font-kalam text-2xl font-bold text-hand-pencil">
                      Latest announcement
                    </p>
                    <p className="font-patrick text-lg text-hand-pencil/80">
                      {latestAnnouncement?.title || "Nothing new has been posted yet."}
                    </p>
                  </div>
                </div>
              </div>
            </HandCardContent>
          </HandCard>
        </section>

        <section className="relative space-y-8 px-5 py-8 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-patrick text-sm uppercase tracking-[0.2em] text-hand-pencil/55">
                Focus lane
              </p>
              <h2 className="font-kalam text-4xl font-bold text-hand-pencil">
                Your daily momentum board
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border-2 border-hand-pencil/20 bg-white/70 px-4 py-2 font-patrick text-lg text-hand-pencil/70 md:flex">
              <Trophy className="h-4 w-4 text-hand-red" />
              Attendance at {attendancePercentage}% today
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <SketchPanel tilt="-rotate-1" accentClassName="bg-hand-yellow/20">
              <LevelWidget
                level={resolvedLevel}
                xp={resolvedXp}
                nextLevelXp={dashboardData?.stats?.nextLevelRequiredXp}
                currentLevelXp={dashboardData?.stats?.currentLevelRequiredXp}
              />
            </SketchPanel>

            <SketchPanel tilt="rotate-1" accentClassName="bg-hand-red/10">
              <DailyRewardCard initialStreak={dashboardData?.streak} />
            </SketchPanel>

            <SketchPanel tilt="-rotate-1" accentClassName="bg-hand-blue/10">
              <WalletMiniCard initialWallet={dashboardData?.wallet} />
            </SketchPanel>

            <SketchPanel tilt="rotate-1" accentClassName="bg-hand-yellow/25">
              <Link href="/transactions" className="block h-full">
                <FeeStatusCard feeSummary={dashboardData?.feeSummary} />
              </Link>
            </SketchPanel>

            <SketchPanel tilt="-rotate-1" accentClassName="bg-hand-blue/10">
              <AttendanceCard initialAttendance={dashboardData?.attendance} />
            </SketchPanel>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <SketchPanel
              tilt="-rotate-1"
              accentClassName="bg-hand-yellow/15"
              tapeClassName="left-10 translate-x-0 rotate-[-8deg]"
            >
              <LeaderboardCard initialLeaderboard={transformedLeaderboard} />
            </SketchPanel>

            <SketchPanel
              tilt="rotate-1"
              accentClassName="bg-hand-blue/10"
              tapeClassName="right-10 left-auto translate-x-0 rotate-[8deg]"
            >
              <MyTasksCard />
            </SketchPanel>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SketchPanel tilt="-rotate-1" accentClassName="bg-hand-red/10">
              <AnnouncementsCard initialAnnouncements={dashboardData?.announcements?.slice(0, 5)} />
            </SketchPanel>

            <SketchPanel tilt="rotate-1" accentClassName="bg-hand-yellow/20">
              <UpcomingEventsCard initialEvents={dashboardData?.events?.slice(0, 5)} />
            </SketchPanel>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-2 border-dashed border-hand-pencil/25 bg-white/60 px-5 py-4">
            <div>
              <p className="font-kalam text-3xl font-bold text-hand-pencil">
                Keep this space feeling personal
              </p>
              <p className="font-patrick text-lg text-hand-pencil/75">
                The dashboard now borrows the same playful paper language as the
                landing page while keeping your study tools front and center.
              </p>
            </div>
            <HandButton asChild variant="secondary" className="rotate-1">
              <Link href="/calendar">
                Plan the week <BookOpenText className="ml-2 h-4 w-4" />
              </Link>
            </HandButton>
          </div>
        </section>
      </div>
    </DashboardContent>
  );
}
