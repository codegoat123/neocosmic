import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

const GlobalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("chat_username") || `Player${Math.floor(Math.random() * 9999)}`;
  });
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(username);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent messages
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[]);
      });

    // Subscribe to new messages
    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    await supabase.from("chat_messages").insert({
      username,
      message: trimmed,
    });
    setInput("");
  };

  const saveName = () => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem("chat_username", trimmed);
    setEditingName(false);
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a consistent color for a username
  const nameColor = (name: string) => {
    const colors = ["#00f5ff", "#ff6b35", "#7fff7f", "#ffcc00", "#ff69b4", "#c084fc"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div id="chat" className="flex flex-col h-full neon-card rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-primary" />
          <span className="font-gaming text-sm neon-text">GLOBAL CHAT</span>
          <span className="text-xs text-muted-foreground font-mono-game">({messages.length} msgs)</span>
        </div>
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
            <button onClick={saveName} className="text-xs text-primary font-gaming hover:text-primary/80">OK</button>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 text-sm items-start group">
            <span className="text-muted-foreground font-mono-game text-xs shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
              {formatTime(msg.created_at)}
            </span>
            <span className="font-gaming text-xs shrink-0" style={{ color: nameColor(msg.username) }}>
              {msg.username}:
            </span>
            <span className="text-foreground/90 font-mono-game text-xs break-all">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            placeholder="Say something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            maxLength={200}
          />
          <button
            onClick={sendMessage}
            className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all shadow-[0_0_10px_hsl(188_100%_50%/0.3)] hover:shadow-[0_0_16px_hsl(188_100%_50%/0.5)]"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalChat;
