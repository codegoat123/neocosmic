import { useState } from "react";
import { Wrench, ExternalLink, Plus, X } from "lucide-react";

interface Tool {
  name: string;
  url: string;
  description: string;
}

const defaultTools: Tool[] = [
  { name: "Hammerhead Proxy 1", url: "https://arxthegoat.ts0880.es/", description: "Web proxy tool" },
  { name: "Hammerhead Proxy 2", url: "https://itrsa.sic.al/", description: "Alternate proxy" },
  { name: "Ultra Violet Proxy", url: "https://jacksonherr.university", description: "UV proxy tool" },
  { name: "About Blank Opener", url: "https://abetag.netlify.app", description: "Open sites in about:blank tab" },
];

const ToolsSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [customTools, setCustomTools] = useState<Tool[]>(() => {
    try { return JSON.parse(localStorage.getItem("neocosmic_custom_tools") || "[]"); } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", description: "" });
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyFrameUrl, setProxyFrameUrl] = useState("");

  const addTool = () => {
    if (!form.name || !form.url) return;
    const updated = [...customTools, form];
    setCustomTools(updated);
    localStorage.setItem("neocosmic_custom_tools", JSON.stringify(updated));
    setForm({ name: "", url: "", description: "" });
    setShowAdd(false);
  };

  const openAboutBlank = (url: string) => {
    const popup = window.open("about:blank", "_blank");
    if (!popup) { alert("Popup blocked"); return; }
    popup.document.open();
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Proxy</title><style>html,body{height:100%;margin:0}iframe{border:0;width:100%;height:100%}</style></head><body><iframe src="${url}" allowfullscreen allow="fullscreen;autoplay;microphone;camera"></iframe></body></html>`);
    popup.document.close();
  };

  const allTools = [...customTools, ...defaultTools];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">TOOLS & PROXIES</h2>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-gaming border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all">
            <Plus size={12} /> ADD TOOL
          </button>
        )}
      </div>

      {showAdd && isAdmin && (
        <div className="neon-card rounded-lg p-4 space-y-2">
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Tool name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="URL *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <button onClick={addTool} disabled={!form.name || !form.url} className="w-full py-2 font-gaming text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">ADD TOOL</button>
        </div>
      )}

      {/* Tool cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allTools.map((tool, i) => (
          <div key={i} className="neon-card rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Wrench size={14} className="text-primary" />
              <span className="font-gaming text-xs truncate">{tool.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono-game">{tool.description}</p>
            <div className="flex gap-2">
              <button onClick={() => openAboutBlank(tool.url)} className="flex-1 py-1.5 text-[10px] font-gaming border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all">
                ABOUT:BLANK
              </button>
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1.5 border border-border rounded hover:border-primary transition-all">
                <ExternalLink size={10} className="text-muted-foreground" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Proxy frame */}
      <div className="neon-card rounded-lg p-4 space-y-3">
        <h3 className="font-gaming text-sm text-primary">PROXY FRAME</h3>
        <p className="text-xs text-muted-foreground font-mono-game">Paste a URL to load in the embedded frame below.</p>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-input border border-border rounded px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary"
            placeholder="https://example.com"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
          />
          <button onClick={() => { if (proxyUrl) setProxyFrameUrl(proxyUrl); }} className="px-4 py-2 font-gaming text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">LOAD</button>
          <button onClick={() => { if (proxyUrl) window.open(proxyUrl, "_blank"); }} className="px-4 py-2 font-gaming text-xs border border-border rounded hover:border-primary text-muted-foreground hover:text-primary">NEW TAB</button>
        </div>
        {proxyFrameUrl && (
          <div className="relative">
            <button onClick={() => setProxyFrameUrl("")} className="absolute top-2 right-2 z-10 p-1 bg-card/80 rounded text-muted-foreground hover:text-destructive"><X size={14} /></button>
            <iframe src={proxyFrameUrl} className="w-full rounded-lg border border-border" style={{ height: "50vh" }} title="Proxy Frame" allow="fullscreen;autoplay;microphone;camera" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsSection;
