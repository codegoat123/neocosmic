import { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, User } from "lucide-react";

interface AuthPageProps {
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthPage = ({ onSignUp, onSignIn }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signup") {
      if (!username.trim()) {
        setError("Username is required");
        setLoading(false);
        return;
      }
      const { error } = await onSignUp(email, password, username.trim());
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to verify your account!");
      }
    } else {
      const { error } = await onSignIn(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="neon-card rounded-xl p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 rounded-lg font-gaming text-xs flex items-center justify-center gap-2 transition-all ${
              mode === "login"
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn size={14} /> SIGN IN
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 rounded-lg font-gaming text-xs flex items-center justify-center gap-2 transition-all ${
              mode === "signup"
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus size={14} /> SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-input border border-border rounded-lg text-sm font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 bg-input border border-border rounded-lg text-sm font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-9 pr-3 py-2.5 bg-input border border-border rounded-lg text-sm font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-xs text-destructive font-mono-game">{error}</p>}
          {success && <p className="text-xs text-primary font-mono-game">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-gaming text-xs tracking-wider hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
