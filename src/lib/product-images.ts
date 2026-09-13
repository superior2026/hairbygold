import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export const imageKeys = ["product-1", "product-2", "product-3", "product-4"] as const;

const map: Record<string, string> = {
  "product-1": p1,
  "product-2": p2,
  "product-3": p3,
  "product-4": p4,
};

export function productImage(key: string | null | undefined): string {
  return map[key ?? "product-1"] ?? p1;
}
