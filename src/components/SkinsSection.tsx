import { useState, useEffect } from "react";
import { Download, Plus, X, Upload, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sweaterSkin from "@/assets/skin-sweater.png";

interface Skin {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  download_url: string;
  category: string;
  downloads: number;
}

const ADMIN_PASSWORD = "password";

const SkinsSection = () => {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    download_url: "",
    category: "default",
  });
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSkins();
    // Subscribe for realtime skin additions
    const channel = supabase
      .channel("skins")
      .on("postgres_changes", { event: "*", schema: "public", table: "skins" }, () => {
        fetchSkins();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchSkins = async () => {
    const { data } = await supabase.from("skins").select("*").order("created_at", { ascending: false });
    if (data) setSkins(data as Skin[]);
  };

  const tryAdminLogin = () => {
    if (adminPass === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `skins/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("skins").upload(path, file, { upsert: true });
    if (data) {
      const { data: urlData } = supabase.storage.from("skins").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl, download_url: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const addSkin = async () => {
    if (!form.name || !form.image_url) return;
    setAdding(true);
    await supabase.from("skins").insert({
      name: form.name,
      description: form.description || null,
      image_url: form.image_url,
      download_url: form.download_url || form.image_url,
      category: form.category,
    });
    setForm({ name: "", description: "", image_url: "", download_url: "", category: "default" });
    setAdding(false);
  };

  const downloadSkin = async (skin: Skin) => {
    // Increment downloads
    await supabase.from("skins").update({ downloads: skin.downloads + 1 }).eq("id", skin.id);
    // Trigger download
    const a = document.createElement("a");
    a.href = skin.download_url;
    a.download = `${skin.name}.png`;
    a.click();
  };

  // Default skins to show if DB is empty
  const displaySkins: Skin[] = skins.length > 0 ? skins : [
    {
      id: "default-1",
      name: "Sweater Boy",
      description: "Classic sweater skin",
      image_url: sweaterSkin,
      download_url: sweaterSkin,
      category: "default",
      downloads: 0,
    }
  ];

  return (
    <section id="skins" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(188_100%_50%)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">SKIN VAULT</h2>
          <span className="text-xs font-mono-game text-muted-foreground">({displaySkins.length} skins)</span>
        </div>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-gaming border border-border rounded hover:border-primary hover:text-primary transition-all"
        >
          <Plus size={12} />
          ADMIN
        </button>
      </div>

      {/* Admin Panel */}
      {showAdmin && (
        <div className="neon-card rounded-lg p-4 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-gaming text-sm text-primary">ADMIN PANEL</span>
            <button onClick={() => setShowAdmin(false)}><X size={14} className="text-muted-foreground hover:text-foreground" /></button>
          </div>

          {!adminAuthed ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono-game">Enter admin password to manage skins</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  className={`flex-1 bg-input border ${passError ? "border-destructive" : "border-border"} rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary transition-colors`}
                  placeholder="Password..."
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && tryAdminLogin()}
                />
                <button onClick={tryAdminLogin} className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-gaming rounded hover:bg-primary/90">
                  LOGIN
                </button>
              </div>
              {passError && <p className="text-xs text-destructive font-mono-game">Wrong password.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary transition-colors col-span-2"
                  placeholder="Skin name *"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary transition-colors"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                />
                <select
                  className="bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary transition-colors"
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="default">Default</option>
                  <option value="pvp">PvP</option>
                  <option value="aesthetic">Aesthetic</option>
                  <option value="meme">Meme</option>
                </select>
              </div>

              {/* File upload */}
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded p-4 cursor-pointer hover:border-primary transition-colors group">
                <Upload size={16} className="text-muted-foreground group-hover:text-primary" />
                <span className="text-xs font-mono-game text-muted-foreground group-hover:text-primary">
                  {uploading ? "Uploading..." : form.image_url ? "✓ File uploaded" : "Upload skin PNG"}
                </span>
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileUpload} />
              </label>

              {form.image_url && (
                <div className="flex items-center gap-2">
                  <img src={form.image_url} alt="preview" className="w-8 h-8 object-cover rounded border border-border" style={{ imageRendering: "pixelated" }} />
                  <span className="text-xs text-muted-foreground font-mono-game truncate">{form.image_url.split("/").pop()}</span>
                </div>
              )}

              <button
                onClick={addSkin}
                disabled={adding || !form.name || !form.image_url}
                className="w-full py-2 font-gaming text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_hsl(188_100%_50%/0.3)]"
              >
                {adding ? "ADDING..." : "ADD SKIN"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Skins Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displaySkins.map((skin) => (
          <div key={skin.id} className="group neon-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-[0_0_15px_hsl(188_100%_50%/0.2)]">
            {/* Skin preview */}
            <div className="aspect-square bg-secondary/30 flex items-center justify-center p-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-30" />
              {skin.image_url ? (
                <img
                  src={skin.image_url}
                  alt={skin.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <Shirt size={32} className="text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="p-2 space-y-1.5">
              <p className="font-gaming text-xs truncate text-foreground">{skin.name}</p>
              {skin.category !== "default" && (
                <span className="inline-block text-xs font-mono-game px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {skin.category}
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono-game">{skin.downloads} ↓</span>
                <button
                  onClick={() => downloadSkin(skin)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-gaming bg-primary/10 border border-primary/30 text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Download size={10} />
                  GET
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkinsSection;
