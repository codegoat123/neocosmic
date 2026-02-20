import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Users, PhoneCall, PhoneOff } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  muted: boolean;
  speaking: boolean;
}

const VoiceChat = () => {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username] = useState(() => localStorage.getItem("chat_username") || "Player");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const [speaking, setSpeaking] = useState(false);

  const joinVoice = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      
      // Set up audio analysis for speaking detection
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const checkSpeaking = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setSpeaking(avg > 15);
        animFrameRef.current = requestAnimationFrame(checkSpeaking);
      };
      checkSpeaking();

      // Add self to participants
      const self: Participant = {
        id: "local",
        name: username + " (you)",
        muted: false,
        speaking: false,
      };
      setParticipants([self]);
      setJoined(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message === "Permission denied" ? "Mic permission denied. Please allow microphone access." : "Could not access microphone.");
      }
    }
  };

  const leaveVoice = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setParticipants([]);
    setJoined(false);
    setSpeaking(false);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = muted; // toggle
      });
    }
    setMuted(!muted);
  };

  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, []);

  return (
    <div className="neon-card rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <PhoneCall size={14} className="text-primary" />
          <span className="font-gaming text-sm neon-text">VOICE CHAT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-muted-foreground" />
          <span className="text-xs font-mono-game text-muted-foreground">{participants.length}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {error && (
          <div className="text-xs text-destructive font-mono-game bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        {!joined ? (
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground font-mono-game">Join voice to talk with other players</p>
            <button
              onClick={joinVoice}
              className="w-full py-2.5 font-gaming text-sm bg-primary/10 border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all shadow-[0_0_10px_hsl(188_100%_50%/0.2)]"
            >
              JOIN VOICE
            </button>
          </div>
        ) : (
          <>
            {/* Participants */}
            <div className="space-y-1.5">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all ${
                    p.id === "local" && speaking && !muted
                      ? "bg-primary/10 border border-primary/40"
                      : "bg-secondary/30"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-gaming ${
                    p.id === "local" && speaking && !muted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-mono-game flex-1 truncate">{p.name}</span>
                  {p.id === "local" && speaking && !muted && (
                    <div className="flex gap-0.5">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-0.5 h-3 bg-primary rounded animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                  {muted && p.id === "local" && <MicOff size={10} className="text-destructive" />}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={toggleMute}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-gaming border transition-all ${
                  muted
                    ? "border-destructive text-destructive hover:bg-destructive/10"
                    : "border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {muted ? <MicOff size={12} /> : <Mic size={12} />}
                {muted ? "UNMUTE" : "MUTE"}
              </button>
              <button
                onClick={leaveVoice}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-gaming border border-destructive text-destructive hover:bg-destructive hover:text-white transition-all"
              >
                <PhoneOff size={12} />
                LEAVE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
