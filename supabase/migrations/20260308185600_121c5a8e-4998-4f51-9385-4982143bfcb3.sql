
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friend requests" ON public.friend_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send friend requests" ON public.friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received requests" ON public.friend_requests FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete own requests" ON public.friend_requests FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'group',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat rooms" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated can create rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creator can delete rooms" ON public.chat_rooms FOR DELETE USING (auth.uid() = created_by);

-- Create chat_room_members table
CREATE TABLE public.chat_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room members" ON public.chat_room_members FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.chat_room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.chat_room_members FOR DELETE USING (auth.uid() = user_id);

-- Create room_messages table
CREATE TABLE public.room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room messages" ON public.room_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated can send messages" ON public.room_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Sender can delete own messages" ON public.room_messages FOR DELETE USING (auth.uid() = sender_id);

-- Insert the global chat room
INSERT INTO public.chat_rooms (name, type) VALUES ('Global Chat', 'global');

-- Enable realtime for messages and members
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
