import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Course } from "../_types";

interface CoursesTableProps {
  courses: Course[];
  search: string;
  onDelete: (id: string | number) => void;
}

export function CoursesTable({ courses, search, onDelete }: CoursesTableProps) {
  const filteredCourses = courses.filter(c => 
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.standard && c.standard.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead className="hidden sm:table-cell">Standard</TableHead>
            <TableHead className="hidden lg:table-cell">Subjects</TableHead>
            <TableHead>Students</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <p className="font-medium text-foreground">{course.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{course.standard || "—"}</TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {(course.subjects || []).join(", ") || "—"}
              </TableCell>
              <TableCell><Badge variant="secondary">{course._count?.enrollments || course.enrolledStudents || 0}</Badge></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => onDelete(course.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
