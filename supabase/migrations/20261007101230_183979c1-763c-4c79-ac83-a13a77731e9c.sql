CREATE TABLE public.service_photos (
  service_id text PRIMARY KEY,
  image_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_photos TO authenticated;
GRANT ALL ON public.service_photos TO service_role;
ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view service photos" ON public.service_photos FOR SELECT USING (true);
CREATE POLICY "Owners manage service photos" ON public.service_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner')) WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE TRIGGER service_photos_updated_at BEFORE UPDATE ON public.service_photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();