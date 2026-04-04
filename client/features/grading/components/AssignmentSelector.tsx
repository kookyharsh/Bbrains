"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Calendar, BookOpen } from "lucide-react"
import type { ApiAssignment } from "@/lib/types/api"

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface AssignmentSelectorProps {
  assignments: ApiAssignment[]
  value: string
  onChange: (id: string) => void
  loading?: boolean
}

export function AssignmentSelector({
  assignments,
  value,
  onChange,
  loading,
}: AssignmentSelectorProps) {
  const selected = assignments.find((a) => String(a.id) === value)

  return (
    <Combobox value={value} onValueChange={(v) => onChange(v ?? "")}>
      <ComboboxInput
        placeholder={loading ? "Loading assignments..." : "Search assignments..."}
        disabled={loading}
        showClear
      >
        <ComboboxContent>
          <ComboboxList>
            {assignments.map((assignment) => (
              <ComboboxItem key={assignment.id} value={String(assignment.id)}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{assignment.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {assignment.course?.name && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-3" />
                        {assignment.course.name}
                      </span>
                    )}
                    {assignment.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Due {fmtDate(assignment.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </ComboboxItem>
            ))}
            <ComboboxEmpty>No assignments found</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </ComboboxInput>
      {selected && (
        <div className="mt-2 text-xs text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selected.title}</span>
          {selected.course?.name && ` • ${selected.course.name}`}
        </div>
      )}
    </Combobox>
  )
}
