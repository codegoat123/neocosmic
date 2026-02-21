
-- Allow anyone to insert skins (admin panel is password-protected in frontend)
CREATE POLICY "Anyone can insert skins"
ON public.skins
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update skins (for download counter)
CREATE POLICY "Anyone can update skins"
ON public.skins
FOR UPDATE
USING (true);

-- Allow anyone to delete skins (admin only in frontend)
CREATE POLICY "Anyone can delete skins"
ON public.skins
FOR DELETE
USING (true);
