import { Sparkles, Gamepad2, Film, MessageSquare, Globe } from "lucide-react";

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

const HomeTab = ({ onTabChange }: HomeTabProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="neon-card rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h1 className="font-gaming text-2xl md:text-3xl neon-text mb-3">Welcome to NeoCosmic</h1>
            <p className="text-muted-foreground font-mono-game text-sm leading-relaxed">
              Your all-in-one portal for games, movies, tools, and community. Use the tabs above to explore everything we have to offer.
            </p>
          </div>
          <div className="neon-card rounded-lg p-4 text-center">
            <Sparkles className="text-primary mx-auto mb-2" size={24} />
            <p className="font-gaming text-xs text-primary">ONLINE</p>
            <p className="text-[10px] text-muted-foreground font-mono-game mt-1">Hub mode active</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="neon-card rounded-xl p-5">
        <h2 className="font-gaming text-sm neon-text mb-4">QUICK LINKS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: "games", label: "Games", icon: Gamepad2 },
            { id: "movies", label: "Movies", icon: Film },
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "websites", label: "Websites", icon: Globe },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary hover:bg-primary/5 transition-all font-gaming text-xs text-muted-foreground hover:text-primary"
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="neon-card rounded-xl p-5">
        <h2 className="font-gaming text-sm neon-text mb-3">ABOUT</h2>
        <p className="text-sm text-muted-foreground font-mono-game leading-relaxed">
          NeoCosmic is a free entertainment hub with embedded games, a movie collection, useful tools and websites, community chat, voice calls, and more. Everything is organized in tabs for easy access.
        </p>
      </div>
    </div>
  );
};

export default HomeTab;
