import Header from "@/components/Header";
import GameEmbed from "@/components/GameEmbed";
import SkinsSection from "@/components/SkinsSection";
import GlobalChat from "@/components/GlobalChat";
import VoiceChat from "@/components/VoiceChat";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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
            </div>
          </div>
        </div>

        {/* Skins section below */}
        <div className="border-t border-border p-6 bg-background/50">
          <SkinsSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 px-6 text-center">
        <p className="text-xs font-mono-game text-muted-foreground">
          RYZ EAGLERCRAFT · <span className="text-primary">tuffchicken.netlify.app</span> · NOT AFFILIATED WITH MOJANG
        </p>
      </footer>
    </div>
  );
};

export default Index;
