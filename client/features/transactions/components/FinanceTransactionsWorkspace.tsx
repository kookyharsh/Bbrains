"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Loader2, ReceiptText, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { transactionApi, userApi, type ManualTransactionInput, type Transaction, type User } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudModal } from "@/features/admin/components/CrudModal"
import { DataTable } from "@/features/admin/components/DataTable"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import { FormInput } from "@/features/admin/components/form/FormInput"
import { FormSelect } from "@/features/admin/components/form/FormSelect"

type WorkspaceMode = "admin" | "manager"

const paymentModeOptions = [
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "dd", label: "Demand Draft" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "neft", label: "NEFT" },
  { value: "rtgs", label: "RTGS" },
  { value: "imps", label: "IMPS" },
  { value: "other", label: "Other" },
]

const referenceLabelByMode: Record<string, string> = {
  cash: "Reference / proof",
  cheque: "Cheque number",
  upi: "UPI transaction ID",
  dd: "DD number",
  bank_transfer: "Bank reference ID",
  card: "Card reference ID",
  neft: "NEFT reference",
  rtgs: "RTGS reference",
  imps: "IMPS reference",
  other: "Reference / proof",
}

function dedupeUsers(users: User[]) {
  return Array.from(new Map(users.map((user) => [user.id, user])).values())
}

function hasManagerRole(user: Pick<User, "roles"> | null | undefined) {
  return Boolean(
    user?.roles?.some((entry) =>
      entry?.role?.name?.toLowerCase().includes("manager")
    )
  )
}

function getUserName(user: User | null | undefined) {
  if (!user) return "Unknown user"
  const firstName = user.firstName?.trim()
  const lastName = user.lastName?.trim()
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()
  return fullName || user.username
}

function getCompactUser(user: Transaction["user"] | Transaction["relatedUser"] | Transaction["recordedByUser"]) {
  if (!user) return "Not linked"
  const fullName = [user.userDetails?.firstName, user.userDetails?.lastName].filter(Boolean).join(" ").trim()
  return fullName ? `${fullName} (@${user.username})` : `@${user.username}`
}

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function formatDate(value: string) {
  if (!value) return "Not set"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not set"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatCategory(value?: string | null) {
  if (!value) return "Other"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function loadUsersForMode(mode: WorkspaceMode) {
  if (mode === "admin") {
    return Promise.all([
      userApi.getStudents(),
      userApi.getTeachers(),
      userApi.getStaff(),
      userApi.getManagers(),
    ])
  }

  return Promise.all([
    userApi.getStudents(),
    userApi.getTeachers(),
    userApi.getStaff(),
  ])
}

interface FinanceTransactionsWorkspaceProps {
  mode: WorkspaceMode
}

export function FinanceTransactionsWorkspace({ mode }: FinanceTransactionsWorkspaceProps) {
  const [users, setUsers] = useState<User[]>([])
  const [recordedTransactions, setRecordedTransactions] = useState<Transaction[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRecorded, setLoadingRecorded] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<{
    category: ManualTransactionInput["category"]
    targetUserId: string
    amount: string
    paymentMode: ManualTransactionInput["paymentMode"]
    referenceId: string
    note: string
    paymentDate: string
  }>({
    category: "salary",
    targetUserId: "",
    amount: "",
    paymentMode: "upi",
    referenceId: "",
    note: "",
    paymentDate: new Date().toISOString().split("T")[0],
  })

  const loadRecordedTransactions = async () => {
    try {
      setLoadingRecorded(true)
      const response = await transactionApi.getRecordedTransactions({ limit: 100 })
      if (response.success) {
        setRecordedTransactions(response.data || [])
      } else {
        toast.error(response.message || "Failed to load recorded transactions")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load recorded transactions")
    } finally {
      setLoadingRecorded(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadParticipants() {
      try {
        setLoadingUsers(true)
        const responses = await loadUsersForMode(mode)
        const loadedUsers = responses.flatMap((response) => (response.success ? response.data || [] : []))
        if (mounted) {
          setUsers(dedupeUsers(loadedUsers))
        }

        const failed = responses.find((response) => !response.success)
        if (failed) {
          toast.error(failed.message || "Some transaction users could not be loaded")
        }
      } catch (error) {
        console.error(error)
        if (mounted) toast.error("Failed to load transaction users")
      } finally {
        if (mounted) setLoadingUsers(false)
      }
    }

    loadParticipants()
    loadRecordedTransactions()

    return () => {
      mounted = false
    }
  }, [mode])

  const salaryRecipients = useMemo(() => {
    return users.filter((user) => {
      if (user.type !== "teacher" && user.type !== "staff") return false
      if (mode === "manager" && hasManagerRole(user)) return false
      return true
    })
  }, [mode, users])

  const studentOptions = useMemo(() => {
    return users.filter((user) => user.type === "student")
  }, [users])

  const currentTargetOptions = form.category === "salary" ? salaryRecipients : studentOptions

  useEffect(() => {
    if (!currentTargetOptions.some((user) => user.id === form.targetUserId)) {
      setForm((current) => ({ ...current, targetUserId: currentTargetOptions[0]?.id || "" }))
    }
  }, [currentTargetOptions, form.targetUserId])

  const handleCreateTransaction = async () => {
    if (!form.targetUserId || !form.amount || Number(form.amount) <= 0 || !form.paymentDate) {
      toast.error("Please fill in the required transaction details")
      return
    }

    try {
      setSubmitting(true)
      const response = await transactionApi.createManualTransaction({
        category: form.category,
        targetUserId: form.targetUserId,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        referenceId: form.referenceId.trim() || undefined,
        note: form.note.trim() || undefined,
        paymentDate: form.paymentDate,
      })

      if (response.success) {
        toast.success("Transaction recorded successfully")
        setModalOpen(false)
        setForm({
          category: "salary",
          targetUserId: "",
          amount: "",
          paymentMode: "upi",
          referenceId: "",
          note: "",
          paymentDate: new Date().toISOString().split("T")[0],
        })
        await loadRecordedTransactions()
      } else {
        toast.error(response.message || "Failed to record transaction")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to record transaction")
    } finally {
      setSubmitting(false)
    }
  }

  const recordedTotal = recordedTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeader
        title={mode === "admin" ? "Finance Transactions" : "Manager Transactions"}
        subtitle={
          mode === "admin"
            ? "Record staff salaries and student fee receipts, then review every finance transaction recorded by admins and managers."
            : "Record teacher/staff salaries and fee receipts from students, then review what you have entered."
        }
        action={{ label: "Record Transaction", icon: <ReceiptText className="size-3.5" />, onClick: () => setModalOpen(true) }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recorded Entries</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{recordedTransactions.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Primary salary or fee events recorded by {mode === "admin" ? "admins and managers" : "the manager panel"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recorded Value</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(recordedTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Combined value of the primary finance records visible in this workspace
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <WalletCards className="size-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Recorded Finance Events</h3>
        </div>
        <DataTable<Transaction>
          data={recordedTransactions}
          loading={loadingRecorded}
          searchKeys={["note", "category", "paymentMode", "referenceId"]}
          columns={[
            {
              key: "category",
              label: "Category",
              render: (row) => <RoleBadge value={row.category || "other"} />,
            },
            {
              key: "type",
              label: "Direction",
              render: (row) => <RoleBadge value={row.type} />,
            },
            {
              key: "recordedById",
              label: "Recorded By",
              render: (row) => (
                <div>
                  <p className="font-medium text-foreground">{getCompactUser(row.recordedByUser)}</p>
                  <p className="text-xs text-muted-foreground">{row.recordedByUser?.type || "Not linked"}</p>
                </div>
              ),
            },
            {
              key: "relatedUserId",
              label: "Counterparty",
              render: (row) => (
                <div>
                  <p className="font-medium text-foreground">{getCompactUser(row.relatedUser)}</p>
                  <p className="text-xs text-muted-foreground">{row.relatedUser?.type || "Not linked"}</p>
                </div>
              ),
            },
            {
              key: "paymentMode",
              label: "Mode",
              render: (row) => row.paymentMode ? formatCategory(row.paymentMode) : "Not set",
            },
            {
              key: "referenceId",
              label: "Proof",
              render: (row) => row.referenceId || "—",
            },
            {
              key: "amount",
              label: "Amount",
              render: (row) => <span className="font-semibold text-foreground">{formatCurrency(row.amount)}</span>,
            },
            {
              key: "transactionDate",
              label: "Payment Day",
              render: (row) => formatDate(row.transactionDate),
            },
            {
              key: "note",
              label: "Note",
              render: (row) => <span className="text-xs text-muted-foreground line-clamp-2">{row.note || "—"}</span>,
            },
          ]}
          emptyText="No recorded transactions yet"
        />
      </div>

      <CrudModal
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={form.category === "salary" ? "Record Salary Payment" : "Record Fee Receipt"}
        onSubmit={handleCreateTransaction}
        submitting={submitting}
        submitLabel="Save Record"
      >
        {loadingUsers ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <div className="space-y-4">
            <FormSelect
              label="Transaction Category"
              value={form.category}
              onChange={(value) => setForm((current) => ({ ...current, category: value as ManualTransactionInput["category"], targetUserId: "" }))}
              options={[
                { value: "salary", label: "Salary Payment" },
                { value: "fee", label: "Fee Received" },
              ]}
            />
            <FormSelect
              label={form.category === "salary" ? "Recipient" : "Student"}
              value={form.targetUserId}
              onChange={(value) => setForm((current) => ({ ...current, targetUserId: value }))}
              options={[
                {
                  value: "",
                  label: currentTargetOptions.length > 0
                    ? `Select ${form.category === "salary" ? "recipient" : "student"}`
                    : "No users available",
                },
                ...currentTargetOptions.map((user) => ({
                  value: user.id,
                  label: `${getUserName(user)} (@${user.username})`,
                })),
              ]}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="0.00"
                required
              />
              <FormInput
                label="Payment Day"
                type="date"
                value={form.paymentDate}
                onChange={(event) => setForm((current) => ({ ...current, paymentDate: event.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelect
                label="Mode of Payment"
                value={form.paymentMode}
                onChange={(value) => setForm((current) => ({ ...current, paymentMode: value as ManualTransactionInput["paymentMode"] }))}
                options={paymentModeOptions}
              />
              <FormInput
                label={referenceLabelByMode[form.paymentMode] || "Reference / proof"}
                value={form.referenceId}
                onChange={(event) => setForm((current) => ({ ...current, referenceId: event.target.value }))}
                placeholder="Optional"
              />
            </div>
            <FormInput
              label="Internal Note"
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder={
                form.category === "salary"
                  ? "Optional note for the salary entry"
                  : "Optional note for the fee receipt"
              }
            />
            <p className="text-xs text-muted-foreground">
              {form.category === "salary"
                ? mode === "admin"
                  ? "Saving this creates a debit for the admin ledger and a matching income entry for the selected staff member."
                  : "Saving this creates a debit for the manager ledger and a matching income entry for the selected teacher or staff member."
                : "Saving this creates institution income for the admin finance ledger and a matching fee-paid entry for the selected student."}
            </p>
          </div>
        )}
      </CrudModal>
    </div>
  )
}
