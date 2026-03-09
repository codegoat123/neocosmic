import { useState, useEffect, useRef, useCallback } from "react";

const W = 320, H = 480;
const GRAVITY = 0.5, JUMP = -7, PIPE_W = 50, GAP = 140, PIPE_SPEED = 2.5;
type Pipe = { x: number; topH: number };

const FlappyGame = ({ onBack }: { onBack: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const stateRef = useRef({ y: H / 2, vel: 0, pipes: [] as Pipe[], score: 0, running: false, frame: 0 });

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    // sky
    ctx.fillStyle = "hsl(220 30% 12%)";
    ctx.fillRect(0, 0, W, H);
    // ground
    ctx.fillStyle = "hsl(120 20% 18%)";
    ctx.fillRect(0, H - 40, W, 40);
    // pipes
    ctx.fillStyle = "hsl(142 50% 35%)";
    s.pipes.forEach(p => {
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      ctx.fillRect(p.x, p.topH + GAP, PIPE_W, H - p.topH - GAP);
      // pipe caps
      ctx.fillStyle = "hsl(142 50% 45%)";
      ctx.fillRect(p.x - 3, p.topH - 20, PIPE_W + 6, 20);
      ctx.fillRect(p.x - 3, p.topH + GAP, PIPE_W + 6, 20);
      ctx.fillStyle = "hsl(142 50% 35%)";
    });
    // bird
    ctx.fillStyle = "hsl(45 90% 55%)";
    ctx.beginPath();
    ctx.arc(60, s.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "hsl(0 0% 10%)";
    ctx.beginPath();
    ctx.arc(68, s.y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // score
    ctx.fillStyle = "white";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(s.score), W / 2, 50);
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    s.vel += GRAVITY;
    s.y += s.vel;
    s.frame++;
    // spawn pipes
    if (s.frame % 90 === 0) {
      const topH = 60 + Math.random() * (H - GAP - 140);
      s.pipes.push({ x: W, topH });
    }
    // move pipes
    s.pipes.forEach(p => { p.x -= PIPE_SPEED; });
    // score
    s.pipes.forEach(p => {
      if (Math.abs(p.x + PIPE_W / 2 - 60) < PIPE_SPEED) {
        s.score++;
        setScore(s.score);
      }
    });
    // remove offscreen
    s.pipes = s.pipes.filter(p => p.x + PIPE_W > -10);
    // collision
    const birdR = 13;
    if (s.y + birdR > H - 40 || s.y - birdR < 0) { s.running = false; setGameOver(true); setBest(b => Math.max(b, s.score)); return; }
    for (const p of s.pipes) {
      if (60 + birdR > p.x && 60 - birdR < p.x + PIPE_W) {
        if (s.y - birdR < p.topH || s.y + birdR > p.topH + GAP) {
          s.running = false; setGameOver(true); setBest(b => Math.max(b, s.score)); return;
        }
      }
    }
    draw();
  }, [draw]);

  useEffect(() => {
    if (!started) { draw(); return; }
    const iv = setInterval(tick, 1000 / 60);
    return () => clearInterval(iv);
  }, [started, tick, draw]);

  const flap = () => {
    if (!stateRef.current.running) return;
    stateRef.current.vel = JUMP;
  };

  const start = () => {
    stateRef.current = { y: H / 2, vel: 0, pipes: [], score: 0, running: true, frame: 0 };
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.code === "Space" || e.key === " ") { e.preventDefault(); flap(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[320px]">
        <button onClick={onBack} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <span className="font-gaming text-xs text-muted-foreground">BEST: {best}</span>
      </div>
      <canvas ref={canvasRef} width={W} height={H}
        onClick={flap} onTouchStart={flap}
        className="border border-border rounded-lg cursor-pointer" />
      {(!started || gameOver) && (
        <div className="text-center space-y-2">
          {gameOver && <p className="font-gaming text-destructive text-sm">SCORE: {score}</p>}
          <button onClick={start} className="px-6 py-2 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            {gameOver ? "RETRY" : "START"}
          </button>
          <p className="text-xs text-muted-foreground font-mono-game">Space / Click / Tap to flap</p>
        </div>
      )}
    </div>
  );
};

export default FlappyGame;
