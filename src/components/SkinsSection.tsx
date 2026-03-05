import { useState, useEffect, useRef } from "react";
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
  const [form, setForm] = useState({ name: "", description: "", category: "default" });
  const [adding, setAdding] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSkins();
    const channel = supabase
      .channel("skins")
      .on("postgres_changes", { event: "*", schema: "public", table: "skins" }, () => fetchSkins())
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

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setUploadQueue(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFromQueue = (idx: number) => {
    setUploadQueue(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const addSkins = async () => {
    if (uploadQueue.length === 0) return;
    setAdding(true);

    for (const item of uploadQueue) {
      const ext = item.file.name.split(".").pop();
      const path = `skins/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data } = await supabase.storage.from("skins").upload(path, item.file, { upsert: true });
      if (data) {
        const { data: urlData } = supabase.storage.from("skins").getPublicUrl(path);
        const skinName = form.name || item.file.name.replace(/\.[^/.]+$/, "");
        await supabase.from("skins").insert({
          name: skinName,
          description: form.description || null,
          image_url: urlData.publicUrl,
          download_url: urlData.publicUrl,
          category: form.category,
        });
      }
      URL.revokeObjectURL(item.previewUrl);
    }

    setUploadQueue([]);
    setForm({ name: "", description: "", category: "default" });
    setAdding(false);
  };

  const downloadSkin = async (skin: Skin) => {
    await supabase.from("skins").update({ downloads: skin.downloads + 1 }).eq("id", skin.id);
    const a = document.createElement("a");
    a.href = skin.download_url;
    a.download = `${skin.name}.png`;
    a.click();
  };

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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">SKIN VAULT</h2>
          <span className="text-xs font-mono-game text-muted-foreground">({displaySkins.length} skins)</span>
        </div>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-gaming border border-border rounded-lg hover:border-primary hover:text-primary transition-all"
        >
          <Plus size={12} /> ADMIN
        </button>
      </div>

      {showAdmin && (
        <div className="neon-card rounded-xl p-5 border border-primary/20 space-y-3">
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
                  className={`flex-1 bg-input border ${passError ? "border-destructive" : "border-border"} rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary`}
                  placeholder="Password..."
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && tryAdminLogin()}
                />
                <button onClick={tryAdminLogin} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-gaming rounded-lg hover:bg-primary/90">LOGIN</button>
              </div>
              {passError && <p className="text-xs text-destructive font-mono-game">Wrong password.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary col-span-2" placeholder="Skin name (leave blank to use filename)" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                <select className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-mono-game focus:outline-none focus:border-primary" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="default">Default</option>
                  <option value="pvp">PvP</option>
                  <option value="aesthetic">Aesthetic</option>
                  <option value="meme">Meme</option>
                </select>
              </div>

              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-primary transition-colors group">
                <Upload size={16} className="text-muted-foreground group-hover:text-primary" />
                <span className="text-xs font-mono-game text-muted-foreground group-hover:text-primary">
                  Click to select skin PNGs (multiple allowed)
                </span>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={handleFilesSelected} />
              </label>

              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-gaming text-primary">{uploadQueue.length} file(s) queued</p>
                  <div className="flex flex-wrap gap-2">
                    {uploadQueue.map((item, idx) => (
                      <div key={idx} className="relative">
                        <img src={item.previewUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-border" style={{ imageRendering: "pixelated" }} />
                        <button onClick={() => removeFromQueue(idx)} className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[8px]">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={addSkins}
                disabled={adding || uploadQueue.length === 0}
                className="w-full py-2.5 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {adding ? "UPLOADING..." : `ADD ${uploadQueue.length || ""} SKIN${uploadQueue.length !== 1 ? "S" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displaySkins.map((skin) => (
          <div key={skin.id} className="group neon-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
            <div className="aspect-square bg-secondary/30 flex items-center justify-center p-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-30" />
              {skin.image_url ? (
                <img src={skin.image_url} alt={skin.name} className="w-full h-full object-contain relative" style={{ imageRendering: "pixelated" }} />
              ) : (
                <Shirt size={32} className="text-muted-foreground" />
              )}
            </div>
            <div className="p-2.5 space-y-1.5">
              <p className="font-gaming text-xs truncate text-foreground">{skin.name}</p>
              {skin.category !== "default" && (
                <span className="inline-block text-[10px] font-mono-game px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {skin.category}
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono-game">{skin.downloads} ↓</span>
                <button
                  onClick={() => downloadSkin(skin)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-gaming bg-primary/10 border border-primary/30 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Download size={10} /> GET
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
