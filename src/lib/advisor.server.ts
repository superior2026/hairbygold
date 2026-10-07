import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID_HEADER)) headers.set(RUN_ID_HEADER, runId);
    const response = await fetch(input, { ...init, headers });
    runId ??= response.headers.get(RUN_ID_HEADER)?.trim() || undefined;
    return response;
  };
}

export const recommendationSchema = z.object({
  summary: z.string(),
  services: z.array(z.object({ name: z.string(), reason: z.string() })),
  products: z.array(z.object({ id: z.string(), reason: z.string() })),
  care_tip: z.string(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

export class AdvisorError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function runAdvisor(opts: {
  request: Request;
  apiKey: string;
  prompt: string;
  instructions: string;
}): Promise<Recommendation> {
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: opts.apiKey,
    headers: { "Lovable-API-Key": opts.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: createRunIdFetch(opts.request.headers.get(RUN_ID_HEADER) ?? undefined),
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: opts.instructions,
    messages: [{ role: "user", content: opts.prompt }],
    output: Output.object({ schema: recommendationSchema }),
    abortSignal: opts.request.signal,
    maxRetries: 0,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    return await result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new AdvisorError("The stylist couldn't put together a recommendation. Please try again.", 502);
    }
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    if (status === 402) throw new AdvisorError("AI recommendations are paused right now — please try again later.", 402);
    if (status === 429) throw new AdvisorError("Lots of requests right now — please wait a moment and try again.", 429);
    if (status === 403) throw new AdvisorError("Recommendations are unavailable at the moment.", 403);
    console.error("advisor", error);
    throw new AdvisorError("Something went wrong. Please try again shortly.", status);
  }
}
