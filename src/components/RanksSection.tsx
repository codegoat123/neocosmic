import { Crown, Star, Shield, Zap, Gem, Sparkles, Check } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface Rank {
  name: string;
  icon: React.ReactNode;
  price: string;
  color: string;
  borderColor: string;
  glowColor: string;
  perks: string[];
  popular?: boolean;
}

const ranks: Rank[] = [
  {
    name: "IRON",
    icon: <Shield size={28} />,
    price: "$2.99",
    color: "text-zinc-400",
    borderColor: "border-zinc-500/40",
    glowColor: "shadow-[0_0_15px_hsl(0_0%_60%/0.2)]",
    perks: ["Custom chat color", "Iron badge", "Access to Iron skins"],
  },
  {
    name: "GOLD",
    icon: <Star size={28} />,
    price: "$5.99",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    glowColor: "shadow-[0_0_15px_hsl(45_100%_50%/0.3)]",
    perks: ["All Iron perks", "Gold badge", "Priority access", "Exclusive Gold skins"],
    popular: true,
  },
  {
    name: "DIAMOND",
    icon: <Gem size={28} />,
    price: "$9.99",
    color: "text-cyan-300",
    borderColor: "border-cyan-400/40",
    glowColor: "shadow-[0_0_20px_hsl(188_100%_50%/0.3)]",
    perks: ["All Gold perks", "Diamond badge", "Custom username color", "Early access to skins", "VIP features"],
  },
  {
    name: "OBSIDIAN",
    icon: <Crown size={28} />,
    price: "$19.99",
    color: "text-red-400",
    borderColor: "border-red-500/40",
    glowColor: "shadow-[0_0_25px_hsl(0_80%_55%/0.4)]",
    perks: ["All Diamond perks", "Obsidian crown badge", "Admin-style glow", "Request custom skins", "Lifetime supporter tag"],
  },
];

const RanksSection = () => {
  const { isAdmin } = useAdmin();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
        <h2 className="font-gaming text-lg neon-text tracking-wider">RANKS & PERKS</h2>
        {isAdmin && (
          <span className="text-[10px] font-gaming text-primary px-2 py-0.5 bg-primary/10 rounded-lg border border-primary/20">ALL UNLOCKED</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ranks.map((rank) => (
          <div
            key={rank.name}
            className={`relative neon-card rounded-xl p-5 border ${rank.borderColor} ${rank.glowColor} hover:scale-[1.02] transition-all duration-300 flex flex-col`}
          >
            {rank.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-yellow-500 text-background text-[10px] font-gaming rounded-full flex items-center gap-1">
                <Sparkles size={10} /> POPULAR
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={rank.color}>{rank.icon}</div>
              <div>
                <h3 className={`font-gaming text-base ${rank.color}`}>{rank.name}</h3>
                <p className="font-gaming text-xl text-foreground">
                  {isAdmin ? (
                    <span className="text-primary text-sm">FREE</span>
                  ) : (
                    <>{rank.price}<span className="text-xs text-muted-foreground font-mono-game">/mo</span></>
                  )}
                </p>
              </div>
            </div>

            <ul className="space-y-2 flex-1 mb-4">
              {rank.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-xs font-mono-game text-muted-foreground">
                  <Zap size={10} className={`${rank.color} mt-0.5 shrink-0`} />
                  {perk}
                </li>
              ))}
            </ul>

            {isAdmin ? (
              <div className={`w-full py-2.5 font-gaming text-sm rounded-lg border ${rank.borderColor} ${rank.color} text-center flex items-center justify-center gap-2 bg-primary/5`}>
                <Check size={14} /> ACTIVE
              </div>
            ) : (
              <button
                className={`w-full py-2.5 font-gaming text-sm rounded-lg border ${rank.borderColor} ${rank.color} hover:bg-white/5 transition-all`}
                onClick={() => window.open("https://www.paypal.com", "_blank")}
              >
                GET {rank.name}
              </button>
            )}
          </div>
        ))}
      </div>

      {!isAdmin && (
        <p className="text-center text-xs text-muted-foreground font-mono-game">
          Payments processed securely · Contact admin for rank activation
        </p>
      )}
    </section>
  );
};

export default RanksSection;
