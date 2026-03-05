import { Sparkles, Gamepad2, Bot, Globe, Wrench, Shirt, Crown, FileText } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

const HomeTab = ({ onTabChange }: HomeTabProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="neon-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
              <div className="w-12 h-12 overflow-hidden rounded-xl">
                <img src={logoImg} alt="NeoCosmic" className="w-20 h-20 object-cover object-top -mt-1 -ml-3 scale-110" style={{ objectPosition: "50% 30%" }} />
              </div>
              <div>
                <h1 className="font-gaming text-3xl md:text-4xl neon-text tracking-widest">NEOCOSMIC</h1>
                <p className="text-xs text-muted-foreground font-mono-game tracking-[0.3em]">ENTERTAINMENT PORTAL</p>
              </div>
            </div>
            <p className="text-muted-foreground font-mono-game text-sm leading-relaxed max-w-lg">
              Your all-in-one hub for browser games, AI chat, tools, skins, and more. Everything is free. Explore using the tabs above.
            </p>
          </div>
          <div className="neon-card rounded-xl p-5 text-center border border-primary/20">
            <Sparkles className="text-primary mx-auto mb-2" size={28} />
            <p className="font-gaming text-sm text-primary">ONLINE</p>
            <p className="text-[10px] text-muted-foreground font-mono-game mt-1">Hub active</p>
          </div>
        </div>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "games", label: "Games", icon: Gamepad2, desc: "100+ browser games" },
          { id: "ai", label: "AI Chat", icon: Bot, desc: "Talk to Gemini AI" },
          { id: "websites", label: "Websites", icon: Globe, desc: "Curated links" },
          { id: "tools", label: "Tools", icon: Wrench, desc: "Proxies & utilities" },
          { id: "skins", label: "Skins", icon: Shirt, desc: "Download skins" },
          { id: "ranks", label: "Ranks", icon: Crown, desc: "Perks & badges" },
          { id: "activity", label: "Activity Log", icon: FileText, desc: "Site updates" },
        ].map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-start gap-2 p-4 rounded-xl neon-card border border-border hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] transition-all text-left group"
          >
            <Icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-gaming text-xs text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground font-mono-game">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* About */}
      <div className="neon-card rounded-2xl p-6">
        <h2 className="font-gaming text-sm neon-text mb-3">ABOUT NEOCOSMIC</h2>
        <p className="text-sm text-muted-foreground font-mono-game leading-relaxed">
          NeoCosmic is a free entertainment portal with embedded browser games, AI-powered chat, useful tools and websites, a skin vault, and more. Everything is organized in tabs for easy access. No sign-up required.
        </p>
      </div>
    </div>
  );
};

export default HomeTab;
