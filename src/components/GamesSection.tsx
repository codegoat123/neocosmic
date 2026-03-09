import { useState, useEffect, lazy, Suspense } from "react";
import { Gamepad2, ExternalLink, X, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SnakeGame = lazy(() => import("@/components/games/SnakeGame"));
const TicTacToe = lazy(() => import("@/components/games/TicTacToe"));
const MemoryGame = lazy(() => import("@/components/games/MemoryGame"));
const FlappyGame = lazy(() => import("@/components/games/FlappyGame"));
const Game2048 = lazy(() => import("@/components/games/Game2048"));
const MinesweeperGame = lazy(() => import("@/components/games/MinesweeperGame"));
const ClickerGame = lazy(() => import("@/components/games/ClickerGame"));

interface CustomGame {
  id: string;
  name: string;
  embed_url: string;
  image_url: string;
  description: string;
}

const BUILT_IN_GAMES = [
  { id: "snake", name: "Snake", emoji: "🐍", description: "Classic snake game" },
  { id: "2048", name: "2048", emoji: "🔢", description: "Slide & merge tiles" },
  { id: "flappy", name: "Flappy Bird", emoji: "🐦", description: "Tap to fly" },
  { id: "memory", name: "Memory Match", emoji: "🧠", description: "Find matching pairs" },
  { id: "tictactoe", name: "Tic Tac Toe", emoji: "❌", description: "Classic X & O" },
  { id: "minesweeper", name: "Minesweeper", emoji: "💣", description: "Avoid the mines" },
  { id: "clicker", name: "Cosmic Clicker", emoji: "👆", description: "Tap to earn" },
];

const GamesSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState<{ name: string; url: string } | null>(null);
  const [activeBuiltIn, setActiveBuiltIn] = useState<string | null>(null);
  const [customGames, setCustomGames] = useState<CustomGame[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", embed_url: "", image_url: "", description: "" });

  useEffect(() => {
    fetchCustomGames();
    const channel = supabase
      .channel("custom_games")
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_games" }, () => fetchCustomGames())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchCustomGames = async () => {
    const { data } = await supabase.from("custom_games").select("*").order("created_at", { ascending: false });
    if (data) setCustomGames(data as CustomGame[]);
  };

  const openGame = (name: string, url: string) => { setActiveBuiltIn(null); setActiveGame({ name, url }); };
  const openBuiltIn = (id: string) => { setActiveGame(null); setActiveBuiltIn(id); };
  const closeAll = () => { setActiveGame(null); setActiveBuiltIn(null); };
  const openInNewTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const addCustomGame = async () => {
    if (!addForm.name || !addForm.embed_url) return;
    await supabase.from("custom_games").insert({
      name: addForm.name, embed_url: addForm.embed_url,
      image_url: addForm.image_url, description: addForm.description,
    });
    setAddForm({ name: "", embed_url: "", image_url: "", description: "" });
    setShowAddForm(false);
  };

  const removeCustomGame = async (id: string) => {
    await supabase.from("custom_games").delete().eq("id", id);
  };

  const filteredBuiltIn = BUILT_IN_GAMES.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCustom = customGames.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const renderBuiltInGame = () => {
    switch (activeBuiltIn) {
      case "snake": return <SnakeGame onBack={closeAll} />;
      case "tictactoe": return <TicTacToe onBack={closeAll} />;
      case "memory": return <MemoryGame onBack={closeAll} />;
      case "flappy": return <FlappyGame onBack={closeAll} />;
      case "2048": return <Game2048 onBack={closeAll} />;
      case "minesweeper": return <MinesweeperGame onBack={closeAll} />;
      case "clicker": return <ClickerGame onBack={closeAll} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Active built-in game */}
      {activeBuiltIn && (
        <div className="neon-card rounded-xl p-6">
          <Suspense fallback={<div className="text-center py-12 font-gaming text-sm text-muted-foreground">LOADING...</div>}>
            {renderBuiltInGame()}
          </Suspense>
        </div>
      )}

      {/* Active embed game */}
      {activeGame && (
        <div className="neon-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
            <span className="font-gaming text-sm neon-text">{activeGame.name}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => openInNewTab(activeGame.url)} className="text-xs font-gaming text-muted-foreground hover:text-primary flex items-center gap-1">
                <ExternalLink size={12} /> NEW TAB
              </button>
              <button onClick={closeAll} className="text-muted-foreground hover:text-destructive"><X size={16} /></button>
            </div>
          </div>
          <iframe src={activeGame.url} className="w-full border-0" style={{ height: "75vh", minHeight: "450px" }} title={activeGame.name} allow="fullscreen; microphone; camera" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">GAMES</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-8 pr-3 py-2 text-xs bg-input border border-border rounded-lg font-mono-game focus:outline-none focus:border-primary w-52"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-3 py-2 text-xs font-gaming border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
              <Plus size={12} /> ADD GAME
            </button>
          )}
        </div>
      </div>

      {showAddForm && isAdmin && (
        <div className="neon-card rounded-xl p-5 space-y-3">
          <span className="font-gaming text-sm text-primary">ADD GAME (visible to everyone)</span>
          <div className="grid grid-cols-2 gap-3">
            <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary col-span-2" placeholder="Game name *" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary col-span-2" placeholder="Embed URL *" value={addForm.embed_url} onChange={e => setAddForm(f => ({ ...f, embed_url: e.target.value }))} />
            <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Image URL" value={addForm.image_url} onChange={e => setAddForm(f => ({ ...f, image_url: e.target.value }))} />
            <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Description" value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button onClick={addCustomGame} disabled={!addForm.name || !addForm.embed_url} className="w-full py-2.5 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all">ADD GAME</button>
        </div>
      )}

      {/* Built-in games */}
      {filteredBuiltIn.length > 0 && (
        <>
          <p className="font-gaming text-xs text-muted-foreground tracking-wider">BUILT-IN · NEVER BLOCKED</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {filteredBuiltIn.map((game) => (
              <div key={game.id}
                className="group neon-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => openBuiltIn(game.id)}>
                <div className="aspect-square bg-secondary/30 flex items-center justify-center text-4xl">
                  {game.emoji}
                </div>
                <div className="p-2.5 space-y-1">
                  <p className="font-gaming text-xs truncate">{game.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-game">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Custom embed games */}
      {filteredCustom.length > 0 && (
        <>
          <p className="font-gaming text-xs text-muted-foreground tracking-wider mt-4">CUSTOM GAMES</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredCustom.map((game) => (
              <div key={game.id} className="group neon-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all cursor-pointer" onClick={() => openGame(game.name, game.embed_url)}>
                <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                  {game.image_url ? (
                    <img src={game.image_url} alt={game.name} className="w-full h-full object-cover" />
                  ) : (
                    <Gamepad2 size={32} className="text-muted-foreground" />
                  )}
                </div>
                <div className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-gaming text-xs truncate">{game.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); openInNewTab(game.embed_url); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={10} className="text-muted-foreground" />
                    </button>
                  </div>
                  {game.description && <p className="text-[10px] text-muted-foreground font-mono-game line-clamp-2">{game.description}</p>}
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); removeCustomGame(game.id); }} className="flex items-center gap-1 text-[10px] text-destructive font-gaming">
                      <Trash2 size={8} /> REMOVE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {filteredBuiltIn.length === 0 && filteredCustom.length === 0 && (
        <div className="text-center py-12 text-muted-foreground font-mono-game text-sm">
          No games match your search.
        </div>
      )}
    </div>
  );
};

export default GamesSection;
