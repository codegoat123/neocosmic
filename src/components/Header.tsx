import { useState } from "react";
import { Sun, Moon, Shield, LogOut, Menu, X } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
  onAdminLogin: (password: string) => boolean;
  onAdminLogout: () => void;
  lightMode: boolean;
  onToggleTheme: () => void;
}

const tabs = [
  { id: "home", label: "HOME" },
  { id: "games", label: "GAMES" },
  { id: "chat", label: "CHAT" },
  { id: "voice", label: "VOICE" },
  { id: "movies", label: "MOVIES" },
  { id: "websites", label: "WEBSITES" },
  { id: "tools", label: "TOOLS" },
  { id: "skins", label: "SKINS" },
  { id: "ranks", label: "RANKS" },
  { id: "activity", label: "ACTIVITY" },
];

const Header = ({ activeTab, onTabChange, isAdmin, onAdminLogin, onAdminLogout, lightMode, onToggleTheme }: HeaderProps) => {
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [passError, setPassError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminLogin = () => {
    if (onAdminLogin(adminPass)) {
      setShowAdminInput(false);
      setAdminPass("");
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 overflow-hidden rounded">
            <img src={logoImg} alt="NeoCosmic" className="w-16 h-16 object-cover object-top -mt-1 -ml-3 scale-110" style={{ objectPosition: "50% 30%" }} />
          </div>
          <div>
            <h1 className="font-gaming text-sm neon-text tracking-widest">NEOCOSMIC</h1>
            <p className="text-[10px] text-muted-foreground font-mono-game tracking-wider">PORTAL</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 font-gaming text-[11px] flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-md border border-border hover:border-primary transition-all"
            title={lightMode ? "Switch to dark" : "Switch to light blue"}
          >
            {lightMode ? <Moon size={14} className="text-foreground" /> : <Sun size={14} className="text-primary" />}
          </button>

          {/* Admin */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-gaming text-primary">ADMIN</span>
              <button onClick={onAdminLogout} className="p-1 text-muted-foreground hover:text-destructive"><LogOut size={12} /></button>
            </div>
          ) : (
            <>
              {showAdminInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="password"
                    className="w-20 px-2 py-1 text-xs bg-input border border-border rounded font-mono-game focus:outline-none focus:border-primary"
                    placeholder="Password"
                    value={adminPass}
                    onChange={(e) => { setAdminPass(e.target.value); setPassError(false); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    autoFocus
                  />
                  <button onClick={handleAdminLogin} className="text-[10px] font-gaming text-primary">GO</button>
                  <button onClick={() => { setShowAdminInput(false); setPassError(false); }} className="text-muted-foreground"><X size={12} /></button>
                  {passError && <span className="text-[10px] text-destructive">✗</span>}
                </div>
              ) : (
                <button onClick={() => setShowAdminInput(true)} className="p-2 rounded-md border border-border hover:border-primary transition-all" title="Admin login">
                  <Shield size={14} className="text-muted-foreground" />
                </button>
              )}
            </>
          )}

          {/* Mobile menu */}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-md p-3">
          <div className="grid grid-cols-3 gap-2 font-gaming text-[10px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setMobileMenuOpen(false); }}
                className={`px-2 py-2 rounded transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground bg-secondary/30 hover:bg-secondary/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
