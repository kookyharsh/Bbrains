"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WalletHeroProps {
  walletBalance: number;
  xp: number;
  level: number;
  nextLevel: { levelNumber: number; requiredXp: number } | null;
  progressPercent: number;
}

export function WalletHero({ walletBalance, xp, level, nextLevel, progressPercent }: WalletHeroProps) {
  const formatPoints = (amount: number) => Number(amount ?? 0).toLocaleString();

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-border bg-card p-6 shadow-sm">
      <div className="pointer-events-none absolute right-6 top-6 hidden opacity-20 md:block">
        <CreditCard className="w-14 h-14 text-foreground" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Student Wallet
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Your campus points, XP, and reward progress
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This wallet tracks what a student earns through assignments, attendance, streaks, and performance, then turns those points into store access and progress milestones.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-foreground p-5 text-background shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-background/80">Available Points</p>
                <p className="mt-3 text-4xl font-semibold">{formatPoints(walletBalance)}</p>
              </div>
              <p className="mt-2 text-sm text-background/80">Ready to spend in the reward store.</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">XP Collected</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{formatPoints(xp)}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Academic growth across tasks and milestones.</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/50 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Current Level</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">Level {level}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {nextLevel ? `${Math.max(nextLevel.requiredXp - xp, 0)} XP to next level` : "Top tier reached"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-muted/30 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Level progress</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-5">
            <Progress value={progressPercent} className="h-3" />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Level {level}</span>
            <span>{nextLevel ? `Level ${nextLevel.levelNumber}` : "Max"}</span>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Earn</p>
              <p className="mt-2 text-sm font-medium text-foreground">Assignments, attendance, quiz performance, and streak bonuses.</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Spend</p>
              <p className="mt-2 text-sm font-medium text-foreground">Use points in the store for perks, unlocks, and student rewards.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/market" className="flex-1 rounded-full bg-foreground px-4 py-3 text-center text-sm font-medium text-background transition hover:bg-foreground/90">
                Open Store
              </Link>
              <Link href="/assignments" className="flex-1 rounded-full border border-border px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-muted">
                Earn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
