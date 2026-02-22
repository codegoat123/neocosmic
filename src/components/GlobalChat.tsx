import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Trash2, Ban, Eraser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

const GlobalChat = ({ isAdmin }: { isAdmin: boolean }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("chat_username") || `Player${Math.floor(Math.random() * 9999)}`;
  });
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("neocosmic_muted_chat") || "[]"));
    } catch { return new Set(); }
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[]);
      });

    const channel = supabase
      .channel("chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (mutedUsers.has(username)) return;
    await supabase.from("chat_messages").insert({ username, message: trimmed });
    setInput("");
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("chat_messages").delete().eq("id", id);
  };

  const clearAllChat = async () => {
    if (!confirm("Clear ALL chat messages?")) return;
    // Delete all messages
    const { data } = await supabase.from("chat_messages").select("id");
    if (data) {
      for (const msg of data) {
        await supabase.from("chat_messages").delete().eq("id", msg.id);
      }
    }
    setMessages([]);
  };

  const toggleMuteUser = (name: string) => {
    const updated = new Set(mutedUsers);
    if (updated.has(name)) {
      updated.delete(name);
    } else {
      updated.add(name);
    }
    setMutedUsers(updated);
    localStorage.setItem("neocosmic_muted_chat", JSON.stringify([...updated]));
  };

  const saveName = () => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem("chat_username", trimmed);
    setEditingName(false);
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const nameColor = (name: string) => {
    const colors = ["#00f5ff", "#ff6b35", "#7fff7f", "#ffcc00", "#ff69b4", "#c084fc"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const visibleMessages = messages.filter(m => !mutedUsers.has(m.username));

  return (
    <div className="flex flex-col h-full neon-card rounded-lg overflow-hidden" style={{ minHeight: "500px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-primary" />
          <span className="font-gaming text-sm neon-text">GLOBAL CHAT</span>
          <span className="text-xs text-muted-foreground font-mono-game">({messages.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={clearAllChat} className="flex items-center gap-1 text-xs font-gaming text-destructive hover:text-destructive/80" title="Clear all chat">
              <Eraser size={12} /> CLEAR
            </button>
          )}
          {editingName ? (
            <div className="flex items-center gap-1">
              <input
                className="text-xs bg-input border border-primary rounded px-2 py-0.5 font-mono-game text-foreground w-24 focus:outline-none"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
                maxLength={16}
              />
              <button onClick={saveName} className="text-xs text-primary font-gaming">OK</button>
            </div>
          ) : (
            <button
              onClick={() => { setTempName(username); setEditingName(true); }}
              className="text-xs font-mono-game hover:text-primary transition-colors"
              style={{ color: nameColor(username) }}
            >
              {username} ✏
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className="flex gap-2 text-sm items-start group relative"
            onMouseEnter={() => setHoveredMsg(msg.id)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            <span className="text-muted-foreground font-mono-game text-xs shrink-0 mt-0.5 opacity-60 group-hover:opacity-100">{formatTime(msg.created_at)}</span>
            <span className="font-gaming text-xs shrink-0" style={{ color: nameColor(msg.username) }}>{msg.username}:</span>
            <span className="text-foreground/90 font-mono-game text-xs break-all flex-1">{msg.message}</span>
            {hoveredMsg === msg.id && (
              <div className="flex items-center gap-1 shrink-0">
                {isAdmin && (
                  <button onClick={() => toggleMuteUser(msg.username)} className="p-0.5 text-muted-foreground hover:text-accent" title={`Mute ${msg.username}`}>
                    <Ban size={10} />
                  </button>
                )}
                <button onClick={() => deleteMessage(msg.id)} className="p-0.5 text-muted-foreground hover:text-destructive" title="Delete">
                  <Trash2 size={10} />
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Muted users indicator */}
      {mutedUsers.size > 0 && isAdmin && (
        <div className="px-3 py-1.5 border-t border-border bg-card/50">
          <p className="text-[10px] font-mono-game text-muted-foreground">
            Muted: {[...mutedUsers].join(", ")}
            <button onClick={() => { setMutedUsers(new Set()); localStorage.removeItem("neocosmic_muted_chat"); }} className="ml-2 text-primary hover:text-primary/80">unmute all</button>
          </p>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder={mutedUsers.has(username) ? "You are muted" : "Say something..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            maxLength={200}
            disabled={mutedUsers.has(username)}
          />
          <button onClick={sendMessage} disabled={mutedUsers.has(username)} className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all disabled:opacity-50">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
