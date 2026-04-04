"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

type FilterType = "all" | "submitted" | "late" | "notSubmitted"

interface SubmissionFiltersProps {
  counts: {
    all: number
    submitted: number
    late: number
    notSubmitted: number
  }
  active: FilterType
  onChange: (filter: FilterType) => void
}

const filterConfig: {
  key: FilterType
  label: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    key: "all",
    label: "All",
    icon: null,
    color: "",
  },
  {
    key: "submitted",
    label: "Submitted",
    icon: <CheckCircle className="size-3.5" />,
    color: "text-green-600",
  },
  {
    key: "late",
    label: "Late",
    icon: <AlertTriangle className="size-3.5" />,
    color: "text-amber-600",
  },
  {
    key: "notSubmitted",
    label: "Not Submitted",
    icon: <XCircle className="size-3.5" />,
    color: "text-red-600",
  },
]

export function SubmissionFilters({ counts, active, onChange }: SubmissionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterConfig.map(({ key, label, icon, color }) => (
        <Button
          key={key}
          variant={active === key ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-1.5",
            active === key && "bg-brand-purple hover:bg-brand-purple/90"
          )}
          onClick={() => onChange(key)}
        >
          {icon && <span className={color}>{icon}</span>}
          {label}
          <Badge
            variant={active === key ? "secondary" : "outline"}
            className="ml-1 h-5 min-w-5 px-1.5 text-xs"
          >
            {counts[key]}
          </Badge>
        </Button>
      ))}
    </div>
  )
}
