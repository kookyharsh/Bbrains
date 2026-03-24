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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2 } from "lucide-react";
import { Student } from "../_types";

interface StudentsTableProps {
  students: Student[];
  search: string;
  onDelete: (id: string) => void;
}

export function StudentsTable({ students, search, onDelete }: StudentsTableProps) {
  const filteredStudents = students.filter(s => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const username = s.username.toLowerCase();
    const email = s.email.toLowerCase();
    // Use any property that might be relevant for search
    return fullName.includes(searchLower) || username.includes(searchLower) || email.includes(searchLower);
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead className="hidden sm:table-cell">Username</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>XP/Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => {
            const firstName = student.firstName || "";
            const lastName = student.lastName || "";
            const avatar = student.avatar;
            const level = student.xp?.level || 1;
            const xp = student.xp?.xp || 0;

            return (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      {avatar ? (
                        <img src={avatar} alt={`${firstName} ${lastName}`} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {firstName.charAt(0)}{lastName.charAt(0) || student.username.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{firstName} {lastName}</p>
                      <p className="text-[10px] text-muted-foreground sm:hidden">{student.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{student.username}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{student.email}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Lvl {level}</span>
                    <span className="text-[10px] text-muted-foreground">{Number(xp).toFixed(0)} XP</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => onDelete(student.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
