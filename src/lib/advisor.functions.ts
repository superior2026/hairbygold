import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import type { Product } from "@/lib/mock-data";
import { services } from "@/lib/salon-data";

export type AdvisorResult =
  | {
      ok: true;
      summary: string;
      careTip: string;
      services: { name: string; reason: string }[];
      products: { product: Product; reason: string }[];
    }
  | { ok: false; error: string };

const input = z.object({
  goals: z.string().trim().min(5).max(800),
  hairType: z.string().trim().min(1).max(80),
  occasion: z.string().trim().min(1).max(120),
});

export const recommendForCustomer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }): Promise<AdvisorResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "Recommendations aren't set up yet." };

    const { listCatalog } = await import("@/lib/catalog.functions");
    const { runAdvisor, AdvisorError } = await import("@/lib/advisor.server");
    const catalog = (await listCatalog()) as Product[];
    const inStock = catalog.filter((p) => p.inStock !== false);

    const catalogText = inStock
      .map((p) => `- id=${p.id} | ${p.name} | ${p.category} | ${p.texture} | ${p.length} | $${p.price} | ${p.description}`)
      .join("\n");
    const serviceText = services.map((s) => `- ${s.name}: ${s.description}`).join("\n");

    const instructions = `You are the friendly in-studio stylist for Hair by Gold Beauty Hub & Spa.
Recommend ONLY from the services and products listed. Never invent items.
Pick 1-3 services (use the exact service name) and 1-4 products (use the exact product id).
Keep every reason to one warm, specific sentence. Summary: 2 sentences max. Care tip: 1 sentence.
Do not quote prices for services; say pricing is confirmed by the studio if relevant.

SERVICES:
${serviceText}

PRODUCTS IN STOCK:
${catalogText || "(none in stock right now)"}`;

    const prompt = `Hair goals: ${data.goals}\nHair type: ${data.hairType}\nOccasion: ${data.occasion}`;

    try {
      const rec = await runAdvisor({ request: getRequest(), apiKey, prompt, instructions });
      const byId = new Map(inStock.map((p) => [p.id, p]));
      const serviceNames = new Set(services.map((s) => s.name));
      return {
        ok: true,
        summary: rec.summary,
        careTip: rec.care_tip,
        services: rec.services.filter((s) => serviceNames.has(s.name)).slice(0, 3),
        products: rec.products
          .filter((p) => byId.has(p.id))
          .slice(0, 4)
          .map((p) => ({ product: byId.get(p.id)!, reason: p.reason })),
      };
    } catch (error) {
      if (error instanceof AdvisorError) return { ok: false, error: error.message };
      console.error("recommendForCustomer", error);
      return { ok: false, error: "Something went wrong. Please try again shortly." };
    }
  });
