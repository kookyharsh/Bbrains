"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClassTimetableEntry } from "@/services/api/client";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const createEmptyEntry = (day = "Monday"): ClassTimetableEntry => ({
  day,
  subject: "",
  startTime: "09:00",
  endTime: "10:00",
  room: "",
});

type TimetableEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntries: ClassTimetableEntry[];
  subjectSuggestions: string[];
  onSave: (entries: ClassTimetableEntry[]) => void;
  saving?: boolean;
};

export function TimetableEditorDialog({
  open,
  onOpenChange,
  initialEntries,
  subjectSuggestions,
  onSave,
  saving = false,
}: TimetableEditorDialogProps) {
  const [draftEntries, setDraftEntries] = useState<ClassTimetableEntry[]>(
    () => (initialEntries.length ? initialEntries : [createEmptyEntry()])
  );

  const entriesByDay = useMemo(
    () =>
      weekDays.map((day) => ({
        day,
        entries: draftEntries
          .map((entry, index) => ({ entry, index }))
          .filter(({ entry }) => entry.day === day),
      })),
    [draftEntries]
  );

  function updateEntry(index: number, key: keyof ClassTimetableEntry, value: string) {
    setDraftEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      )
    );
  }

  function addEntry(day: string) {
    setDraftEntries((current) => [...current, createEmptyEntry(day)]);
  }

  function removeEntry(index: number) {
    setDraftEntries((current) =>
      current.length === 1 ? current : current.filter((_, entryIndex) => entryIndex !== index)
    );
  }

  function handleSave() {
    const trimmedEntries = draftEntries.map((entry) => ({
      ...entry,
      subject: entry.subject.trim(),
      room: entry.room?.trim() || "",
    }));

    const incompleteEntry = trimmedEntries.find(
      (entry) => !entry.day || !entry.subject || !entry.startTime || !entry.endTime
    );

    if (incompleteEntry) {
      toast.error("Complete each lecture row before saving the timetable");
      return;
    }

    const invalidTiming = trimmedEntries.find((entry) => entry.endTime <= entry.startTime);
    if (invalidTiming) {
      toast.error("Each lecture must end after it starts");
      return;
    }

    onSave(trimmedEntries);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Class Timetable</DialogTitle>
          <DialogDescription>
            Build the daily lecture plan for this class. Subject suggestions come from the class subjects,
            but you can still type any custom subject name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {subjectSuggestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Add subjects in the class form first if you want quick subject suggestions in the timetable.
            </div>
          ) : null}

          <datalist id="manager-class-subject-suggestions">
            {subjectSuggestions.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>

          {entriesByDay.map(({ day, entries }) => (
            <Card key={day} className="border-border/70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{day}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add one or more lectures with their own time slot for {day}.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addEntry(day)}>
                  <Plus className="mr-1 size-3.5" />
                  Add Lecture
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lectures scheduled for {day} yet.</p>
                ) : (
                  entries.map(({ entry, index }) => (
                    <div
                      key={`${day}-${index}`}
                      className="grid gap-3 rounded-xl border border-border/60 p-3 md:grid-cols-[1.3fr_0.9fr_0.9fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input
                          list="manager-class-subject-suggestions"
                          value={entry.subject}
                          onChange={(event) => updateEntry(index, "subject", event.target.value)}
                          placeholder="Mathematics"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start</Label>
                        <Input
                          type="time"
                          value={entry.startTime}
                          onChange={(event) => updateEntry(index, "startTime", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End</Label>
                        <Input
                          type="time"
                          value={entry.endTime}
                          onChange={(event) => updateEntry(index, "endTime", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Room</Label>
                        <Input
                          value={entry.room || ""}
                          onChange={(event) => updateEntry(index, "room", event.target.value)}
                          placeholder="Room / Lab"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(index)}
                          disabled={draftEntries.length === 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Close
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Assign Timetable"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
