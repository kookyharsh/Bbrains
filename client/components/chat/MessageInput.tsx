import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
}

export default function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message #school-chat..."
        className="pr-12 resize-none rounded-2xl min-h-[44px] max-h-[200px]"
        rows={1}
        maxLength={2000}
      />
      <div className="absolute right-2 bottom-2 text-xs text-muted-foreground bg-background px-1 rounded">
        {value.length}/2000
      </div>
      <Button
        size="icon"
        onClick={onSend}
        disabled={!value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
        variant="ghost"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
