
-- Create skins storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('skins', 'skins', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to skins bucket
CREATE POLICY "Anyone can upload skins"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'skins');

-- Allow public reads from skins bucket
CREATE POLICY "Anyone can view skins files"
ON storage.objects FOR SELECT
USING (bucket_id = 'skins');
