import { useState, useEffect, useCallback, useRef } from "react";

const GRID = 20;
const CELL = 20;
const SPEED = 120;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

const SnakeGame = ({ onBack }: { onBack: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Pos[],
    dir: "RIGHT" as Dir,
    nextDir: "RIGHT" as Dir,
    food: { x: 15, y: 10 } as Pos,
    running: false,
  });

  const spawnFood = useCallback((snake: Pos[]): Pos => {
    let f: Pos;
    do { f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (snake.some(s => s.x === f.x && s.y === f.y));
    return f;
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    ctx.fillStyle = "hsl(240 10% 8%)";
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    // grid lines
    ctx.strokeStyle = "hsl(240 10% 14%)";
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL); ctx.stroke();
    }
    // food
    ctx.fillStyle = "hsl(0 85% 60%)";
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    // snake
    s.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "hsl(142 70% 50%)" : "hsl(142 60% 40%)";
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.dir = s.nextDir;
    const head = { ...s.snake[0] };
    if (s.dir === "UP") head.y--;
    if (s.dir === "DOWN") head.y++;
    if (s.dir === "LEFT") head.x--;
    if (s.dir === "RIGHT") head.x++;

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      s.running = false;
      setGameOver(true);
      return;
    }
    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.food = spawnFood(s.snake);
      setScore(prev => prev + 10);
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw, spawnFood]);

  useEffect(() => {
    if (!started) return;
    const iv = setInterval(tick, SPEED);
    return () => clearInterval(iv);
  }, [started, tick]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const map: Record<string, Dir> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (nd !== opp[s.dir]) s.nextDir = nd;
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const startGame = () => {
    stateRef.current = {
      snake: [{ x: 10, y: 10 }],
      dir: "RIGHT", nextDir: "RIGHT",
      food: spawnFood([{ x: 10, y: 10 }]),
      running: true,
    };
    setScore(0);
    setGameOver(false);
    setStarted(true);
    draw();
  };

  useEffect(() => { draw(); }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <button onClick={onBack} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <span className="font-gaming text-sm text-primary">SCORE: {score}</span>
      </div>
      <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} className="border border-border rounded-lg" />
      {(!started || gameOver) && (
        <div className="text-center space-y-2">
          {gameOver && <p className="font-gaming text-destructive text-sm">GAME OVER</p>}
          <button onClick={startGame} className="px-6 py-2 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            {gameOver ? "RETRY" : "START"}
          </button>
          <p className="text-xs text-muted-foreground font-mono-game">WASD or Arrow Keys</p>
        </div>
      )}
      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-1 sm:hidden">
        <div />
        <button onTouchStart={() => { stateRef.current.nextDir = "UP"; }} className="p-3 bg-card border border-border rounded font-gaming text-xs">▲</button>
        <div />
        <button onTouchStart={() => { stateRef.current.nextDir = "LEFT"; }} className="p-3 bg-card border border-border rounded font-gaming text-xs">◄</button>
        <button onTouchStart={() => { stateRef.current.nextDir = "DOWN"; }} className="p-3 bg-card border border-border rounded font-gaming text-xs">▼</button>
        <button onTouchStart={() => { stateRef.current.nextDir = "RIGHT"; }} className="p-3 bg-card border border-border rounded font-gaming text-xs">►</button>
      </div>
    </div>
  );
};

export default SnakeGame;
