import { z, type ZodTypeAny } from "zod";

export interface OpenClawToolContext {
  requestId?: string;
  actor?: string;
}

export interface OpenClawToolDefinition<TInput extends ZodTypeAny, TOutput extends ZodTypeAny> {
  name: string;
  description: string;
  mode: "read" | "action";
  inputSchema: TInput;
  outputSchema: TOutput;
  execute: (input: z.infer<TInput>, context?: OpenClawToolContext) => Promise<z.infer<TOutput>>;
}

export interface OpenClawPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
}

export interface OpenClawPlugin {
  manifest: OpenClawPluginManifest;
  tools: OpenClawToolDefinition<ZodTypeAny, ZodTypeAny>[];
}
