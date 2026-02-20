import { useState } from "react";
import { ExternalLink, Maximize2, Play } from "lucide-react";

const GAME_URL = "https://tuffchicken.netlify.app";

const GameEmbed = () => {
  const [launched, setLaunched] = useState(false);

  const launchInBlank = () => {
    window.open(GAME_URL, "_blank", "noopener,noreferrer");
  };

  const launchFullscreen = () => {
    const iframe = document.getElementById("game-iframe") as HTMLIFrameElement;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <section id="play" className="relative">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(188_100%_50%)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">PLAY NOW</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={launchFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-gaming border border-border rounded hover:border-primary hover:text-primary transition-all"
          >
            <Maximize2 size={12} />
            FULLSCREEN
          </button>
          <button
            onClick={launchInBlank}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-gaming border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_8px_hsl(188_100%_50%/0.3)]"
          >
            <ExternalLink size={12} />
            ABOUT:BLANK
          </button>
        </div>
      </div>

      {/* Game frame */}
      <div className="relative neon-card rounded-lg overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        {!launched && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-primary flex items-center justify-center shadow-[0_0_30px_hsl(188_100%_50%/0.5)] animate-pulse">
                <Play size={36} className="text-primary ml-2" />
              </div>
              <div className="absolute inset-0 rounded-full border border-primary/30 scale-125 animate-ping" />
            </div>
            <div className="text-center">
              <h3 className="font-gaming text-2xl neon-text mb-2">TUFF CHICKEN</h3>
              <p className="text-muted-foreground text-sm font-mono-game">Eaglercraft Minecraft Server</p>
            </div>
            <button
              onClick={() => setLaunched(true)}
              className="px-8 py-3 font-gaming text-sm bg-primary text-primary-foreground rounded pixel-corners hover:bg-primary/90 transition-all shadow-[0_0_20px_hsl(188_100%_50%/0.4)] hover:shadow-[0_0_30px_hsl(188_100%_50%/0.6)]"
            >
              LAUNCH GAME
            </button>
          </div>
        )}
        <iframe
          id="game-iframe"
          src={launched ? GAME_URL : "about:blank"}
          className="w-full h-full border-0"
          title="Tuff Chicken Eaglercraft"
          allow="fullscreen; microphone; camera"
        />
      </div>
    </section>
  );
};

export default GameEmbed;
