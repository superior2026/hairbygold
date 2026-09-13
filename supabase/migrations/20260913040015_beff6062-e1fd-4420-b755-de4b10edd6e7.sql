CREATE TYPE public.app_role AS ENUM ('owner');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Lace Front Wigs',
  length text NOT NULL DEFAULT '—',
  texture text NOT NULL DEFAULT '—',
  description text NOT NULL DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  image_key text NOT NULL DEFAULT 'product-1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Owners can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  contact text NOT NULL DEFAULT '',
  access_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_for_owner boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view conversations" ON public.conversations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owners can update conversations" ON public.conversations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender text NOT NULL DEFAULT 'customer',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view messages" ON public.messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owners can send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  customer_name text NOT NULL,
  contact text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Owners can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (name, price, category, length, texture, description, in_stock, image_key) VALUES
('Aurelia Straight Lace Front', 420, 'Lace Front Wigs', '24"', 'Straight', 'A glass-smooth virgin straight unit on a transparent HD lace front, pre-plucked with a natural density hairline.', true, 'product-1'),
('Honeycomb Curly Glueless', 385, 'Lace Front Wigs', '20"', 'Curly', 'Sun-kissed honey blonde curls with a glueless adjustable band — wear it out of the box in under five minutes.', true, 'product-2'),
('Golden Hour Deep Wave Bundles', 265, 'Bundles', '22"', 'Deep Wave', 'Three bundles of double-drawn deep wave hair, cuticle aligned and tied in our signature gold ribbon.', true, 'product-3'),
('Ritual Hair Elixir & Silk Set', 96, 'Hair Care', '—', '—', 'A featherweight shine oil paired with a mulberry silk bonnet to protect your investment overnight.', true, 'product-4'),
('Noir Body Wave Closure', 340, 'Closure Wigs', '18"', 'Body Wave', 'A 5x5 closure unit with soft, brushed-out body wave movement and a bleached-knot parting.', true, 'product-1'),
('Sable Kinky Straight Unit', 455, 'Lace Front Wigs', '28"', 'Kinky', 'Blown-out kinky straight texture that blends seamlessly with relaxed and heat-styled natural hair.', true, 'product-2'),
('Champagne Silk Press Bundles', 210, 'Bundles', '16"', 'Straight', 'Lightweight single-donor bundles finished with a salon silk press for an immediate glossy drop.', true, 'product-3'),
('Gilded Wig Grip Band', 34, 'Accessories', '—', '—', 'A velvet-lined grip band that keeps glueless units secure all day without tension on your edges.', true, 'product-4');