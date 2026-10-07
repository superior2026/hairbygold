import { supabase } from "@/integrations/supabase/client";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_MAX = 5 * 1024 * 1024;

export function validatePhoto(file: File): string | null {
  if (!PHOTO_TYPES.includes(file.type)) return "Use a JPG, PNG or WEBP photo.";
  if (file.size > PHOTO_MAX) return "Photos must be 5 MB or smaller.";
  return null;
}

/** Uploads a studio photo (owner only) and returns its storage path. */
export async function uploadStudioPhoto(file: File, folder: "products" | "services"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error("Upload failed — please try again.");
  return path;
}
