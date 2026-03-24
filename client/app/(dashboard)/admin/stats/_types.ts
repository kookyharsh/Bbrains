export interface StatItem {
  label: string;
  value: number | string;
  change: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface EnrollmentDataItem {
  month: string;
  students: number;
}

export interface CourseDataItem {
  name: string;
  students: number;
}

export interface AdminStats {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    activeCourses: number;
    avgAttendance: number;
  };
  enrollmentTrend: EnrollmentDataItem[];
  genderDistribution: ChartDataItem[];
  studentsByCourse: CourseDataItem[];
}
