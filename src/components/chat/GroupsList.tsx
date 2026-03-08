import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Users, LogIn, LogOut } from "lucide-react";

interface GroupsListProps {
  userId: string;
  username: string;
  onOpenRoom: (room: { id: string; name: string; type: string }) => void;
}

const GroupsList = ({ userId, username, onOpenRoom }: GroupsListProps) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("chat_rooms")
      .select("*, chat_room_members(user_id)")
      .eq("type", "group")
      .order("created_at", { ascending: false });

    setGroups(data || []);

    const { data: memberships } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", userId);

    setMyMemberships(new Set((memberships || []).map((m) => m.room_id)));
  };

  useEffect(() => { loadGroups(); }, [userId]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    const { data } = await supabase
      .from("chat_rooms")
      .insert({ name: newGroupName.trim(), type: "group", created_by: userId })
      .select()
      .single();

    if (data) {
      await supabase.from("chat_room_members").insert({ room_id: data.id, user_id: userId });
      setNewGroupName("");
      setShowCreate(false);
      loadGroups();
    }
  };

  const joinGroup = async (roomId: string) => {
    await supabase.from("chat_room_members").insert({ room_id: roomId, user_id: userId });
    loadGroups();
  };

  const leaveGroup = async (roomId: string) => {
    await supabase.from("chat_room_members").delete().eq("room_id", roomId).eq("user_id", userId);
    loadGroups();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-gaming text-sm text-primary">GROUP CHATS</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-gaming text-[10px]"
        >
          <Plus size={12} /> CREATE
        </button>
      </div>

      {showCreate && (
        <div className="neon-card rounded-xl p-4 flex gap-2">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createGroup()}
            placeholder="Group name..."
            className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-xs font-mono-game text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button onClick={createGroup} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-gaming text-[10px]">
            CREATE
          </button>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => {
          const isMember = myMemberships.has(group.id);
          const memberCount = group.chat_room_members?.length || 0;
          return (
            <div key={group.id} className="neon-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                <div>
                  <span className="text-xs font-gaming text-foreground">{group.name}</span>
                  <span className="text-[9px] text-muted-foreground font-mono-game ml-2">{memberCount} members</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {isMember && (
                  <button
                    onClick={() => onOpenRoom({ id: group.id, name: group.name, type: "group" })}
                    className="px-2.5 py-1.5 bg-primary/20 text-primary rounded-lg font-gaming text-[9px] hover:bg-primary/30"
                  >
                    OPEN
                  </button>
                )}
                {isMember ? (
                  <button
                    onClick={() => leaveGroup(group.id)}
                    className="p-1.5 bg-destructive/20 text-destructive rounded hover:bg-destructive/30"
                  >
                    <LogOut size={10} />
                  </button>
                ) : (
                  <button
                    onClick={() => joinGroup(group.id)}
                    className="px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg font-gaming text-[9px]"
                  >
                    <LogIn size={10} className="inline mr-1" />JOIN
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {groups.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono-game text-center py-8">No groups yet. Create one!</p>
        )}
      </div>
    </div>
  );
};

export default GroupsList;
