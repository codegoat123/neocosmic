import { useState, useEffect } from "react";

const EMOJIS = ["🎮","🚀","⭐","🔥","💎","🎯","🌙","⚡","🎪","🌈","🎭","🦄","🍕","🎸","🐉","🌊","🎨","🏆"];

const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const [size, setSize] = useState<4 | 6>(4);
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const initGame = (s: 4 | 6) => {
    setSize(s);
    const pairs = (s * s) / 2;
    const picked = EMOJIS.slice(0, pairs);
    const deck = [...picked, ...picked].sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => { initGame(4); }, []);

  const handleFlip = (i: number) => {
    if (locked || flipped.includes(i) || matched.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      if (cards[next[0]] === cards[next[1]]) {
        setMatched(m => [...m, next[0], next[1]]);
        setFlipped([]);
      } else {
        setLocked(true);
        setTimeout(() => { setFlipped([]); setLocked(false); }, 800);
      }
    }
  };

  const won = matched.length === cards.length && cards.length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[500px]">
        <button onClick={onBack} className="text-xs font-gaming text-muted-foreground hover:text-primary">← BACK</button>
        <div className="flex items-center gap-4">
          <span className="font-gaming text-xs text-muted-foreground">MOVES: {moves}</span>
          <div className="flex gap-1">
            {([4, 6] as const).map(s => (
              <button key={s} onClick={() => initGame(s)}
                className={`px-2 py-1 text-xs font-gaming rounded ${size === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50"}`}>
                {s}x{s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`grid gap-2 ${size === 4 ? "grid-cols-4" : "grid-cols-6"}`}>
        {cards.map((emoji, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <button key={i} onClick={() => handleFlip(i)}
              className={`${size === 4 ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"} rounded-lg border-2 transition-all duration-300 ${
                matched.includes(i) ? "border-primary/30 bg-primary/10 scale-95" :
                isFlipped ? "border-primary bg-card" :
                "border-border bg-secondary/30 hover:border-primary/50"
              }`}>
              {isFlipped ? emoji : "?"}
            </button>
          );
        })}
      </div>
      {won && (
        <div className="text-center space-y-2">
          <p className="font-gaming text-primary text-sm">🎉 YOU WON IN {moves} MOVES!</p>
          <button onClick={() => initGame(size)} className="px-6 py-2 font-gaming text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
