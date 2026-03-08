import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, Check, X, MessageSquare } from "lucide-react";

interface FriendsListProps {
  userId: string;
  username: string;
  onOpenChat: (room: { id: string; name: string; type: string }) => void;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  sender?: { username: string };
  receiver?: { username: string };
}

const FriendsList = ({ userId, username, onOpenChat }: FriendsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendRequest[]>([]);

  const loadFriends = async () => {
    // Accepted friends where I'm sender
    const { data: sent } = await supabase
      .from("friend_requests")
      .select("*, receiver:receiver_id(username)")
      .eq("sender_id", userId)
      .eq("status", "accepted");

    // Accepted friends where I'm receiver
    const { data: received } = await supabase
      .from("friend_requests")
      .select("*, sender:sender_id(username)")
      .eq("receiver_id", userId)
      .eq("status", "accepted");

    setFriends([...(sent || []), ...(received || [])] as any);

    // Pending received
    const { data: pr } = await supabase
      .from("friend_requests")
      .select("*, sender:sender_id(username)")
      .eq("receiver_id", userId)
      .eq("status", "pending");
    setPendingReceived((pr || []) as any);

    // Pending sent
    const { data: ps } = await supabase
      .from("friend_requests")
      .select("*, receiver:receiver_id(username)")
      .eq("sender_id", userId)
      .eq("status", "pending");
    setPendingSent((ps || []) as any);
  };

  useEffect(() => { loadFriends(); }, [userId]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", `%${searchQuery.trim()}%`)
      .neq("id", userId)
      .limit(10);
    setSearchResults(data || []);
  };

  const sendRequest = async (receiverId: string) => {
    await supabase.from("friend_requests").insert({
      sender_id: userId,
      receiver_id: receiverId,
    });
    setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
    loadFriends();
  };

  const respondRequest = async (requestId: string, status: "accepted" | "denied") => {
    await supabase.from("friend_requests").update({ status }).eq("id", requestId);
    loadFriends();
  };

  const openPrivateChat = async (friendId: string, friendName: string) => {
    // Check if private room exists
    const { data: myRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", userId);

    const { data: theirRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", friendId);

    const myRoomIds = (myRooms || []).map((r) => r.room_id);
    const theirRoomIds = (theirRooms || []).map((r) => r.room_id);
    const commonRoomIds = myRoomIds.filter((id) => theirRoomIds.includes(id));

    if (commonRoomIds.length > 0) {
      const { data: privateRoom } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", commonRoomIds)
        .eq("type", "private")
        .single();

      if (privateRoom) {
        onOpenChat({ id: privateRoom.id, name: friendName, type: "private" });
        return;
      }
    }

    // Create new private room
    const { data: newRoom } = await supabase
      .from("chat_rooms")
      .insert({ name: `${username} & ${friendName}`, type: "private", created_by: userId })
      .select()
      .single();

    if (newRoom) {
      await supabase.from("chat_room_members").insert([
        { room_id: newRoom.id, user_id: userId },
        { room_id: newRoom.id, user_id: friendId },
      ]);
      onOpenChat({ id: newRoom.id, name: friendName, type: "private" });
    }
  };

  const getFriendInfo = (fr: FriendRequest) => {
    if (fr.sender_id === userId) {
      return { id: fr.receiver_id, name: (fr as any).receiver?.username || "Unknown" };
    }
    return { id: fr.sender_id, name: (fr as any).sender?.username || "Unknown" };
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="neon-card rounded-xl p-4">
        <h3 className="font-gaming text-xs text-primary mb-3">🔍 FIND USERS</h3>
        <div className="flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            placeholder="Search by username..."
            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-xs font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button onClick={searchUsers} className="p-2 bg-primary text-primary-foreground rounded-lg">
            <Search size={14} />
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg">
                <span className="text-xs font-mono-game text-foreground">{user.username}</span>
                <button onClick={() => sendRequest(user.id)} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30">
                  <UserPlus size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingReceived.length > 0 && (
        <div className="neon-card rounded-xl p-4">
          <h3 className="font-gaming text-xs text-accent mb-3">📨 FRIEND REQUESTS ({pendingReceived.length})</h3>
          <div className="space-y-2">
            {pendingReceived.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg">
                <span className="text-xs font-mono-game text-foreground">{(req as any).sender?.username}</span>
                <div className="flex gap-1">
                  <button onClick={() => respondRequest(req.id, "accepted")} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30">
                    <Check size={12} />
                  </button>
                  <button onClick={() => respondRequest(req.id, "denied")} className="p-1.5 bg-destructive/20 text-destructive rounded hover:bg-destructive/30">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent requests */}
      {pendingSent.length > 0 && (
        <div className="neon-card rounded-xl p-4">
          <h3 className="font-gaming text-xs text-muted-foreground mb-3">⏳ SENT REQUESTS</h3>
          <div className="space-y-2">
            {pendingSent.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg">
                <span className="text-xs font-mono-game text-muted-foreground">{(req as any).receiver?.username} — pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      <div className="neon-card rounded-xl p-4">
        <h3 className="font-gaming text-xs text-primary mb-3">👥 FRIENDS ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono-game">No friends yet. Search and add some!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((fr) => {
              const info = getFriendInfo(fr);
              return (
                <div key={fr.id} className="flex items-center justify-between px-3 py-2 bg-secondary rounded-lg">
                  <span className="text-xs font-mono-game text-foreground">{info.name}</span>
                  <button onClick={() => openPrivateChat(info.id, info.name)} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30">
                    <MessageSquare size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
