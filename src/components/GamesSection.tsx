import { useState, useEffect } from "react";
import { Gamepad2, Trophy, ExternalLink, X, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Zone {
  id: number;
  name: string;
  cover: string;
  url: string;
}

interface CustomGame {
  id: string;
  name: string;
  embed_url: string;
  image_url: string;
  description: string;
}

const ZONES_URL = "https://cdn.jsdelivr.net/gh/gn-math/assets@main/zones.json";
const COVER_URL = "https://cdn.jsdelivr.net/gh/gn-math/covers@main";
const HTML_URL = "https://cdn.jsdelivr.net/gh/gn-math/html@main";

const TUFF_CHICKEN = {
  name: "Tuff Chicken",
  embedUrl: "https://tuffchicken.netlify.app",
  imageUrl: "https://img.itch.zone/aW1nLzE0NjI0ODU5LnBuZw==/315x250%23c/6dJz7l.png",
  description: "Block-based survival & PvP game",
};

const GamesSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState<{ name: string; url: string } | null>(null);
  const [customGames, setCustomGames] = useState<CustomGame[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", embed_url: "", image_url: "", description: "" });

  useEffect(() => {
    fetch(ZONES_URL)
      .then(r => r.json())
      .then((data: Zone[]) => { setZones(data); setLoading(false); })
      .catch(() => setLoading(false));
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

  const addCustomGame = async () => {
    if (!addForm.name || !addForm.embed_url) return;
    await supabase.from("custom_games").insert({
      name: addForm.name,
      embed_url: addForm.embed_url,
      image_url: addForm.image_url,
      description: addForm.description,
    });
    setAddForm({ name: "", embed_url: "", image_url: "", description: "" });
    setShowAddForm(false);
  };

  const removeCustomGame = async (id: string) => {
    await supabase.from("custom_games").delete().eq("id", id);
  };

  const filtered = zones.filter(z => z.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {activeGame && (
        <div className="neon-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
            <span className="font-gaming text-sm neon-text">{activeGame.name}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => openInNewTab(activeGame.url)} className="text-xs font-gaming text-muted-foreground hover:text-primary flex items-center gap-1">
                <ExternalLink size={12} /> NEW TAB
              </button>
              <button onClick={() => setActiveGame(null)} className="text-muted-foreground hover:text-destructive"><X size={16} /></button>
            </div>
          </div>
          <iframe src={activeGame.url} className="w-full border-0" style={{ height: "75vh", minHeight: "450px" }} title={activeGame.name} allow="fullscreen; microphone; camera" />
        </div>
      )}

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

      {/* Tuff Chicken featured */}
      <div
        className="neon-card rounded-xl overflow-hidden border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-all group"
        onClick={() => openGame(TUFF_CHICKEN.name, TUFF_CHICKEN.embedUrl)}
      >
        <div className="flex items-center gap-4 p-4">
          <img src={TUFF_CHICKEN.imageUrl} alt={TUFF_CHICKEN.name} className="w-20 h-20 rounded-xl object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-accent" />
              <span className="font-gaming text-xs text-accent">GAME OF THE MONTH</span>
            </div>
            <h3 className="font-gaming text-base text-foreground mt-1">{TUFF_CHICKEN.name}</h3>
            <p className="text-xs text-muted-foreground font-mono-game">{TUFF_CHICKEN.description}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); openInNewTab(TUFF_CHICKEN.embedUrl); }} className="px-3 py-1.5 text-xs font-gaming border border-border rounded-lg hover:border-primary hover:text-primary transition-all">
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Custom games from DB */}
      {customGames.length > 0 && (
        <>
          <h3 className="font-gaming text-xs text-primary tracking-wider">CUSTOM GAMES</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {customGames.map((game) => (
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

      {/* CDN Games */}
      <h3 className="font-gaming text-xs text-primary tracking-wider">ALL GAMES ({filtered.length})</h3>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono-game text-sm">Loading games...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((zone) => (
            <div
              key={zone.id}
              className="group neon-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all cursor-pointer"
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
              <div className="p-2.5 space-y-1">
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
