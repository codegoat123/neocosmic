import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Trash2 } from "lucide-react";

interface GlobalChatProps {
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

const GlobalChat = ({ userId, username, isAdmin }: GlobalChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [globalRoomId, setGlobalRoomId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGlobalRoom = async () => {
      const { data } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("type", "global")
        .single();
      if (data) {
        setGlobalRoomId(data.id);
        loadMessages(data.id);
      }
    };
    fetchGlobalRoom();
  }, []);

  useEffect(() => {
    if (!globalRoomId) return;
    const channel = supabase
      .channel("global-chat")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "room_messages",
        filter: `room_id=eq.${globalRoomId}`,
      }, async (payload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", (payload.new as any).sender_id)
          .single();
        const msg = { ...(payload.new as Message), profiles: profile };
        setMessages((prev) => [...prev, msg]);
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "room_messages",
        filter: `room_id=eq.${globalRoomId}`,
      }, () => {
        if (globalRoomId) loadMessages(globalRoomId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [globalRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (roomId: string) => {
    const { data } = await supabase
      .from("room_messages")
      .select("*, profiles:sender_id(username)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data as any);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !globalRoomId) return;
    await supabase.from("room_messages").insert({
      room_id: globalRoomId,
      sender_id: userId,
      message: newMsg.trim(),
    });
    setNewMsg("");
  };

  const clearAll = async () => {
    if (!globalRoomId) return;
    // Admin clears all messages - delete via supabase
    const { data: msgs } = await supabase
      .from("room_messages")
      .select("id")
      .eq("room_id", globalRoomId);
    if (msgs) {
      for (const m of msgs) {
        await supabase.from("room_messages").delete().eq("id", m.id);
      }
    }
    setMessages([]);
  };

  return (
    <div className="neon-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h3 className="font-gaming text-xs text-primary">🌐 GLOBAL CHAT</h3>
        {isAdmin && (
          <button onClick={clearAll} className="text-[10px] font-gaming text-destructive hover:text-destructive/80 flex items-center gap-1">
            <Trash2 size={10} /> CLEAR ALL
          </button>
        )}
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

export default GlobalChat;
