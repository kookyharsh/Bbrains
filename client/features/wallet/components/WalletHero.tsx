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
  const formatPoints = (amount: number) => Number(amount).toLocaleString();

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-[#fff7dd] via-white to-[#def2ff] p-6 shadow-sm">
      <div className="pointer-events-none absolute right-6 top-6 hidden opacity-20 md:block">
        <CreditCard className="w-14 h-14 text-slate-800" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Student Wallet
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-800">
            Your campus points, XP, and reward progress
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This wallet tracks what a student earns through assignments, attendance, streaks, and performance, then turns those points into store access and progress milestones.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Available Points</p>
                <p className="mt-3 text-4xl font-semibold">{formatPoints(walletBalance)}</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">Ready to spend in the reward store.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">XP Collected</p>
                <p className="mt-3 text-3xl font-semibold text-slate-800">{formatPoints(xp)}</p>
              </div>
              <p className="mt-2 text-sm text-slate-500">Academic growth across tasks and milestones.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current Level</p>
                <p className="mt-3 text-3xl font-semibold text-slate-800">Level {level}</p>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {nextLevel ? `${Math.max(nextLevel.requiredXp - xp, 0)} XP to next level` : "Top tier reached"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Level progress</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-5">
            <Progress value={progressPercent} className="h-3" />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Level {level}</span>
            <span>{nextLevel ? `Level ${nextLevel.levelNumber}` : "Max"}</span>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-slate-50/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Earn</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Assignments, attendance, quiz performance, and streak bonuses.</p>
            </div>
            <div className="rounded-2xl bg-slate-50/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Spend</p>
              <p className="mt-2 text-sm font-medium text-slate-700">Use points in the store for perks, unlocks, and student rewards.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/market" className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-700">
                Open Store
              </Link>
              <Link href="/assignments" className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Earn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
