import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, PhoneCall, PhoneOff, Users, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Peer {
  id: string;
  name: string;
  speaking: boolean;
  muted: boolean;
  conn: RTCPeerConnection;
  stream?: MediaStream;
  audioEl?: HTMLAudioElement;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CHANNEL_NAME = "voice-signaling";

const VoiceChat = ({ isAdmin }: { isAdmin: boolean }) => {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [mutedVoiceUsers, setMutedVoiceUsers] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("neocosmic_muted_voice") || "[]")); } catch { return new Set(); }
  });

  const peerId = useRef<string>(localStorage.getItem("voice_peer_id") || (() => { const id = crypto.randomUUID(); localStorage.setItem("voice_peer_id", id); return id; })());
  const username = useRef<string>(localStorage.getItem("chat_username") || `Player${Math.floor(Math.random() * 9999)}`);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const updatePeers = useCallback(() => setPeers(new Map(peersRef.current)), []);

  const toggleMuteVoiceUser = (name: string) => {
    const updated = new Set(mutedVoiceUsers);
    if (updated.has(name)) updated.delete(name); else updated.add(name);
    setMutedVoiceUsers(updated);
    localStorage.setItem("neocosmic_muted_voice", JSON.stringify([...updated]));
    // Mute the audio element
    peersRef.current.forEach(peer => {
      if (peer.name === name && peer.audioEl) {
        peer.audioEl.muted = updated.has(name);
      }
    });
  };

  const createPeerConnection = useCallback((remotePeerId: string, remoteName: string): RTCPeerConnection => {
    const conn = new RTCPeerConnection(ICE_SERVERS);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => conn.addTrack(track, localStreamRef.current!));
    }
    conn.ontrack = (event) => {
      const [remoteStream] = event.streams;
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.muted = mutedVoiceUsers.has(remoteName);
      peersRef.current.set(remotePeerId, { ...peersRef.current.get(remotePeerId)!, stream: remoteStream, audioEl: audio });
      updatePeers();
      try {
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(remoteStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const check = () => {
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const peer = peersRef.current.get(remotePeerId);
          if (peer) { peer.speaking = data.reduce((a, b) => a + b, 0) / data.length > 15; updatePeers(); }
          requestAnimationFrame(check);
        };
        check();
      } catch (_) {}
    };
    conn.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({ type: "broadcast", event: "ice-candidate", payload: { from: peerId.current, to: remotePeerId, candidate: event.candidate } });
      }
    };
    conn.onconnectionstatechange = () => {
      if (conn.connectionState === "disconnected" || conn.connectionState === "failed") {
        const peer = peersRef.current.get(remotePeerId);
        if (peer) { peer.audioEl?.pause(); peer.conn.close(); peersRef.current.delete(remotePeerId); updatePeers(); }
      }
    };
    return conn;
  }, [updatePeers, mutedVoiceUsers]);

  const sendOffer = useCallback(async (remotePeerId: string, remoteName: string) => {
    const conn = createPeerConnection(remotePeerId, remoteName);
    peersRef.current.set(remotePeerId, { id: remotePeerId, name: remoteName, speaking: false, muted: false, conn });
    updatePeers();
    const offer = await conn.createOffer();
    await conn.setLocalDescription(offer);
    channelRef.current?.send({ type: "broadcast", event: "offer", payload: { from: peerId.current, fromName: username.current, to: remotePeerId, sdp: offer } });
  }, [createPeerConnection, updatePeers]);

  const joinVoice = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      localStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyserRef.current = analyser;
      const checkSpeaking = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        setSpeaking(data.reduce((a, b) => a + b, 0) / data.length > 15);
        animFrameRef.current = requestAnimationFrame(checkSpeaking);
      };
      checkSpeaking();
      const channel = supabase.channel(CHANNEL_NAME, { config: { broadcast: { self: false } } });
      channelRef.current = channel;
      channel
        .on("broadcast", { event: "peer-join" }, async ({ payload }) => { if (payload.id !== peerId.current) await sendOffer(payload.id, payload.name); })
        .on("broadcast", { event: "peer-leave" }, ({ payload }) => { const peer = peersRef.current.get(payload.id); if (peer) { peer.audioEl?.pause(); peer.conn.close(); peersRef.current.delete(payload.id); updatePeers(); } })
        .on("broadcast", { event: "offer" }, async ({ payload }) => {
          if (payload.to !== peerId.current) return;
          const conn = createPeerConnection(payload.from, payload.fromName);
          peersRef.current.set(payload.from, { id: payload.from, name: payload.fromName, speaking: false, muted: false, conn });
          updatePeers();
          await conn.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await conn.createAnswer();
          await conn.setLocalDescription(answer);
          channel.send({ type: "broadcast", event: "answer", payload: { from: peerId.current, fromName: username.current, to: payload.from, sdp: answer } });
        })
        .on("broadcast", { event: "answer" }, async ({ payload }) => { if (payload.to !== peerId.current) return; const peer = peersRef.current.get(payload.from); if (peer) await peer.conn.setRemoteDescription(new RTCSessionDescription(payload.sdp)); })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }) => { if (payload.to !== peerId.current) return; const peer = peersRef.current.get(payload.from); if (peer) try { await peer.conn.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (_) {} })
        .subscribe((status) => { if (status === "SUBSCRIBED") { channel.send({ type: "broadcast", event: "peer-join", payload: { id: peerId.current, name: username.current } }); setJoined(true); } });
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message.includes("Permission denied") || e.message.includes("NotAllowed") ? "Mic permission denied." : "Could not access microphone.");
    }
  };

  const leaveVoice = useCallback(() => {
    channelRef.current?.send({ type: "broadcast", event: "peer-leave", payload: { id: peerId.current } });
    peersRef.current.forEach((peer) => { peer.audioEl?.pause(); peer.conn.close(); });
    peersRef.current.clear();
    setPeers(new Map());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    setJoined(false);
    setSpeaking(false);
  }, []);

  const toggleMute = () => {
    if (localStreamRef.current) localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted(!muted);
  };

  useEffect(() => { return () => { leaveVoice(); }; }, [leaveVoice]);

  const allParticipants = [
    { id: "local", name: `${username.current} (you)`, speaking: speaking && !muted, muted },
    ...Array.from(peers.values()).map((p) => ({ id: p.id, name: p.name, speaking: p.speaking, muted: p.muted })),
  ];

  return (
    <div className="neon-card rounded-lg overflow-hidden" style={{ minHeight: "400px" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <PhoneCall size={14} className="text-primary" />
          <span className="font-gaming text-sm neon-text">VOICE CHAT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-muted-foreground" />
          <span className="text-xs font-mono-game text-muted-foreground">{joined ? allParticipants.length : 0}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {error && <div className="text-xs text-destructive font-mono-game bg-destructive/10 border border-destructive/30 rounded px-3 py-2">{error}</div>}

        {!joined ? (
          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground font-mono-game">Join voice to talk with others</p>
            <button onClick={joinVoice} className="w-full py-2.5 font-gaming text-sm bg-primary/10 border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-all">JOIN VOICE</button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {allParticipants.map((p) => (
                <div key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all ${p.speaking ? "bg-primary/10 border border-primary/40" : "bg-secondary/30"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-gaming ${p.speaking ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-mono-game flex-1 truncate">{p.name}</span>
                  {p.speaking && <div className="flex gap-0.5">{[1, 2, 3].map((i) => <div key={i} className="w-0.5 h-3 bg-primary rounded animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}</div>}
                  {p.muted && p.id === "local" && <MicOff size={10} className="text-destructive" />}
                  {isAdmin && p.id !== "local" && (
                    <button onClick={() => toggleMuteVoiceUser(p.name)} className="p-0.5 text-muted-foreground hover:text-accent" title={`Mute ${p.name}`}>
                      <Ban size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={toggleMute} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-gaming border transition-all ${muted ? "border-destructive text-destructive" : "border-primary text-primary"}`}>
                {muted ? <MicOff size={12} /> : <Mic size={12} />}
                {muted ? "UNMUTE" : "MUTE"}
              </button>
              <button onClick={leaveVoice} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-gaming border border-destructive text-destructive hover:bg-destructive hover:text-white transition-all">
                <PhoneOff size={12} /> LEAVE
              </button>
            </div>
          </>
        )}

        {mutedVoiceUsers.size > 0 && isAdmin && (
          <div className="text-[10px] font-mono-game text-muted-foreground">
            Muted in voice: {[...mutedVoiceUsers].join(", ")}
            <button onClick={() => { setMutedVoiceUsers(new Set()); localStorage.removeItem("neocosmic_muted_voice"); }} className="ml-2 text-primary">unmute all</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
