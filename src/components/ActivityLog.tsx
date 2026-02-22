import { Clock } from "lucide-react";

const logs = [
  { date: "Feb 22 2026", text: "Site restructured with tabbed layout — NeoCosmic rebrand" },
  { date: "Feb 21 2026", text: "Added Ranks, Skins, and Ad monetization" },
  { date: "Feb 20 2026", text: "Initial site created with game portal and chat" },
];

const ActivityLog = () => {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
        <h2 className="font-gaming text-lg neon-text tracking-wider">ACTIVITY LOG</h2>
      </div>

      <div className="neon-card rounded-lg p-4 space-y-3">
        <p className="text-xs text-muted-foreground font-mono-game">Recent changes and site history.</p>
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
              <Clock size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-gaming text-primary">{log.date}</span>
                <p className="text-xs text-muted-foreground font-mono-game mt-0.5">{log.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
