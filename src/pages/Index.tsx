import Header from "@/components/Header";
import GameEmbed from "@/components/GameEmbed";
import GamesSection from "@/components/GamesSection";
import SkinsSection from "@/components/SkinsSection";
import GlobalChat from "@/components/GlobalChat";
import VoiceChat from "@/components/VoiceChat";
import AdBanner from "@/components/AdBanner";
import RanksSection from "@/components/RanksSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Top ad banner */}
      <div className="border-b border-border px-4 py-2 bg-card/30">
        <AdBanner format="horizontal" className="max-w-4xl mx-auto" />
      </div>

      {/* Main layout */}
      <main className="flex-1 flex flex-col">
        {/* Game + Sidebar */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0">
          {/* Game area */}
          <div className="relative p-4 min-h-0">
            <GameEmbed />
          </div>

          {/* Sidebar: Voice + Chat */}
          <div className="flex flex-col border-l border-border bg-card/30">
            <div className="p-4 space-y-4 flex flex-col h-full">
              <VoiceChat />
              <div className="flex-1 min-h-0" style={{ minHeight: "320px" }}>
                <GlobalChat />
              </div>
              {/* Sidebar ad */}
              <AdBanner format="rectangle" />
            </div>
          </div>
        </div>

        {/* Ranks section */}
        <div className="border-t border-border p-6 bg-background/50">
          <RanksSection />
        </div>

        {/* All Games section */}
        <div className="border-t border-border p-6 bg-background/50">
          <GamesSection />
        </div>

        {/* Mid-page ad */}
        <div className="border-t border-border px-6 py-3 bg-card/20">
          <AdBanner format="horizontal" className="max-w-3xl mx-auto" />
        </div>

        {/* Skins section below */}
        <div className="border-t border-border p-6 bg-background/50">
          <SkinsSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 px-6 text-center">
        <p className="text-xs font-mono-game text-muted-foreground">
          NOVION GAMING · <span className="text-primary">novion.lovable.app</span> · PLAY GAMES FOR FREE
        </p>
      </footer>
    </div>
  );
};

export default Index;
