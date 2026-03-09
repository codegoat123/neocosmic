import { useState, useEffect, useRef } from "react";

const UPGRADES = [
  { name: "Auto Clicker", baseCost: 10, cps: 1 },
  { name: "Robo Clicker", baseCost: 100, cps: 5 },
  { name: "Quantum Tap", baseCost: 500, cps: 20 },
  { name: "Cosmic Engine", baseCost: 2500, cps: 100 },
];

const ClickerGame = ({ onBack }: { onBack: () => void }) => {
  const [clicks, setClicks] = useState(0);
  const [total, setTotal] = useState(0);
  const [owned, setOwned] = useState<number[]>(UPGRADES.map(() => 0));
  const [pop, setPop] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);

  const cps = UPGRADES.reduce((sum, u, i) => sum + u.cps * owned[i], 0);

  useEffect(() => {
    if (cps === 0) return;
    const iv = setInterval(() => {
      setClicks(c => c + cps / 10);
      setTotal(t => t + cps / 10);
    }, 100);
    return () => clearInterval(iv);
  }, [cps]);

  const handleClick = (e: React.MouseEvent) => {
    setClicks(c => c + 1);
    setTotal(t => t + 1);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const id = nextId.current++;
    setPop(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setPop(p => p.filter(pp => pp.id !== id)), 600);
  };

  const buy = (i: number) => {
    const cost = Math.floor(UPGRADES[i].baseCost * Math.pow(1.15, owned[i]));
    if (clicks < cost) return;
    setClicks(c => c - cost);
    setOwned(o => { const n = [...o]; n[i]++; return n; });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <button onClick={onBack} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <span className="font-gaming text-xs text-muted-foreground">{cps.toFixed(1)} / sec</span>
      </div>
      <div className="text-center">
        <p className="font-gaming text-3xl text-primary">{Math.floor(clicks)}</p>
        <p className="font-mono-game text-xs text-muted-foreground">TOTAL: {Math.floor(total)}</p>
      </div>
      <button onClick={handleClick}
        className="relative w-32 h-32 rounded-full bg-primary/20 border-4 border-primary hover:bg-primary/30 active:scale-95 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
        <span className="font-gaming text-3xl text-primary">TAP</span>
        {pop.map(p => (
          <span key={p.id} className="absolute font-gaming text-sm text-primary animate-ping pointer-events-none"
            style={{ left: p.x, top: p.y }}>+1</span>
        ))}
      </button>
      <div className="w-full max-w-[400px] space-y-2">
        <p className="font-gaming text-xs text-muted-foreground">UPGRADES</p>
        {UPGRADES.map((u, i) => {
          const cost = Math.floor(u.baseCost * Math.pow(1.15, owned[i]));
          const canBuy = clicks >= cost;
          return (
            <button key={i} onClick={() => buy(i)} disabled={!canBuy}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                canBuy ? "border-primary/50 bg-primary/10 hover:bg-primary/20" : "border-border bg-card opacity-60"
              }`}>
              <div className="text-left">
                <p className="font-gaming text-xs">{u.name} <span className="text-muted-foreground">x{owned[i]}</span></p>
                <p className="font-mono-game text-[10px] text-muted-foreground">+{u.cps}/s</p>
              </div>
              <span className="font-gaming text-xs text-primary">{cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClickerGame;
