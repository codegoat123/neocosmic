import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Trash2 } from "lucide-react";

interface ChatRoomViewProps {
  roomId: string;
  roomName: string;
  userId: string;
  username: string;
  isAdmin: boolean;
}

interface Message {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
  profiles?: { username: string } | null;
}

const ChatRoomView = ({ roomId, roomName, userId, username, isAdmin }: ChatRoomViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("room_messages")
      .select("*, profiles:sender_id(username)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as any);
  };

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`room-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "room_messages",
        filter: `room_id=eq.${roomId}`,
      }, async (payload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", (payload.new as any).sender_id)
          .single();
        setMessages((prev) => [...prev, { ...(payload.new as Message), profiles: profile }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await supabase.from("room_messages").insert({
      room_id: roomId,
      sender_id: userId,
      message: newMsg.trim(),
    });
    setNewMsg("");
  };

  return (
    <div className="neon-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="font-gaming text-xs text-primary">💬 {roomName.toUpperCase()}</h3>
      </div>
      <div className="h-80 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender_id === userId ? "items-end" : "items-start"}`}>
            <span className="text-[9px] text-muted-foreground font-mono-game mb-0.5">
              {(msg.profiles as any)?.username || "Unknown"}
            </span>
            <div className={`max-w-[75%] px-3 py-1.5 rounded-lg text-xs font-mono-game ${
              msg.sender_id === userId
                ? "bg-primary/20 text-foreground border border-primary/30"
                : "bg-secondary text-foreground border border-border"
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border p-2 flex gap-2">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-xs font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <button onClick={sendMessage} className="p-2 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_12px_hsl(var(--primary)/0.3)]">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoomView;
