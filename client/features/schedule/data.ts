export type WeeklyScheduleClass = {
  time: string;
  subject: string;
  room: string;
  teacher?: string;
};

export type WeeklyScheduleDay = {
  day: string;
  classes: WeeklyScheduleClass[];
};

export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const defaultWeeklySchedule: WeeklyScheduleDay[] = [
  {
    day: "Monday",
    classes: [
      { time: "8:30 - 10:00", subject: "Advanced Math", room: "Room 201", teacher: "Dr. Smith" },
      { time: "10:30 - 12:00", subject: "Physics 101", room: "Lab 3", teacher: "Prof. Johnson" },
      { time: "14:00 - 15:30", subject: "English Literature", room: "Room 105", teacher: "Ms. Davis" },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      { time: "9:00 - 10:30", subject: "Computer Science", room: "Lab 1", teacher: "Dr. Lee" },
      { time: "11:00 - 12:30", subject: "World History", room: "Room 302", teacher: "Prof. Brown" },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      { time: "8:30 - 10:00", subject: "Advanced Math", room: "Room 201", teacher: "Dr. Smith" },
      { time: "10:30 - 12:00", subject: "Art & Design", room: "Studio 2", teacher: "Ms. Taylor" },
      { time: "14:00 - 15:30", subject: "Physics 101", room: "Lab 3", teacher: "Prof. Johnson" },
    ],
  },
  {
    day: "Thursday",
    classes: [
      { time: "9:00 - 10:30", subject: "Computer Science", room: "Lab 1", teacher: "Dr. Lee" },
      { time: "11:00 - 12:30", subject: "English Literature", room: "Room 105", teacher: "Ms. Davis" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "8:30 - 10:00", subject: "World History", room: "Room 302", teacher: "Prof. Brown" },
      { time: "10:30 - 12:00", subject: "Art & Design", room: "Studio 2", teacher: "Ms. Taylor" },
    ],
  },
];

const timeSlots = ["8:30 - 10:00", "10:30 - 12:00"];

export function buildWeeklyScheduleFromCourses(
  courses: Array<{ id: string | number; name: string }>,
  teacherName?: string
): WeeklyScheduleDay[] {
  if (courses.length === 0) {
    return weekDays.map((day) => ({ day, classes: [] }));
  }

  return weekDays.map((day, dayIndex) => {
    const primary = courses[dayIndex % courses.length];
    const secondary =
      courses.length > 1 ? courses[(dayIndex + 2) % courses.length] : null;

    const classes: WeeklyScheduleClass[] = [
      {
        time: timeSlots[0],
        subject: primary.name,
        room: `Room ${201 + dayIndex}`,
        teacher: teacherName,
      },
    ];

    if (secondary && secondary.id !== primary.id) {
      classes.push({
        time: timeSlots[1],
        subject: secondary.name,
        room: `Room ${301 + dayIndex}`,
        teacher: teacherName,
      });
    }

    return { day, classes };
  });
}
