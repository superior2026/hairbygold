ALTER TABLE public.products ADD COLUMN image_url text;

CREATE POLICY "Anyone can view product photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Owners can upload product photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owners can update product photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owners can delete product photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'owner'));