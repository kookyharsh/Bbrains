import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course } from "../_types";

interface AcademicsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "course" | "assignment" | "student";
  courses: Course[];
}

export function AcademicsDialog({ open, onOpenChange, type, courses }: AcademicsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "course" && "Add New Course"}
            {type === "student" && "Add New Student"}
            {type === "assignment" && "Add New Assignment"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {type === "student" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input placeholder="First name" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder="Last name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email</Label>
                  <Input placeholder="student@uni.edu" type="email" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input placeholder="johndoe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Year (Metadata)</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freshman">Freshman</SelectItem>
                      <SelectItem value="sophomore">Sophomore</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input placeholder="Street address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input placeholder="City" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input placeholder="State" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Zip Code</Label>
                  <Input placeholder="12345" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input placeholder="Country" />
                </div>
              </div>
            </>
          )}
          {type === "course" && (
            <>
              <div><Label>Class Name</Label><Input placeholder="Class A / BSc Computer Science" /></div>
              <div><Label>Standard / Batch</Label><Input placeholder="8th Standard / FY BCom" /></div>
              <div><Label>Description</Label><Textarea placeholder="Class description" /></div>
              <div><Label>Teacher ID</Label><Input placeholder="Teacher user ID" /></div>
            </>
          )}
          {type === "assignment" && (
            <>
              <div><Label>Title</Label><Input placeholder="Assignment title" /></div>
              <div><Label>Course</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea placeholder="Assignment description" /></div>
              <div><Label>Due Date</Label><Input type="date" /></div>
              <div><Label>Total Points</Label><Input type="number" placeholder="100" /></div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
