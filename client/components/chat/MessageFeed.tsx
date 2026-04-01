import { Fragment } from "react";
import MessageGroup from "./MessageGroup";

interface MessageFeedProps {
  messages: any[];
  currentUser: {
    id: string;
    role: string;
  };
  isFetchingNextPage: boolean;
  hasMore: boolean;
}

export default function MessageFeed({ messages, currentUser, isFetchingNextPage, hasMore }: MessageFeedProps) {
  // Group consecutive messages by the same sender within 5 minutes
  const groupedMessages: any[][] = [];
  let currentGroup: any[] = [];

  messages.forEach((msg, index) => {
    if (index === 0) {
      currentGroup.push(msg);
      return;
    }

    const prevMsg = messages[index - 1];
    const prevTime = new Date(prevMsg.created_at).getTime();
    const currTime = new Date(msg.created_at).getTime();
    const diffMinutes = (currTime - prevTime) / 1000 / 60;

    if (prevMsg.sender_id === msg.sender_id && diffMinutes <= 5 && !prevMsg.is_deleted) {
      currentGroup.push(msg);
    } else {
      groupedMessages.push(currentGroup);
      currentGroup = [msg];
    }
  });

  if (currentGroup.length > 0) {
    groupedMessages.push(currentGroup);
  }

  return (
    <div className="flex flex-col gap-4">
      {hasMore && isFetchingNextPage && (
        <div className="flex justify-center p-2">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {!hasMore && (
        <div className="text-center text-xs text-muted-foreground my-4">
          End of history
        </div>
      )}
      {groupedMessages.map((group, idx) => (
        <MessageGroup key={idx} group={group} currentUser={currentUser} />
      ))}
    </div>
  );
}
