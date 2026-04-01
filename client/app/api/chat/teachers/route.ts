import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            classTeacher: {
              include: {
                userDetails: true
              }
            }
          }
        }
      }
    });

    const teachers = enrollments
      .filter(e => e.course?.classTeacher)
      .map(e => ({
        teacherId: e.course.classTeacher!.id,
        name: e.course.classTeacher!.userDetails
          ? `${e.course.classTeacher!.userDetails.firstName} ${e.course.classTeacher!.userDetails.lastName}`
          : e.course.classTeacher!.username,
        avatar: e.course.classTeacher!.userDetails?.avatar || null,
        classId: e.course.id,
        className: e.course.name
      }));

    // Deduplicate
    const uniqueTeachers = Array.from(
      new Map(teachers.map(item => [`${item.teacherId}-${item.classId}`, item])).values()
    );

    return NextResponse.json(uniqueTeachers);
  } catch (error) {
    console.error('Failed to fetch teachers', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
