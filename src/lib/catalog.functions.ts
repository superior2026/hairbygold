import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "@/lib/mock-data";
import { productImage } from "@/lib/product-images";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public catalogue as managed in the owner dashboard. */
export const listCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, category, length, texture, description, in_stock, image_key, image_url, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listCatalog", error.message);
    return [];
  }
  const rows = data ?? [];
  const paths = rows.map((r) => r.image_url).filter((p): p is string => Boolean(p));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: urls } = await supabase.storage
      .from("product-images")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    for (const u of urls ?? []) if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: Number(r.price),
    category: r.category,
    length: r.length,
    texture: r.texture,
    description: r.description,
    inStock: r.in_stock,
    rating: 4.8,
    reviews: 0,
    image: (r.image_url && signed.get(r.image_url)) || productImage(r.image_key),
  }));
});
