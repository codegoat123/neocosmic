import { useState } from "react";
import { Globe, ExternalLink, Plus } from "lucide-react";

interface Website {
  name: string;
  url: string;
  description: string;
  category: string;
}

const defaultWebsites: Website[] = [
  // Puzzle & Strategy
  { name: "Poly Track", url: "https://sites.google.com/view/poly-track/poly-track/", description: "Track-based puzzle collection", category: "Puzzle & Strategy" },
  { name: "Poly Track Backup", url: "https://sites.google.com/view/poly-track-backup", description: "Backup mirror", category: "Puzzle & Strategy" },
  { name: "No Oxygen Included", url: "https://fr33g4m3s.github.io/NoOxygenIncluded.html", description: "Strategy survival puzzle", category: "Puzzle & Strategy" },
  { name: "Sakura", url: "https://sites.google.com/view/jifisdfnis5iurf5934-t43j9t03jd/sakura", description: "Themed mini-games", category: "Puzzle & Strategy" },
  // Arcade & Action
  { name: "Drive U 7 - Clash", url: "https://sites.google.com/view/drive-u-7-home-10/clash", description: "Racing and action collection", category: "Arcade & Action" },
  { name: "Ultimate Games Doc", url: "https://ultimategamesdoc1.github.io/Ultimate-Games-Doc/", description: "Curated game doc", category: "Arcade & Action" },
  { name: "Games 5", url: "https://chstextbook.github.io/pages/nav/games5.html", description: "Classic collection", category: "Arcade & Action" },
  { name: "Dynamite Bypass", url: "https://dynamitebypass.weebly.com/g4m3s.html", description: "Misc arcade", category: "Arcade & Action" },
  { name: "GXming Zone 13", url: "https://sites.google.com/view/gxming-zone-13-/home", description: "Community arcade mirrors", category: "Arcade & Action" },
  // Multiplayer
  { name: "IO Games Multiplayer", url: "https://io-games-unblocked.s3.amazonaws.com/category/multiplayer-games.html", description: "IO game index", category: "Multiplayer" },
  { name: "Spacegoo", url: "https://www.spacegoo.com", description: "Browser-based games", category: "Multiplayer" },
  { name: "EdgeOne Games", url: "https://edgeone.ai/pages/games-unblocked", description: "Curated selection", category: "Multiplayer" },
  // Educational
  { name: "Childline Games", url: "https://www.childline.org.uk/toolbox/games", description: "Safe activities", category: "Educational" },
  { name: "Nebula (Not Math)", url: "https://sites.google.com/view/nebula-defnotmath/home", description: "Learning and fun", category: "Educational" },
  // Hidden Hubs
  { name: "Copyright Dragon", url: "https://sites.google.com/view/copyright-dragon-", description: "Stealth game hub", category: "Hidden Hubs" },
  { name: "42 Unbed", url: "https://sites.google.com/view/42unbed", description: "Mirror hub", category: "Hidden Hubs" },
  { name: "G-Vault", url: "https://sites.google.com/view/g-vault/", description: "Vault of mirrors", category: "Hidden Hubs" },
  { name: "Pulsar Unblocked", url: "https://sites.google.com/view/pulsarunbl0cked/home", description: "Proxy-friendly", category: "Hidden Hubs" },
  // Experimental
  { name: "Susanoo's Arcade", url: "https://sites.google.com/view/susanoosarcade/home", description: "Indie games", category: "Experimental" },
  { name: "Vybrix V3", url: "https://sites.google.com/ottumwaschools.com/vybrixv3/-home-", description: "School-hosted mirror", category: "Experimental" },
  { name: "ViewGlobal", url: "https://sites.google.com/ottumwaschools.com/viewglobal/-", description: "Global portal", category: "Experimental" },
];

const WebsitesSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [filter, setFilter] = useState("All");
  const [customSites, setCustomSites] = useState<Website[]>(() => {
    try { return JSON.parse(localStorage.getItem("neocosmic_custom_websites") || "[]"); } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", description: "", category: "Custom" });

  const categories = ["All", ...Array.from(new Set(defaultWebsites.map(w => w.category)))];
  const filtered = filter === "All" ? defaultWebsites : defaultWebsites.filter(w => w.category === filter);

  const addSite = () => {
    if (!form.name || !form.url) return;
    const updated = [...customSites, form];
    setCustomSites(updated);
    localStorage.setItem("neocosmic_custom_websites", JSON.stringify(updated));
    setForm({ name: "", url: "", description: "", category: "Custom" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">WEBSITES</h2>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-gaming border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all">
            <Plus size={12} /> ADD WEBSITE
          </button>
        )}
      </div>

      {showAdd && isAdmin && (
        <div className="neon-card rounded-lg p-4 space-y-2">
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Website name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="URL *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <button onClick={addSite} disabled={!form.name || !form.url} className="w-full py-2 font-gaming text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">ADD WEBSITE</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 text-xs font-gaming rounded-md transition-all ${filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"}`}>
            {cat}
          </button>
        ))}
      </div>

      {customSites.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {customSites.map((site, i) => (
            <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="neon-card rounded-lg p-3 hover:border-primary/30 transition-all group flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-xs font-gaming text-primary shrink-0">
                {site.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-gaming text-xs truncate">{site.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono-game">{site.description}</p>
              </div>
              <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((site, i) => (
          <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="neon-card rounded-lg p-3 hover:border-primary/30 transition-all group flex items-center gap-3 hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-xs font-gaming text-primary shrink-0">
              {site.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-gaming text-xs truncate">{site.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono-game">{site.description}</p>
            </div>
            <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default WebsitesSection;
