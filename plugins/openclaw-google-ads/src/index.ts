import { z } from "zod";
import { loadEnvConfig } from "./config/env.js";
import { type PluginOptions } from "./config/plugin-options.js";
import { GoogleAdsClient } from "./clients/google-ads.client.js";
import { AccountsService } from "./services/accounts.service.js";
import { BillingService } from "./services/billing.service.js";
import { CampaignsService } from "./services/campaigns.service.js";
import { PolicyService } from "./services/policy.service.js";
import { PerformanceService } from "./services/performance.service.js";
import { AnalysisService } from "./services/analysis.service.js";
import { ToolHandlers } from "./tools/handlers.js";
import { buildToolRegistry } from "./tools/registry.js";
import { pluginManifest } from "./manifest.js";
import { PluginError } from "./errors/plugin-error.js";
import { type OpenClawPlugin } from "./types/tool.js";

export const createGoogleAdsPlugin = (options?: PluginOptions): OpenClawPlugin & {
  invokeTool: (toolName: string, input: unknown) => Promise<unknown>;
} => {
  const env = loadEnvConfig(options);
  const mergedOptions = {
    mode: env.mode,
    enableActions: env.enableActions,
    managerCustomerId: env.managerCustomerId
  };

  const client = new GoogleAdsClient(env);
  const accounts = new AccountsService(client, env.managerCustomerId);
  const campaigns = new CampaignsService(client);
  const billing = new BillingService(client);
  const policy = new PolicyService(client);
  const performance = new PerformanceService(client);
  const analysis = new AnalysisService(billing, policy, performance);
  const handlers = new ToolHandlers(mergedOptions, accounts, campaigns, billing, policy, performance, analysis);
  const tools = buildToolRegistry(handlers);

  return {
    manifest: pluginManifest,
    tools,
    invokeTool: async (toolName: string, input: unknown) => {
      const tool = tools.find((t) => t.name === toolName);
      if (!tool) {
        throw new PluginError(`Unknown tool: ${toolName}`, "TOOL_NOT_FOUND", 404);
      }
      const parsedInput = tool.inputSchema.parse(input);
      const rawOutput = await tool.execute(parsedInput as never);
      return tool.outputSchema.parse(rawOutput);
    }
  };
};

export const register = () => createGoogleAdsPlugin();

export type { OpenClawPlugin } from "./types/tool.js";
export { PluginError } from "./errors/plugin-error.js";
export { TOOL_NAMES } from "./constants/tool-names.js";
export const schemas = { z };
