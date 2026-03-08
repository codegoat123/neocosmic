import { useState } from "react";
import { MessageSquare, Users, UserPlus, Mic } from "lucide-react";
import GlobalChat from "./GlobalChat";
import FriendsList from "./FriendsList";
import GroupsList from "./GroupsList";
import ChatRoomView from "./ChatRoomView";
import VoiceCall from "./VoiceCall";

interface ChatSectionProps {
  userId: string;
  username: string;
  isAdmin: boolean;
}

type View = "global" | "friends" | "groups" | "room" | "voice";

const ChatSection = ({ userId, username, isAdmin }: ChatSectionProps) => {
  const [view, setView] = useState<View>("global");
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string; type: string } | null>(null);

  const openRoom = (room: { id: string; name: string; type: string }) => {
    setSelectedRoom(room);
    setView("room");
  };

  const tabs = [
    { id: "global" as View, label: "GLOBAL", icon: MessageSquare },
    { id: "friends" as View, label: "FRIENDS", icon: UserPlus },
    { id: "groups" as View, label: "GROUPS", icon: Users },
    { id: "voice" as View, label: "VOICE", icon: Mic },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-gaming text-[10px] transition-all ${
              view === tab.id
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
        {selectedRoom && (
          <button
            onClick={() => setView("room")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-gaming text-[10px] transition-all ${
              view === "room"
                ? "bg-primary text-primary-foreground"
                : "bg-accent/20 text-accent hover:bg-accent/30"
            }`}
          >
            <MessageSquare size={12} />
            {selectedRoom.name}
          </button>
        )}
      </div>

      {view === "global" && <GlobalChat userId={userId} username={username} isAdmin={isAdmin} />}
      {view === "friends" && <FriendsList userId={userId} username={username} onOpenChat={openRoom} />}
      {view === "groups" && <GroupsList userId={userId} username={username} onOpenRoom={openRoom} />}
      {view === "room" && selectedRoom && (
        <ChatRoomView roomId={selectedRoom.id} roomName={selectedRoom.name} userId={userId} username={username} isAdmin={isAdmin} />
      )}
      {view === "voice" && <VoiceCall userId={userId} username={username} />}
    </div>
  );
};

export default ChatSection;
