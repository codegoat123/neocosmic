import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, PhoneOff, Phone, Users } from "lucide-react";

interface VoiceCallProps {
  userId: string;
  username: string;
}

interface Participant {
  userId: string;
  username: string;
}

const VoiceCall = ({ userId, username }: VoiceCallProps) => {
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomName, setRoomName] = useState("general");
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<any>(null);

  const config: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const joinCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setInCall(true);

      const channel = supabase.channel(`voice-${roomName}`, {
        config: { presence: { key: userId } },
      });

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const others: Participant[] = [];
        Object.entries(state).forEach(([key, presences]) => {
          if (key !== userId) {
            const p = (presences as any)[0];
            others.push({ userId: key, username: p.username });
          }
        });
        setParticipants(others);
      });

      channel.on("presence", { event: "join" }, async ({ key, newPresences }) => {
        if (key === userId) return;
        // Create offer for new peer
        const pc = createPeerConnection(key, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channel.send({
          type: "broadcast",
          event: "signal",
          payload: { from: userId, to: key, type: "offer", sdp: offer.sdp },
        });
      });

      channel.on("presence", { event: "leave" }, ({ key }) => {
        const pc = peersRef.current.get(key);
        if (pc) {
          pc.close();
          peersRef.current.delete(key);
        }
      });

      channel.on("broadcast", { event: "signal" }, async ({ payload }) => {
        if (payload.to !== userId) return;

        if (payload.type === "offer") {
          const pc = createPeerConnection(payload.from, stream);
          await pc.setRemoteDescription({ type: "offer", sdp: payload.sdp });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: "broadcast",
            event: "signal",
            payload: { from: userId, to: payload.from, type: "answer", sdp: answer.sdp },
          });
        } else if (payload.type === "answer") {
          const pc = peersRef.current.get(payload.from);
          if (pc) await pc.setRemoteDescription({ type: "answer", sdp: payload.sdp });
        } else if (payload.type === "ice") {
          const pc = peersRef.current.get(payload.from);
          if (pc) await pc.addIceCandidate(payload.candidate);
        }
      });

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ username });
        }
      });

      channelRef.current = channel;
    } catch (err) {
      console.error("Failed to join voice call:", err);
      alert("Could not access microphone. Please allow microphone access.");
    }
  };

  const createPeerConnection = (peerId: string, localStream: MediaStream) => {
    const pc = new RTCPeerConnection(config);
    peersRef.current.set(peerId, pc);

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: { from: userId, to: peerId, type: "ice", candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = new Audio();
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audio.setAttribute("data-peer", peerId);
      document.body.appendChild(audio);
    };

    return pc;
  };

  const leaveCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    // Remove audio elements
    document.querySelectorAll("audio[data-peer]").forEach((el) => el.remove());
    setInCall(false);
    setParticipants([]);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = muted));
      setMuted(!muted);
    }
  };

  useEffect(() => {
    return () => {
      if (inCall) leaveCall();
    };
  }, []);

  return (
    <div className="neon-card rounded-xl p-4 space-y-4">
      <h3 className="font-gaming text-sm text-primary flex items-center gap-2">
        <Mic size={16} /> VOICE CALL
      </h3>

      {!inCall ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="Room name..."
              className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-xs font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={joinCall}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-gaming text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all"
          >
            <Phone size={14} /> JOIN VOICE ROOM
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-gaming text-accent">🔊 {roomName}</span>
            <span className="text-[10px] text-muted-foreground font-mono-game flex items-center gap-1">
              <Users size={10} /> {participants.length + 1} in call
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono-game text-foreground">{username} (you)</span>
              {muted && <MicOff size={10} className="text-destructive" />}
            </div>
            {participants.map((p) => (
              <div key={p.userId} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono-game text-foreground">{p.username}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className={`flex-1 py-2.5 rounded-lg font-gaming text-[10px] flex items-center justify-center gap-1.5 ${
                muted ? "bg-destructive/20 text-destructive border border-destructive/30" : "bg-secondary text-foreground border border-border"
              }`}
            >
              {muted ? <MicOff size={12} /> : <Mic size={12} />}
              {muted ? "UNMUTE" : "MUTE"}
            </button>
            <button
              onClick={leaveCall}
              className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-gaming text-[10px] flex items-center justify-center gap-1.5"
            >
              <PhoneOff size={12} /> LEAVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCall;
