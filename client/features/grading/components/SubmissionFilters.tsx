"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ClipboardCheck, RotateCcw, XCircle } from "lucide-react"

type FilterType = "all" | "submitted" | "completed" | "incomplete" | "notSubmitted"

interface SubmissionFiltersProps {
  counts: {
    all: number
    submitted: number
    completed: number
    incomplete: number
    notSubmitted: number
  }
  active: FilterType
  onChange: (filter: FilterType) => void
}

const filterConfig: {
  key: FilterType
  label: string
  icon: ReactNode
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
    label: "Awaiting Review",
    icon: <ClipboardCheck className="size-3.5" />,
    color: "text-amber-600",
  },
  {
    key: "completed",
    label: "Completed",
    icon: <CheckCircle className="size-3.5" />,
    color: "text-green-600",
  },
  {
    key: "incomplete",
    label: "Needs Rework",
    icon: <RotateCcw className="size-3.5" />,
    color: "text-orange-600",
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
