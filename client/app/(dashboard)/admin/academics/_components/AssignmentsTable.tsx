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
import { AdminAssignment } from "../_types";

interface AssignmentsTableProps {
  assignments: AdminAssignment[];
  search: string;
  onDelete: (id: number) => void;
}

export function AssignmentsTable({ assignments, search, onDelete }: AssignmentsTableProps) {
  const filteredAssignments = assignments.filter(a => 
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.course?.name && a.course.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead className="hidden sm:table-cell">Course</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAssignments.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium text-foreground">{a.title}</TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{a.course?.name || "Unassigned"}</TableCell>
              <TableCell className="text-muted-foreground">{new Date(a.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {a.status || "Assigned"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => onDelete(a.id)}
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
