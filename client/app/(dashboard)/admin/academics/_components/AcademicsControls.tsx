import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, BookOpen, GraduationCap, ClipboardList } from "lucide-react";

interface AcademicsControlsProps {
  tab: string;
  search: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export function AcademicsControls({ tab, search, onSearchChange, onAddClick }: AcademicsControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <TabsList>
        <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-1" /> Courses</TabsTrigger>
        <TabsTrigger value="students"><GraduationCap className="w-4 h-4 mr-1" /> Students</TabsTrigger>
        <TabsTrigger value="assignments"><ClipboardList className="w-4 h-4 mr-1" /> Assignments</TabsTrigger>
      </TabsList>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            value={search} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-9" 
          />
        </div>
        <Button onClick={onAddClick}>
          <Plus className="w-4 h-4 mr-1" /> Add {tab === "courses" ? "Course" : tab === "students" ? "Student" : "Assignment"}
        </Button>
      </div>
    </div>
  );
}
