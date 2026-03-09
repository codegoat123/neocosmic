import { useState } from "react";

type Cell = "X" | "O" | null;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const checkWin = (b: Cell[]): Cell => {
  for (const [a, bb, c] of LINES) if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a];
  return null;
};

const TicTacToe = ({ onBack }: { onBack: () => void }) => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [mode, setMode] = useState<"ai" | "2p" | null>(null);
  const winner = checkWin(board);
  const draw = !winner && board.every(c => c !== null);

  const aiMove = (b: Cell[]): number => {
    // try to win, then block, then center, then random
    for (const mark of ["O", "X"] as Cell[]) {
      for (const [a, bb, c] of LINES) {
        const cells = [b[a], b[bb], b[c]];
        if (cells.filter(c => c === mark).length === 2 && cells.includes(null)) {
          return [a, bb, c][cells.indexOf(null)];
        }
      }
    }
    if (!b[4]) return 4;
    const empty = b.map((c, i) => c === null ? i : -1).filter(i => i >= 0);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const next = [...board];
    next[i] = "X";
    if (checkWin(next) || next.every(c => c !== null)) { setBoard(next); return; }
    if (mode === "ai") {
      const ai = aiMove(next);
      next[ai] = "O";
      setBoard(next);
    } else {
      next[i] = xTurn ? "X" : "O";
      setBoard([...board.slice(0, i), xTurn ? "X" : "O", ...board.slice(i + 1)]);
      setXTurn(!xTurn);
    }
    if (mode === "ai") setBoard(next);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setXTurn(true); };

  if (!mode) {
    return (
      <div className="flex flex-col items-center gap-6">
        <button onClick={onBack} className="self-start text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <h3 className="font-gaming text-lg text-primary">TIC TAC TOE</h3>
        <div className="flex gap-4">
          <button onClick={() => setMode("ai")} className="px-6 py-3 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">VS AI</button>
          <button onClick={() => setMode("2p")} className="px-6 py-3 font-gaming text-sm border border-primary text-primary rounded-lg hover:bg-primary/10">2 PLAYER</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[300px]">
        <button onClick={() => { setMode(null); reset(); }} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <span className="font-gaming text-sm text-primary">
          {winner ? `${winner} WINS!` : draw ? "DRAW!" : mode === "2p" ? `${xTurn ? "X" : "O"}'s TURN` : "YOUR TURN"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-lg border-2 font-gaming text-2xl transition-all ${
              cell === "X" ? "border-primary text-primary bg-primary/10" :
              cell === "O" ? "border-destructive text-destructive bg-destructive/10" :
              "border-border hover:border-primary/50 bg-card"
            }`}>
            {cell}
          </button>
        ))}
      </div>
      {(winner || draw) && (
        <button onClick={reset} className="px-6 py-2 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">PLAY AGAIN</button>
      )}
    </div>
  );
};

export default TicTacToe;
