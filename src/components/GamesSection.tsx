import { useState } from "react";
import { Gamepad2, Trophy, ExternalLink } from "lucide-react";

interface Game {
  name: string;
  url: string;
  description: string;
  category: string;
  featured?: boolean;
}

const games: Game[] = [
  {
    name: "Tuff Chicken",
    url: "https://tuffchicken.netlify.app",
    description: "Block-based survival & PvP game in your browser",
    category: "Survival",
    featured: true,
  },
  {
    name: "1v1.LOL",
    url: "https://1v1.lol",
    description: "Build & shoot battle royale style game",
    category: "Shooter",
  },
  {
    name: "Krunker.io",
    url: "https://krunker.io",
    description: "Fast-paced FPS browser shooter",
    category: "FPS",
  },
  {
    name: "Shell Shockers",
    url: "https://shellshock.io",
    description: "Egg-themed multiplayer FPS game",
    category: "FPS",
  },
  {
    name: "Slope",
    url: "https://slope-game.github.io",
    description: "Fast rolling ball endless runner",
    category: "Arcade",
  },
  {
    name: "Retro Bowl",
    url: "https://retrobowl.me",
    description: "Retro-style American football game",
    category: "Sports",
  },
];

const GamesSection = () => {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  return (
    <section id="games" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(188_100%_50%)]" />
        <h2 className="font-gaming text-lg neon-text tracking-wider">ALL GAMES</h2>
        <span className="text-xs font-mono-game text-muted-foreground">({games.length} games)</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {games.map((game) => (
          <div
            key={game.name}
            className={`group neon-card rounded-lg overflow-hidden border transition-all cursor-pointer ${
              game.featured
                ? "border-primary/50 shadow-[0_0_15px_hsl(188_100%_50%/0.2)]"
                : "border-border hover:border-primary/30"
            }`}
            onMouseEnter={() => setHoveredGame(game.name)}
            onMouseLeave={() => setHoveredGame(null)}
            onClick={() => window.open(game.url, "_blank")}
          >
            {/* Game icon area */}
            <div className="aspect-square bg-secondary/30 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20" />
              {game.featured && (
                <div className="absolute top-1.5 right-1.5 z-10">
                  <Trophy size={14} className="text-yellow-400" />
                </div>
              )}
              <Gamepad2
                size={32}
                className={`transition-all ${
                  hoveredGame === game.name ? "text-primary scale-110" : "text-muted-foreground"
                }`}
              />
            </div>

            {/* Info */}
            <div className="p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-gaming text-xs truncate text-foreground">{game.name}</p>
                <ExternalLink size={10} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="inline-block text-[10px] font-mono-game px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {game.category}
              </span>
              <p className="text-[10px] text-muted-foreground font-mono-game line-clamp-2">{game.description}</p>
              {game.featured && (
                <div className="flex items-center gap-1 text-[10px] font-gaming text-yellow-400">
                  <Trophy size={8} />
                  GAME OF THE MONTH
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GamesSection;
