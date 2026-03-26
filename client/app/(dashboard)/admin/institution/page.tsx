"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, Loader2, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
import { fetchOverviewStats } from "@/app/(dashboard)/admin/overview/data";
import { emptyStats, type OverviewStats } from "@/app/(dashboard)/admin/overview/_types";

function formatDate(value: string) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFullName(firstName: string, lastName: string, fallback: string) {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || fallback;
}

export default function AdminInstitutionPage() {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchOverviewStats();
        if (mounted) setStats(data);
      } catch (error) {
        console.error("Failed to fetch institution data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  const fullName = getFullName(stats.admin.firstName, stats.admin.lastName, stats.admin.username || "Administrator");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Institution Details"
        subtitle="University profile linked to the current admin account."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>University Information</CardTitle>
            <CardDescription>
              Registration, contact, and recorded address for the linked institution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.institution ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] bg-primary/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{stats.institution.name}</p>
                      <p className="text-sm text-muted-foreground">Registration No. {stats.institution.regNo}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/60 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Institution Email</p>
                    <p className="mt-1 text-base font-medium text-foreground break-all">{stats.institution.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Registered On</p>
                    <p className="mt-1 text-base font-medium text-foreground">{formatDate(stats.institution.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Address</p>
                    <p className="mt-1 text-base font-medium text-foreground">{stats.institution.address || "No address on record"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                No institution profile is linked to this admin account yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Responsible Admin</CardTitle>
            <CardDescription>
              Primary admin profile currently attached to this institution session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-border/60 bg-muted/20 p-5">
              <Avatar className="size-16 border border-border">
                <AvatarImage src={stats.admin.avatar || undefined} />
                <AvatarFallback className="text-lg font-bold">
                  {fullName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("") || "AD"}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-xl font-bold text-foreground">{fullName}</p>
                <p className="text-sm text-muted-foreground">@{stats.admin.username}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stats.admin.email}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/profile" className="block">
                <Card className="border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <div className="flex items-center gap-2 text-primary">
                        <UserRound className="size-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">Admin Profile</span>
                      </div>
                      <p className="mt-2 text-base font-semibold text-foreground">Open profile</p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/config" className="block">
                <Card className="border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <div className="flex items-center gap-2 text-primary">
                        <Mail className="size-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]">System Config</span>
                      </div>
                      <p className="mt-2 text-base font-semibold text-foreground">Open configuration</p>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
