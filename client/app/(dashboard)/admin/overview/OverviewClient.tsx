"use client"

import Link from "next/link"
import {
    ArrowUpRight,
    BadgeIndianRupee,
    BriefcaseBusiness,
    Building2,
    Landmark,
    Mail,
    ShieldCheck,
    UserCheck,
    Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import type { OverviewStats } from "./_types"
import type { ReactNode } from "react"

interface OverviewClientProps {
    stats: OverviewStats
}

function formatCurrency(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount)
    } catch {
        return `INR ${amount.toLocaleString("en-IN")}`
    }
}

function formatDate(value: string) {
    if (!value) return "Not available"

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Not available"

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date)
}

function getFullName(firstName: string, lastName: string, fallback: string) {
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || fallback
}

function PercentageBar({
    label,
    value,
    total,
    tone,
}: {
    label: string
    value: number
    total: number
    tone: string
}) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground">
                    {value} ({percentage}%)
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    sub,
    icon,
    iconTone,
    href,
}: {
    label: string
    value: string | number
    sub: string
    icon: ReactNode
    iconTone: string
    href: string
}) {
    const content = (
        <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
            <CardContent className="flex items-start justify-between p-5 transition-all hover:border-primary/40 hover:shadow-md">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className={`rounded-2xl p-3 ${iconTone}`}>
                        {icon}
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    )

    return (
        <Link href={href} className="block">
            {content}
        </Link>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 py-3 last:border-b-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-medium text-foreground">{value || "Not available"}</span>
        </div>
    )
}

export function OverviewClient({ stats }: OverviewClientProps) {
    const totalStudents = stats.students.total
    const fullName = getFullName(stats.admin.firstName, stats.admin.lastName, stats.admin.username || "Administrator")
    const currentDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date())

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
                <SectionHeader
                    title="Admin Dashboard"
                    subtitle="A focused view of headcount, fee visibility, and institution details."
                />

                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            {stats.institution?.name || "Institution Workspace"}
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Leadership snapshot for {fullName}
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground">
                            Teachers, managers, staff, student mix, receivables, and institution profile are grouped here so the admin can read the system state without switching pages.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
                        {currentDate}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Teachers"
                    value={stats.people.teachers}
                    sub="Active faculty count"
                    icon={<UserCheck className="size-5 text-blue-700" />}
                    iconTone="bg-blue-500/10"
                    href="/admin/teachers"
                />
                <MetricCard
                    label="Managers"
                    value={stats.people.managers}
                    sub="Users carrying manager roles"
                    icon={<BriefcaseBusiness className="size-5 text-amber-700" />}
                    iconTone="bg-amber-500/10"
                    href="/admin/roles"
                />
                <MetricCard
                    label="Other Staff"
                    value={stats.people.staff}
                    sub="Support staff beyond managers"
                    icon={<ShieldCheck className="size-5 text-emerald-700" />}
                    iconTone="bg-emerald-500/10"
                    href="/admin/users"
                />
                <MetricCard
                    label="Students"
                    value={stats.people.students}
                    sub={stats.people.studentToTeacherRatio ? `${stats.people.studentToTeacherRatio}:1 student-teacher ratio` : "No teacher ratio available"}
                    icon={<Users className="size-5 text-primary" />}
                    iconTone="bg-primary/10"
                    href="/admin/students"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Link href="/admin/stats" className="block">
                <Card className="border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle>Student Distribution</CardTitle>
                                <CardDescription>
                                    Girls and boys ratio, with other genders tracked separately when present.
                                </CardDescription>
                            </div>
                            <ArrowUpRight className="size-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-blue-500/10 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Boys</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.students.boys}</p>
                            </div>
                            <div className="rounded-2xl bg-pink-500/10 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">Girls</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.students.girls}</p>
                            </div>
                            <div className="rounded-2xl bg-muted p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other / Unspecified</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.students.others}</p>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-[1.5rem] border border-border/60 bg-muted/30 p-5">
                            <PercentageBar
                                label="Boys"
                                value={stats.students.boys}
                                total={totalStudents}
                                tone="bg-blue-600"
                            />
                            <PercentageBar
                                label="Girls"
                                value={stats.students.girls}
                                total={totalStudents}
                                tone="bg-pink-600"
                            />
                            {stats.students.others > 0 && (
                                <PercentageBar
                                    label="Other / Unspecified"
                                    value={stats.students.others}
                                    total={totalStudents}
                                    tone="bg-slate-600"
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
                </Link>

                <Link href="/admin/finance" className="block">
                <Card className="border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle>Finance Visibility</CardTitle>
                                <CardDescription>
                                    Tracks received fee income, accrued receivables, and the configured fee base.
                                </CardDescription>
                            </div>
                            <ArrowUpRight className="size-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="rounded-[1.5rem] bg-emerald-500/10 p-5">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <BadgeIndianRupee className="size-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.14em]">Income Received</span>
                            </div>
                            <p className="mt-3 text-3xl font-bold text-foreground">
                                {formatCurrency(stats.finance.receivedIncome, stats.finance.currency)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Source: {stats.finance.receivedSource === "config" ? "configured totals" : "fee-tagged successful transactions"}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.5rem] border border-border/60 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Accrued Income</p>
                                <p className="mt-2 text-2xl font-bold text-foreground">
                                    {formatCurrency(stats.finance.accruedIncome, stats.finance.currency)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {stats.finance.accruedSource === "config"
                                        ? `Based on ${formatCurrency(stats.finance.feePerStudent, stats.finance.currency)} per student`
                                        : "Set a per-student fee config to calculate accrued income"}
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-border/60 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Receivable Amount</p>
                                <p className="mt-2 text-2xl font-bold text-foreground">
                                    {formatCurrency(stats.finance.receivableIncome, stats.finance.currency)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Outstanding amount from accrued minus received income
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-dashed border-border/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Latest Successful Transactions</p>
                            <div className="mt-3 space-y-3">
                                {stats.finance.latestTransactions.length > 0 ? (
                                    stats.finance.latestTransactions.slice(0, 4).map((transaction, index) => (
                                        <div key={`${transaction.transactionDate}-${index}`} className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {transaction.note || "Transaction entry"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(transaction.transactionDate)}
                                                </p>
                                            </div>
                                            <span className={transaction.type === "credit" ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-rose-600"}>
                                                {transaction.type === "credit" ? "+" : "-"}
                                                {formatCurrency(transaction.amount, stats.finance.currency)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent successful transactions found.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                </Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Link href="/profile" className="block">
                <Card className="border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle>Admin Information</CardTitle>
                                <CardDescription>
                                    Current administrator identity, contact details, and wallet balance.
                                </CardDescription>
                            </div>
                            <ArrowUpRight className="size-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
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

                            <div className="min-w-0 flex-1">
                                <p className="text-xl font-bold text-foreground">{fullName}</p>
                                <p className="text-sm text-muted-foreground">@{stats.admin.username}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        {stats.admin.type}
                                    </span>
                                    {stats.admin.roles.map((role) => (
                                        <span key={role} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <InfoRow label="Email" value={stats.admin.email} />
                            <InfoRow label="Phone" value={stats.admin.phone || "Not provided"} />
                            <InfoRow label="Wallet Balance" value={formatCurrency(stats.admin.walletBalance, stats.finance.currency)} />
                            <InfoRow label="Joined" value={formatDate(stats.admin.createdAt)} />
                            <InfoRow label="Bio" value={stats.admin.bio || "No bio added yet"} />
                        </div>
                    </CardContent>
                </Card>
                </Link>

                <Link href="/admin/institution" className="block">
                <Card className="border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle>University Information</CardTitle>
                                <CardDescription>
                                    Linked institution details for this admin account.
                                </CardDescription>
                            </div>
                            <ArrowUpRight className="size-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.institution ? (
                            <>
                                <div className="rounded-[1.5rem] bg-primary/10 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                                            <Landmark className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-foreground">{stats.institution.name}</p>
                                            <p className="text-sm text-muted-foreground">Registration No. {stats.institution.regNo}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <InfoRow label="Institution Email" value={stats.institution.email} />
                                    <InfoRow label="Registered On" value={formatDate(stats.institution.createdAt)} />
                                    <InfoRow label="Address" value={stats.institution.address || "No address on record"} />
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Building2 className="size-4" />
                                            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Institution</span>
                                        </div>
                                        <p className="mt-2 text-base font-semibold text-foreground">{stats.institution.name}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="size-4" />
                                            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Contact</span>
                                        </div>
                                        <p className="mt-2 text-base font-semibold text-foreground break-all">{stats.institution.email}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-[1.5rem] border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                                No university or college profile is linked to this admin account yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
                </Link>
            </div>
        </div>
    )
}
