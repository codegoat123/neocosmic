import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HomeTab from "@/components/HomeTab";
import GamesSection from "@/components/GamesSection";
import AIChatSection from "@/components/AIChatSection";
import WebsitesSection from "@/components/WebsitesSection";
import ToolsSection from "@/components/ToolsSection";
import SkinsSection from "@/components/SkinsSection";
import RanksSection from "@/components/RanksSection";
import ActivityLog from "@/components/ActivityLog";
import AdBanner from "@/components/AdBanner";
import AuthPage from "@/components/AuthPage";
import ChatSection from "@/components/chat/ChatSection";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [lightMode, setLightMode] = useState(() => localStorage.getItem("neocosmic_theme") === "light");
  const { isAdmin, login, logout } = useAdmin();
  const { user, profile, signUp, signIn, signOut } = useAuth();

  useEffect(() => {
    if (lightMode) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("neocosmic_theme", lightMode ? "light" : "dark");
  }, [lightMode]);

  const renderTab = () => {
    switch (activeTab) {
      case "home": return <HomeTab onTabChange={setActiveTab} />;
      case "games": return <GamesSection isAdmin={isAdmin} />;
      case "chat":
        if (!user || !profile) return <AuthPage onSignUp={signUp} onSignIn={signIn} />;
        return <ChatSection userId={user.id} username={profile.username} isAdmin={isAdmin} />;
      case "ai": return <AIChatSection />;
      case "websites": return <WebsitesSection isAdmin={isAdmin} />;
      case "tools": return <ToolsSection isAdmin={isAdmin} />;
      case "skins": return <SkinsSection />;
      case "ranks": return <RanksSection />;
      case "activity": return <ActivityLog />;
      case "auth": return <AuthPage onSignUp={signUp} onSignIn={signIn} />;
      default: return <HomeTab onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        onAdminLogin={login}
        onAdminLogout={logout}
        lightMode={lightMode}
        onToggleTheme={() => setLightMode(!lightMode)}
        user={user}
        profile={profile}
        onSignOut={signOut}
      />

      <div className="border-b border-border px-4 py-2 bg-card/30">
        <AdBanner format="horizontal" className="max-w-4xl mx-auto" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {renderTab()}
      </main>

      <footer className="border-t border-border py-3 px-6 text-center">
        <p className="text-xs font-mono-game text-muted-foreground">
          NEOCOSMIC · <span className="text-primary">neocosmic.lovable.app</span> · FREE ENTERTAINMENT PORTAL
        </p>
      </footer>
    </div>
  );
};

export default Index;
