import { useState, useEffect } from "react";
import { Gamepad2, Trophy, ExternalLink, X, Plus, Maximize2, Search } from "lucide-react";

interface Game {
  id: number;
  name: string;
  cover: string;
  url: string;
}

interface CustomGame {
  name: string;
  embedUrl: string;
  imageUrl: string;
  description: string;
}

const ZONES_URL = "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json";
const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";

const TUFF_CHICKEN: CustomGame = {
  name: "Tuff Chicken",
  embedUrl: "https://tuffchicken.netlify.app",
  imageUrl: "https://img.itch.zone/aW1nLzE0NjI0ODU5LnBuZw==/315x250%23c/6dJz7l.png",
  description: "Block-based survival & PvP game",
};

const GamesSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [zones, setZones] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState<{ name: string; url: string } | null>(null);
  const [customGames, setCustomGames] = useState<CustomGame[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("neocosmic_custom_games") || "[]");
    } catch { return []; }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", embedUrl: "", imageUrl: "", description: "" });

  useEffect(() => {
    fetch(ZONES_URL)
      .then(r => r.json())
      .then((data: Game[]) => { setZones(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resolveUrl = (template: string) =>
    template.replace("{COVER_URL}", COVER_URL).replace("{HTML_URL}", HTML_URL);

  const openGame = (name: string, url: string) => {
    const resolved = url.startsWith("http") ? url : resolveUrl(url);
    setActiveGame({ name, url: resolved });
  };

  const openInNewTab = (url: string) => {
    const resolved = url.startsWith("http") ? url : resolveUrl(url);
    window.open(resolved, "_blank", "noopener,noreferrer");
  };

  const addCustomGame = () => {
    if (!addForm.name || !addForm.embedUrl) return;
    const updated = [...customGames, { ...addForm }];
    setCustomGames(updated);
    localStorage.setItem("neocosmic_custom_games", JSON.stringify(updated));
    setAddForm({ name: "", embedUrl: "", imageUrl: "", description: "" });
    setShowAddForm(false);
  };

  const removeCustomGame = (idx: number) => {
    const updated = customGames.filter((_, i) => i !== idx);
    setCustomGames(updated);
    localStorage.setItem("neocosmic_custom_games", JSON.stringify(updated));
  };

  const filtered = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Active game embed */}
      {activeGame && (
        <div className="neon-card rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
            <span className="font-gaming text-sm neon-text">{activeGame.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => openInNewTab(activeGame.url)} className="text-xs font-gaming text-muted-foreground hover:text-primary flex items-center gap-1">
                <ExternalLink size={10} /> NEW TAB
              </button>
              <button onClick={() => setActiveGame(null)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
            </div>
          </div>
          <iframe src={activeGame.url} className="w-full border-0" style={{ height: "70vh", minHeight: "400px" }} title={activeGame.name} allow="fullscreen; microphone; camera" />
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
              className="pl-8 pr-3 py-1.5 text-xs bg-input border border-border rounded font-mono-game focus:outline-none focus:border-primary w-48"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-gaming border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all">
              <Plus size={12} /> ADD GAME
            </button>
          )}
        </div>
      </div>

      {/* Admin add form */}
      {showAddForm && isAdmin && (
        <div className="neon-card rounded-lg p-4 space-y-3">
          <span className="font-gaming text-sm text-primary">ADD CUSTOM GAME</span>
          <div className="grid grid-cols-2 gap-2">
            <input className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary col-span-2" placeholder="Game name *" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            <input className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary col-span-2" placeholder="Embed URL *" value={addForm.embedUrl} onChange={e => setAddForm(f => ({ ...f, embedUrl: e.target.value }))} />
            <input className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Image URL" value={addForm.imageUrl} onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))} />
            <input className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Description" value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button onClick={addCustomGame} disabled={!addForm.name || !addForm.embedUrl} className="w-full py-2 font-gaming text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-all">ADD GAME</button>
        </div>
      )}

      {/* Tuff Chicken featured */}
      <div
        className="neon-card rounded-lg overflow-hidden border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-all group"
        onClick={() => openGame(TUFF_CHICKEN.name, TUFF_CHICKEN.embedUrl)}
      >
        <div className="flex items-center gap-4 p-4">
          <img src={TUFF_CHICKEN.imageUrl} alt={TUFF_CHICKEN.name} className="w-20 h-20 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-accent" />
              <span className="font-gaming text-xs text-accent">GAME OF THE MONTH</span>
            </div>
            <h3 className="font-gaming text-base text-foreground mt-1">{TUFF_CHICKEN.name}</h3>
            <p className="text-xs text-muted-foreground font-mono-game">{TUFF_CHICKEN.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); openInNewTab(TUFF_CHICKEN.embedUrl); }} className="px-3 py-1.5 text-xs font-gaming border border-border rounded hover:border-primary hover:text-primary transition-all">
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom games (admin-added) */}
      {customGames.length > 0 && (
        <>
          <h3 className="font-gaming text-xs text-primary">CUSTOM GAMES</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {customGames.map((game, idx) => (
              <div key={idx} className="group neon-card rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all cursor-pointer" onClick={() => openGame(game.name, game.embedUrl)}>
                <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.name} className="w-full h-full object-cover" />
                  ) : (
                    <Gamepad2 size={32} className="text-muted-foreground" />
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-gaming text-xs truncate">{game.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); openInNewTab(game.embedUrl); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={10} className="text-muted-foreground" />
                    </button>
                  </div>
                  {game.description && <p className="text-[10px] text-muted-foreground font-mono-game line-clamp-2">{game.description}</p>}
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); removeCustomGame(idx); }} className="text-[10px] text-destructive font-gaming">REMOVE</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CDN Games */}
      <h3 className="font-gaming text-xs text-primary">ALL GAMES ({filtered.length})</h3>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono-game text-sm">Loading games...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((zone) => (
            <div
              key={zone.id}
              className="group neon-card rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => openGame(zone.name, zone.url)}
            >
              <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden relative">
                <img
                  src={resolveUrl(zone.cover)}
                  alt={zone.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <Gamepad2 size={32} className="absolute text-muted-foreground/30" />
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-gaming text-[10px] truncate text-foreground">{zone.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); openInNewTab(zone.url); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <ExternalLink size={10} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesSection;
