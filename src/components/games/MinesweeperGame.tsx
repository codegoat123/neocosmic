import { useState, useCallback } from "react";

type CellData = { mine: boolean; revealed: boolean; flagged: boolean; adjacent: number };

const createBoard = (rows: number, cols: number, mines: number): CellData[][] => {
  const board: CellData[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }))
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) { board[r][c].mine = true; placed++; }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
      }
      board[r][c].adjacent = count;
    }
  }
  return board;
};

const PRESETS = { easy: { rows: 8, cols: 8, mines: 10 }, medium: { rows: 12, cols: 12, mines: 30 }, hard: { rows: 16, cols: 16, mines: 60 } };
const ADJ_COLORS = ["", "text-blue-400", "text-green-400", "text-red-400", "text-purple-400", "text-yellow-400", "text-pink-400", "text-cyan-400", "text-white"];

const MinesweeperGame = ({ onBack }: { onBack: () => void }) => {
  const [diff, setDiff] = useState<keyof typeof PRESETS>("easy");
  const [board, setBoard] = useState(() => createBoard(8, 8, 10));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const preset = PRESETS[diff];

  const newGame = (d: keyof typeof PRESETS) => {
    setDiff(d);
    const p = PRESETS[d];
    setBoard(createBoard(p.rows, p.cols, p.mines));
    setGameOver(false);
    setWon(false);
  };

  const reveal = useCallback((r: number, c: number) => {
    if (gameOver || won) return;
    setBoard(prev => {
      const b = prev.map(row => row.map(cell => ({ ...cell })));
      if (b[r][c].flagged || b[r][c].revealed) return prev;
      if (b[r][c].mine) { 
        b.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
        setGameOver(true);
        return b;
      }
      const flood = (rr: number, cc: number) => {
        if (rr < 0 || rr >= b.length || cc < 0 || cc >= b[0].length) return;
        if (b[rr][cc].revealed || b[rr][cc].flagged || b[rr][cc].mine) return;
        b[rr][cc].revealed = true;
        if (b[rr][cc].adjacent === 0) {
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(rr + dr, cc + dc);
        }
      };
      flood(r, c);
      // check win
      const unrevealed = b.flat().filter(c => !c.revealed && !c.mine).length;
      if (unrevealed === 0) setWon(true);
      return b;
    });
  }, [gameOver, won]);

  const flag = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won) return;
    setBoard(prev => {
      const b = prev.map(row => row.map(cell => ({ ...cell })));
      if (b[r][c].revealed) return prev;
      b[r][c].flagged = !b[r][c].flagged;
      return b;
    });
  }, [gameOver, won]);

  const flags = board.flat().filter(c => c.flagged).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[500px]">
        <button onClick={onBack} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <div className="flex gap-3 items-center">
          <span className="font-gaming text-xs text-muted-foreground">💣 {preset.mines - flags}</span>
          {(["easy", "medium", "hard"] as const).map(d => (
            <button key={d} onClick={() => newGame(d)}
              className={`px-2 py-1 text-xs font-gaming rounded ${diff === d ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50"}`}>
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto max-w-full">
        <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${preset.cols}, minmax(0, 1fr))` }}>
          {board.map((row, r) => row.map((cell, c) => (
            <button key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => flag(e, r, c)}
              className={`w-7 h-7 text-xs font-gaming rounded-sm transition-all ${
                cell.revealed
                  ? cell.mine ? "bg-destructive/60 text-foreground" : "bg-card border border-border/50"
                  : cell.flagged ? "bg-yellow-500/30 border border-yellow-500/50" : "bg-secondary/50 border border-border hover:bg-secondary/80"
              } ${cell.revealed && cell.adjacent ? ADJ_COLORS[cell.adjacent] : ""}`}>
              {cell.revealed ? (cell.mine ? "💣" : cell.adjacent || "") : cell.flagged ? "🚩" : ""}
            </button>
          )))}
        </div>
      </div>
      {(gameOver || won) && (
        <div className="text-center space-y-2">
          <p className={`font-gaming text-sm ${won ? "text-primary" : "text-destructive"}`}>
            {won ? "🎉 YOU WON!" : "💥 GAME OVER"}
          </p>
          <button onClick={() => newGame(diff)} className="px-6 py-2 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">NEW GAME</button>
        </div>
      )}
      <p className="text-xs text-muted-foreground font-mono-game">Click to reveal · Right-click to flag</p>
    </div>
  );
};

export default MinesweeperGame;
