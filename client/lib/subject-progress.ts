import type { Course, SubjectChapterProgress } from "@/services/api/client";

function normalizeChapterCount(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

export function normalizeCourseSubjects(course?: Pick<Course, "subjects"> | null) {
  if (!Array.isArray(course?.subjects)) return [];

  return course.subjects
    .map((subject) => String(subject ?? "").trim())
    .filter(Boolean);
}

export function normalizeCourseSubjectProgress(
  course?: Pick<Course, "subjects" | "subjectProgress"> | null
): SubjectChapterProgress[] {
  const subjects = normalizeCourseSubjects(course);
  const rawEntries = Array.isArray(course?.subjectProgress) ? course.subjectProgress : [];

  return subjects.map((subject) => {
    const matchedEntry = rawEntries.find((entry) => entry?.subject === subject);
    const totalChapters = normalizeChapterCount(matchedEntry?.totalChapters);
    const completedChapters = totalChapters > 0
      ? Math.min(normalizeChapterCount(matchedEntry?.completedChapters), totalChapters)
      : 0;

    return {
      subject,
      totalChapters,
      completedChapters,
    };
  });
}

export function getSubjectProgressPercent(entry: Pick<SubjectChapterProgress, "totalChapters" | "completedChapters">) {
  if (!entry.totalChapters) return 0;
  return Math.min(100, Math.round((entry.completedChapters / entry.totalChapters) * 100));
}

export function canManageSubjectProgress(teacherSubjects: string[], subject: string) {
  if (teacherSubjects.length === 0) return true;
  return teacherSubjects.includes(subject);
}
