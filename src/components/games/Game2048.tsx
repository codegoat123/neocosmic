import { useState, useEffect, useCallback } from "react";

type Board = number[][];
const SIZE = 4;

const empty = (): Board => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const addRandom = (b: Board): Board => {
  const cells: [number, number][] = [];
  b.forEach((r, ri) => r.forEach((c, ci) => { if (c === 0) cells.push([ri, ci]); }));
  if (cells.length === 0) return b;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const nb = b.map(r => [...r]);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
};

const slideRow = (row: number[]): { row: number[]; score: number } => {
  let score = 0;
  const filtered = row.filter(v => v !== 0);
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, score };
};

const move = (board: Board, dir: "left" | "right" | "up" | "down"): { board: Board; score: number } => {
  let b = board.map(r => [...r]);
  let totalScore = 0;
  const transpose = (m: Board): Board => m[0].map((_, i) => m.map(r => r[i]));
  const reverse = (m: Board): Board => m.map(r => [...r].reverse());

  if (dir === "up") b = transpose(b);
  if (dir === "down") b = reverse(transpose(b));
  if (dir === "right") b = reverse(b);

  b = b.map(row => {
    const { row: nr, score } = slideRow(row);
    totalScore += score;
    return nr;
  });

  if (dir === "up") b = transpose(b);
  if (dir === "down") b = transpose(reverse(b));
  if (dir === "right") b = reverse(b);

  return { board: b, score: totalScore };
};

const canMove = (b: Board): boolean => {
  for (const dir of ["left", "right", "up", "down"] as const) {
    const { board: nb } = move(b, dir);
    if (JSON.stringify(nb) !== JSON.stringify(b)) return true;
  }
  return false;
};

const COLORS: Record<number, string> = {
  0: "bg-secondary/30 text-transparent", 2: "bg-accent/40 text-foreground", 4: "bg-accent/60 text-foreground",
  8: "bg-orange-500/70 text-foreground", 16: "bg-orange-600/80 text-foreground", 32: "bg-red-500/70 text-foreground",
  64: "bg-red-600/80 text-foreground", 128: "bg-yellow-400/70 text-foreground font-bold", 256: "bg-yellow-500/80 text-foreground font-bold",
  512: "bg-yellow-600/80 text-foreground font-bold", 1024: "bg-primary/70 text-primary-foreground font-bold", 2048: "bg-primary text-primary-foreground font-bold",
};

const Game2048 = ({ onBack }: { onBack: () => void }) => {
  const [board, setBoard] = useState<Board>(() => addRandom(addRandom(empty())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleMove = useCallback((dir: "left" | "right" | "up" | "down") => {
    if (gameOver) return;
    setBoard(prev => {
      const { board: nb, score: gained } = move(prev, dir);
      if (JSON.stringify(nb) === JSON.stringify(prev)) return prev;
      const withNew = addRandom(nb);
      setScore(s => {
        const ns = s + gained;
        setBest(b => Math.max(b, ns));
        return ns;
      });
      if (!canMove(withNew)) setGameOver(true);
      return withNew;
    });
  }, [gameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
      };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleMove]);

  const reset = () => { setBoard(addRandom(addRandom(empty()))); setScore(0); setGameOver(false); };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[340px]">
        <button onClick={onBack} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <div className="flex gap-4">
          <span className="font-gaming text-xs text-primary">SCORE: {score}</span>
          <span className="font-gaming text-xs text-muted-foreground">BEST: {best}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/20 rounded-xl border border-border">
        {board.flat().map((val, i) => (
          <div key={i} className={`w-16 h-16 rounded-lg flex items-center justify-center font-gaming text-sm transition-all ${COLORS[val] || "bg-primary text-primary-foreground font-bold"}`}>
            {val || ""}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="text-center space-y-2">
          <p className="font-gaming text-destructive text-sm">GAME OVER — {score} PTS</p>
          <button onClick={reset} className="px-6 py-2 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">RETRY</button>
        </div>
      )}
      {!gameOver && (
        <div className="grid grid-cols-3 gap-1 sm:hidden">
          <div />
          <button onTouchStart={() => handleMove("up")} className="p-3 bg-card border border-border rounded font-gaming text-xs">▲</button>
          <div />
          <button onTouchStart={() => handleMove("left")} className="p-3 bg-card border border-border rounded font-gaming text-xs">◄</button>
          <button onTouchStart={() => handleMove("down")} className="p-3 bg-card border border-border rounded font-gaming text-xs">▼</button>
          <button onTouchStart={() => handleMove("right")} className="p-3 bg-card border border-border rounded font-gaming text-xs">►</button>
        </div>
      )}
      <p className="text-xs text-muted-foreground font-mono-game">WASD or Arrow Keys</p>
    </div>
  );
};

export default Game2048;
