import logoImg from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="relative z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - cropped to hide text using object-position */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 overflow-hidden rounded">
            <img
              src={logoImg}
              alt="Novion Gaming"
              className="w-20 h-20 object-cover object-top -mt-1 -ml-4 scale-110"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          <div>
            <h1 className="font-gaming text-xl neon-text tracking-widest">NOVION</h1>
            <p className="text-xs text-muted-foreground font-mono-game tracking-wider">GAME PORTAL</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 font-gaming text-sm">
          <a href="#play" className="text-muted-foreground hover:text-primary transition-colors hover:neon-text">PLAY</a>
          <a href="#games" className="text-muted-foreground hover:text-primary transition-colors hover:neon-text">GAMES</a>
          <a href="#ranks" className="text-muted-foreground hover:text-primary transition-colors hover:neon-text">RANKS</a>
          <a href="#skins" className="text-muted-foreground hover:text-primary transition-colors hover:neon-text">SKINS</a>
          <a href="#chat" className="text-muted-foreground hover:text-primary transition-colors hover:neon-text">CHAT</a>
        </nav>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs font-mono-game">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(188_100%_50%)]" />
          <span className="text-primary">SERVER ONLINE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
