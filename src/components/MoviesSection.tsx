import { useState } from "react";
import { Film, ExternalLink, Plus, X } from "lucide-react";

interface Movie {
  name: string;
  url: string;
  category: string;
  sub: string;
}

const defaultMovies: Movie[] = [
  // Superhero
  { name: "Batman The Dark Knight", url: "https://drive.google.com/file/d/1_g_fq1MEbqXuapY_dxXSdohAx8zmxwOX/view", category: "Superhero", sub: "DC" },
  { name: "The Amazing Spider-Man 2", url: "https://drive.google.com/file/d/1I94qWG6AAUfBzuLmksfBppnOP8Tu0-jp/view", category: "Superhero", sub: "Marvel" },
  { name: "Ant-Man", url: "https://drive.google.com/file/d/1_qJqk2Ss1f45puz3xGQcdD1NxM3ipupj/view", category: "Superhero", sub: "Marvel" },
  { name: "Shazam", url: "https://drive.google.com/file/d/1u5u_-G0KReiP4Q4eHvx7qwb4jv6ZARdh/view", category: "Superhero", sub: "DC" },
  { name: "Guardians Of The Galaxy Vol 2", url: "https://drive.google.com/file/d/0B-uFeCO4yCFIZXNnLUg3cVdiU3M/view", category: "Superhero", sub: "Marvel" },
  { name: "X-Men Origins: Wolverine", url: "https://drive.google.com/file/d/0BxvqXivT-hg5d2VmZDdsNlBNUzQ/view", category: "Superhero", sub: "Marvel" },
  { name: "Spider-Man Far From Home", url: "https://drive.google.com/file/d/1acFojGkY1Iv9EgcGSWEP-I3a8uYb-jhB/view", category: "Superhero", sub: "Marvel" },
  // Action
  { name: "John Wick Chapter 1", url: "https://drive.google.com/file/d/1X9Kflcg0LuRjceV6JghCzs49px8cRTIk/view", category: "Action", sub: "Action" },
  { name: "John Wick Chapter 2", url: "https://drive.google.com/file/d/1gzsZEVTNEb93tSa0nuzlpR2n20D4Dyx9/view", category: "Action", sub: "Action" },
  { name: "John Wick Chapter 3", url: "https://drive.google.com/file/d/1CsIZrKGXn557DdOJrdz5ty7nkg0i4CWR/view", category: "Action", sub: "Action" },
  { name: "John Wick Chapter 4", url: "https://drive.google.com/file/d/10LUlcX6Hu9pn3c3xmPlfJOf20Qjwgxq_/view", category: "Action", sub: "Action" },
  { name: "Avatar", url: "https://drive.google.com/file/d/16tKuEYtxi7EeKtX3yZZR-nXgZ_oGTxXS/view", category: "Action", sub: "Sci-Fi" },
  { name: "Men In Black", url: "https://drive.google.com/file/d/1lKwqLzxgLyJi0BhN9Lc8HdHMM7LMVb5V/view", category: "Action", sub: "Comedy" },
  { name: "Top Gun", url: "https://drive.google.com/file/d/1YPdexiO1cHulGguqGvHKq0Grsnpdlbs1/view", category: "Action", sub: "Drama" },
  { name: "Top Gun Maverick", url: "https://drive.google.com/file/d/1nmGDHktR96jkaYl2lf-d-XTtNtFh4PTv/view", category: "Action", sub: "Drama" },
  { name: "Ford V Ferrari", url: "https://drive.google.com/file/d/1NPB0oCsIuiPAc471b_XOGDnchbCZ72yh/view", category: "Action", sub: "Racing" },
  { name: "Back to The Future", url: "https://drive.google.com/file/d/1ZwP0FLdFdAoeskqGvQYX5CwqEeSFWS1G/view", category: "Action", sub: "Sci-Fi" },
  { name: "Back to The Future 2", url: "https://drive.google.com/file/d/1vmA2LTkSzbtUJve8TTy2UVkPAfHMtGwK/view", category: "Action", sub: "Sci-Fi" },
  { name: "Back to The Future 3", url: "https://drive.google.com/file/d/16A4hzHFTcNduq6F-u4zQw7iTha5aEKD-/view", category: "Action", sub: "Sci-Fi" },
  { name: "King Kong", url: "https://drive.google.com/file/d/0B4puC3vPIb6YZmMxbk9DOURnVnM/view", category: "Action", sub: "Monster" },
  // Comedy
  { name: "Deadpool", url: "https://drive.google.com/file/d/1drXS4b8XjDqgQ6tIjbS7RCN1Yq8CjDLZ/view", category: "Comedy", sub: "Action Comedy" },
  { name: "Deadpool 2", url: "https://drive.google.com/file/d/1zZ8WCsX7VyC1PSiSkA3Vi7g8M8txSTsk/view", category: "Comedy", sub: "Action Comedy" },
  { name: "Space Jam (1996)", url: "https://drive.google.com/file/d/1Jn-9YsKif3wVxnDfH3ZW3HwSq1iTyb6r/view", category: "Comedy", sub: "Sports" },
  // Fantasy
  { name: "Harry Potter Sorcerer's Stone", url: "https://drive.google.com/file/d/1uVloSmfcKGSjB8xTFGAdDIziXUK-80KO/view", category: "Fantasy", sub: "Fantasy" },
  { name: "Harry Potter Chamber of Secrets", url: "https://drive.google.com/file/d/1NSY9Ij-PcPhN4ODmmNTSvUhD5osQ_SCo/view", category: "Fantasy", sub: "Fantasy" },
  // Horror
  { name: "Friday The 13th", url: "https://drive.google.com/file/d/1gfcCCnkSzRhuIdMh2oNE3s1_G7Q_NGMM/view", category: "Horror", sub: "Horror" },
  // Animated
  { name: "Minions", url: "https://drive.google.com/file/d/1ZJWkqS6Y5XO6bRrgCH88rgQZR848Lr8V/view", category: "Animated", sub: "Animation" },
  { name: "Despicable Me", url: "https://drive.google.com/file/d/1KDDDkhqdiwnoXUw9aYc4WdBfprqPX6pE/view", category: "Animated", sub: "Animation" },
  { name: "Despicable Me 2", url: "https://drive.google.com/file/d/1bTG8tnEKRvWZnnwNRrHSwOC028Rr_Mrg/view", category: "Animated", sub: "Animation" },
  { name: "Despicable Me 3", url: "https://drive.google.com/file/d/1W_Wr8yBmz_lTq3c80Vqj1ZySqXHiQ6mF/view", category: "Animated", sub: "Animation" },
  { name: "Shrek 2", url: "https://drive.google.com/file/d/1Ft-mWElx-1rZzIXJBswt_HQ-1VrZ4th2/view", category: "Animated", sub: "Animation" },
  { name: "Shrek 3", url: "https://drive.google.com/file/d/14-x-OKdvv-EqLgiTPhFgF8lV9eS1fuld/view", category: "Animated", sub: "Animation" },
  { name: "The Lion King", url: "https://drive.google.com/file/d/1fpkFiPnyvjxCtN6a89i-U2H1cr5_Y_HC/view", category: "Animated", sub: "Animation" },
  { name: "Finding Nemo", url: "https://drive.google.com/file/d/11CN0fT7CwCHgz__mY4FWjcoT5w_wZD9S/view", category: "Animated", sub: "Animation" },
  { name: "Finding Dory", url: "https://drive.google.com/file/d/1uDOp65KtEnID520JjNC_kMOm91mNfGq6/view", category: "Animated", sub: "Animation" },
  { name: "Toy Story 3", url: "https://drive.google.com/file/d/13msxxmyEco7CRBkO_Ju1SMx5KK4r4Su8/view", category: "Animated", sub: "Animation" },
  { name: "Moana", url: "https://drive.google.com/file/d/1vVByxgnK-t40-HnVoSxF7CL-4Ann4L8M/view", category: "Animated", sub: "Animation" },
  { name: "Encanto", url: "https://drive.google.com/file/d/17mETnDL0Z4M-ke4aw9Oouuf9w8xQkfIb/view", category: "Animated", sub: "Animation" },
  { name: "SpongeBob", url: "https://drive.google.com/file/d/1r9XAqLDPOpnS16kyVDMLtsx9J3muPCb8/view", category: "Animated", sub: "Animation" },
  { name: "Puss in Boots", url: "https://drive.google.com/file/d/1p7bqEnvENeHTxRjKKONSpNh5murfawck/view", category: "Animated", sub: "Animation" },
  { name: "Spider-man: Into the Spider-Verse", url: "https://drive.google.com/file/d/18k9mTY7zM45nsFrfAmu5thQH6ao77O--/view", category: "Animated", sub: "Animation" },
  { name: "Luca", url: "https://drive.google.com/file/d/1VcUlwoH5kBsHK6vYEMYMJuhpYgTCng20/view", category: "Animated", sub: "Animation" },
  { name: "Boss Baby", url: "https://drive.google.com/file/d/0BzeoWH_knJbnUE02VUNtTEREQ3M/view", category: "Animated", sub: "Animation" },
  { name: "Sonic The Hedgehog 2", url: "https://drive.google.com/file/d/13YPdlfR1BTzXfqwmfbzfiuPycjQsh0Yb/view", category: "Animated", sub: "Animation" },
  // Anime
  { name: "Jujutsu Kaisen 0", url: "https://drive.google.com/file/d/12p9t7WdTzoVoLg7U8qj_MHU87DUN-bPC/view", category: "Anime", sub: "Anime Movie" },
  { name: "DragonBall Super: Broly", url: "https://drive.google.com/file/d/1Ap3wJXnZEJFhvAypnDa3ekjInwhKIUxz/view", category: "Anime", sub: "Anime Movie" },
  { name: "Spirited Away", url: "https://drive.google.com/file/d/1sFvzAbum2UGqazkhrSmbtSMO9NjSV968/view", category: "Anime", sub: "Anime Movie" },
  // Series
  { name: "Demon Slayer S1E1", url: "https://drive.google.com/file/d/16ApJR3QbXonfkNXPNmt2gWj6n24-0PaO/view", category: "Series", sub: "Demon Slayer" },
  { name: "Gravity Falls S1E1", url: "https://drive.google.com/file/d/1d9oOHmblAV1B39oQB86N91NZFqschhyh/view", category: "Series", sub: "Gravity Falls" },
  { name: "Spy x Family S1E1", url: "https://drive.google.com/file/d/1fKoBJycU0rihdlwfUsOHMQa9tYov-cyE/view", category: "Series", sub: "Spy x Family" },
  { name: "Wednesday S1E1", url: "https://drive.google.com/file/d/1GD7dmbbwf0tgmc_0Bt6Rq4qXV7KSTCMD/view", category: "Series", sub: "Wednesday" },
];

interface CustomMovie {
  name: string;
  url: string;
  imageUrl: string;
  description: string;
}

const MoviesSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const [filter, setFilter] = useState("All");
  const [customMovies, setCustomMovies] = useState<CustomMovie[]>(() => {
    try { return JSON.parse(localStorage.getItem("neocosmic_custom_movies") || "[]"); } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", imageUrl: "", description: "" });

  const categories = ["All", ...Array.from(new Set(defaultMovies.map(m => m.category)))];
  const filtered = filter === "All" ? defaultMovies : defaultMovies.filter(m => m.category === filter);

  const addMovie = () => {
    if (!form.name || !form.url) return;
    const updated = [...customMovies, form];
    setCustomMovies(updated);
    localStorage.setItem("neocosmic_custom_movies", JSON.stringify(updated));
    setForm({ name: "", url: "", imageUrl: "", description: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
          <h2 className="font-gaming text-lg neon-text tracking-wider">MOVIES</h2>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-gaming border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all">
            <Plus size={12} /> ADD MOVIE
          </button>
        )}
      </div>

      {showAdd && isAdmin && (
        <div className="neon-card rounded-lg p-4 space-y-2">
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Movie name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="URL (Google Drive link) *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Image URL" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
          <input className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm font-mono-game focus:outline-none focus:border-primary" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <button onClick={addMovie} disabled={!form.name || !form.url} className="w-full py-2 font-gaming text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">ADD MOVIE</button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 text-xs font-gaming rounded-md transition-all ${filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Custom movies */}
      {customMovies.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {customMovies.map((m, i) => (
            <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="neon-card rounded-lg p-3 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-gaming text-xs truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono-game">{m.description || "Custom"}</p>
                </div>
                <ExternalLink size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Default movies */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((movie, i) => (
          <a key={i} href={movie.url} target="_blank" rel="noopener noreferrer" className="neon-card rounded-lg p-3 hover:border-primary/30 transition-all group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center text-[10px] font-gaming text-primary shrink-0">
                {movie.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-gaming text-xs truncate">{movie.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono-game">{movie.sub}</p>
              </div>
              <ExternalLink size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 ml-auto" />
            </div>
          </a>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground font-mono-game">Movies hosted on Google Drive · Availability may vary</p>
    </div>
  );
};

export default MoviesSection;
