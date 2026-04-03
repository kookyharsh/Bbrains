"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
    ArrowRight,
    BadgeIndianRupee,
    BookOpen,
    BriefcaseBusiness,
    Building2,
    CalendarCheck2,
    Landmark,
    Mail,
    Users,
    Wallet,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import type { ManagerOverviewStats } from "./_types"

function formatCurrency(amount: number | null, currency: string) {
    if (amount === null) return "Non existent"

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

function formatDate(value: string | null) {
    if (!value) return "Non existent"

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Non existent"

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

function MetricCard({
    label,
    value,
    sub,
    icon,
    tone,
}: {
    label: string
    value: string | number
    sub: string
    icon: ReactNode
    tone: string
}) {
    return (
        <Card className="border-border/60 bg-card/90 shadow-sm">
            <CardContent className="flex items-start justify-between p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
                </div>
                <div className={`rounded-2xl p-3 ${tone}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 py-3 last:border-b-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-medium text-foreground">{value || "Non existent"}</span>
        </div>
    )
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-border/70 p-5">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

export function ManagerOverviewClient({ stats }: { stats: ManagerOverviewStats }) {
    const fullName = getFullName(stats.manager.firstName, stats.manager.lastName, stats.manager.username || "Manager")
    const currentDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date())

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                        <SectionHeader
                            title="Manager Dashboard"
                            subtitle="A focused view of staffing, classes, students, finance, and existing attendance records."
                        />

                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                {stats.institution?.name || "Institution Workspace"}
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Leadership snapshot for {fullName}
                            </h1>
                            <p className="max-w-3xl text-sm text-muted-foreground">
                                This dashboard reuses the current system data. Where the project has no salary or staff-attendance records yet, the card states that clearly instead of inventing numbers.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:min-w-[280px]">
                        <Link href="/transactions?view=salary" className="block">
                            <Card className="border-border/60 bg-background/80 shadow-sm backdrop-blur transition-all hover:border-primary/40 hover:shadow-md">
                                <CardContent className="p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Salary Received</p>
                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        {formatCurrency(stats.manager.ownIncomeReceived, stats.finance.currency)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {stats.manager.ownIncomeSource === "tagged-transactions"
                                            ? "From your salary credit transactions"
                                            : "No salary receipt data exists yet"}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
                            {currentDate}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Total Staff"
                    value={stats.people.totalStaff}
                    sub={`${stats.people.teachers} teachers + ${stats.people.otherStaff} other staff`}
                    icon={<BriefcaseBusiness className="size-5 text-amber-700" />}
                    tone="bg-amber-500/10"
                />
                <MetricCard
                    label="Classes / Courses"
                    value={stats.people.classes}
                    sub="Current classes or courses in the system"
                    icon={<BookOpen className="size-5 text-blue-700" />}
                    tone="bg-blue-500/10"
                />
                <MetricCard
                    label="Students"
                    value={stats.people.students}
                    sub={`${stats.people.boys} boys, ${stats.people.girls} girls`}
                    icon={<Users className="size-5 text-primary" />}
                    tone="bg-primary/10"
                />
                <MetricCard
                    label="Fees Received"
                    value={formatCurrency(stats.finance.feesReceived, stats.finance.currency)}
                    sub={stats.finance.feesReceivedSource === "unavailable" ? "Non existent" : `Source: ${stats.finance.feesReceivedSource}`}
                    icon={<BadgeIndianRupee className="size-5 text-emerald-700" />}
                    tone="bg-emerald-500/10"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Student Distribution</CardTitle>
                        <CardDescription>
                            Boys and girls counts are taken from the existing student records. Unspecified entries stay separate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-blue-500/10 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Boys</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.people.boys}</p>
                            </div>
                            <div className="rounded-2xl bg-pink-500/10 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-700">Girls</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.people.girls}</p>
                            </div>
                            <div className="rounded-2xl bg-muted p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other / Unspecified</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.people.others}</p>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] border border-border/60 bg-muted/30 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Classes tracked in the institution</p>
                                    <p className="text-sm text-muted-foreground">
                                        The current project stores these as courses, so that count is reused for the manager view.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Classes</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.people.classes}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Finance Snapshot</CardTitle>
                        <CardDescription>
                            Fees received are pulled from the existing fee configs or fee-tagged transactions. Salary paid is shown only when salary-like data exists.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-[1.5rem] bg-emerald-500/10 p-5">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <BadgeIndianRupee className="size-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.14em]">Fees Received</span>
                            </div>
                            <p className="mt-3 text-3xl font-bold text-foreground">
                                {formatCurrency(stats.finance.feesReceived, stats.finance.currency)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {stats.finance.feesReceivedSource === "unavailable"
                                    ? "No fee totals exist in configs or tagged transactions yet."
                                    : `Source: ${stats.finance.feesReceivedSource}`}
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-border/60 p-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="size-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.14em]">Salary Paid</span>
                            </div>
                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {formatCurrency(stats.finance.salaryPaid, stats.finance.currency)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {stats.finance.salaryPaidSource === "unavailable"
                                    ? "Non existent in the current project data."
                                    : `Source: ${stats.finance.salaryPaidSource}`}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Staff And Teacher Attendance</CardTitle>
                        <CardDescription>
                            This is based only on attendance records that already exist for users marked as teacher or staff.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.attendance.source === "records" ? (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-muted/40 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Attendance Records</p>
                                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.attendance.totalRecords}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {stats.attendance.teacherRecords} teacher records and {stats.attendance.staffRecords} staff records
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-primary/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Latest Marked Date</p>
                                        <p className="mt-2 text-2xl font-bold text-foreground">{formatDate(stats.attendance.latestMarkedAt)}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-border/60 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Present</p>
                                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.attendance.present}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Absent</p>
                                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.attendance.absent}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Late</p>
                                        <p className="mt-2 text-2xl font-bold text-foreground">{stats.attendance.late}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                title="Non existent"
                                description="No teacher or staff attendance records were found in the current database, so the dashboard does not estimate or fake this metric."
                            />
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Manager Profile</CardTitle>
                        <CardDescription>
                            Your current account details and institution linkage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-start gap-4 rounded-[1.5rem] border border-border/60 bg-muted/20 p-5">
                            <Avatar className="size-16 border border-border">
                                <AvatarImage src={stats.manager.avatar || undefined} />
                                <AvatarFallback className="text-lg font-bold">
                                    {fullName
                                        .split(" ")
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((part) => part[0])
                                        .join("") || "MG"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <p className="text-xl font-bold text-foreground">{fullName}</p>
                                <p className="text-sm text-muted-foreground">@{stats.manager.username}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        {stats.manager.type}
                                    </span>
                                    {stats.manager.roles.map((role) => (
                                        <span key={role} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <InfoRow label="Email" value={stats.manager.email} />
                            <InfoRow label="Phone" value={stats.manager.phone || "Non existent"} />
                            <InfoRow label="Wallet Balance" value={formatCurrency(stats.manager.walletBalance, stats.finance.currency)} />
                            <InfoRow label="Joined" value={formatDate(stats.manager.createdAt)} />
                            <InfoRow label="Bio" value={stats.manager.bio || "Non existent"} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle>Institution Context</CardTitle>
                            <CardDescription>
                                The manager dashboard reuses the same institution profile already linked to the account.
                            </CardDescription>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent>
                    {stats.institution ? (
                        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
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

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
                                    <p className="mt-2 break-all text-base font-semibold text-foreground">{stats.institution.email}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/60 p-4 lg:col-span-2">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Registered On</p>
                                        <p className="mt-2 text-base font-semibold text-foreground">{formatDate(stats.institution.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Address</p>
                                        <p className="mt-2 text-base font-semibold text-foreground">{stats.institution.address || "Non existent"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Attendance Source</p>
                                        <div className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                                            <CalendarCheck2 className="size-4 text-primary" />
                                            <span>{stats.attendance.source === "records" ? "Existing records" : "Non existent"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState
                            title="Non existent"
                            description="No linked institution profile was found for this manager account."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
