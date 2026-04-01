import { useEffect, useState } from "react";
import { getTeachersForStudent, getConversations, supabase } from "@/lib/supabase/chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; role: string };
  onSelectConversation: (id: string) => void;
}

export default function NewConversationModal({ isOpen, onClose, currentUser, onSelectConversation }: NewConversationModalProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (isOpen && currentUser.role === 'student') {
        setIsLoading(true);
        // For demonstration, simulating an API call that returns teachers assigned to the student
        try {
          const res = await fetch(`/api/chat/teachers?studentId=${currentUser.id}`);
          if (res.ok) {
            const data = await res.json();
            setTeachers(data);
          } else {
            setTeachers([]);
          }
        } catch (err) {
          console.error("Failed to load teachers", err);
          setTeachers([]);
        } finally {
          setIsLoading(false);
        }
      }
    }
    load();
  }, [isOpen, currentUser]);

  const handleSelect = async (teacherId: string, classId: number) => {
    try {
      // Check if conversation exists
      const existing = await getConversations();
      const match = existing.find(c => c.student_id === currentUser.id && c.teacher_id === teacherId && c.class_id === classId);

      if (match) {
        onSelectConversation(match.id);
      } else {
        // Create new
        const { data, error } = await supabase.from('conversations').insert({
          student_id: currentUser.id,
          teacher_id: teacherId,
          class_id: classId,
        }).select().single();

        if (error) throw error;
        onSelectConversation(data.id);
      }
      onClose();
    } catch (err) {
      console.error("Failed to start conversation", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : teachers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No teachers assigned to your classes found.
            </div>
          ) : (
            teachers.map((t) => (
              <div key={`${t.teacherId}-${t.classId}`} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={t.avatar || ""} />
                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.className}</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleSelect(t.teacherId, t.classId)}>
                  Message
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
