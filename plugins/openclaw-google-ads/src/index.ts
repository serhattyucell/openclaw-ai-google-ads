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
import { logger } from "./utils/logger.js";
import { LEGACY_PLUGIN_IDS, PLUGIN_ID } from "./constants/plugin.js";

const assertPluginIdentity = () => {
  const runtimeId = process.env.OPENCLAW_PLUGIN_ID;
  if (!runtimeId) {
    return;
  }
  if (LEGACY_PLUGIN_IDS.includes(runtimeId as (typeof LEGACY_PLUGIN_IDS)[number])) {
    throw new PluginError(
      `Legacy plugin id '${runtimeId}' desteklenmiyor. Lutfen sadece '${PLUGIN_ID}' kullanin.`,
      "LEGACY_PLUGIN_ID_NOT_SUPPORTED",
      400,
      { runtimeId, expected: PLUGIN_ID },
      "register"
    );
  }
  if (runtimeId !== PLUGIN_ID) {
    throw new PluginError(
      `Gecersiz plugin id '${runtimeId}'. Beklenen id: '${PLUGIN_ID}'.`,
      "INVALID_PLUGIN_ID",
      400,
      { runtimeId, expected: PLUGIN_ID },
      "register"
    );
  }
};

export const createGoogleAdsPlugin = (options?: PluginOptions): OpenClawPlugin & {
  invokeTool: (toolName: string, input: unknown) => Promise<unknown>;
} => {
  logger.info("register started", { pluginId: PLUGIN_ID });
  assertPluginIdentity();
  const env = loadEnvConfig(options);
  logger.info("env loaded", {
    mode: env.mode,
    enableActions: env.enableActions,
    managerCustomerId: env.managerCustomerId
  });
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
  logger.info("register completed", { tools: tools.length, pluginId: pluginManifest.id });

  return {
    manifest: pluginManifest,
    tools,
    invokeTool: async (toolName: string, input: unknown) => {
      const tool = tools.find((t) => t.name === toolName);
      if (!tool) {
        throw new PluginError(`Unknown tool: ${toolName}`, "TOOL_NOT_FOUND", 404, undefined, "invoke");
      }
      try {
        const parsedInput = tool.inputSchema.parse(input);
        const rawOutput = await tool.execute(parsedInput as never);
        return tool.outputSchema.parse(rawOutput);
      } catch (error) {
        if (error instanceof PluginError) {
          throw error;
        }
        if (error instanceof z.ZodError) {
          throw new PluginError(
            `Tool input/output validation failed for ${toolName}: ${error.issues.map((i) => i.message).join(", ")}`,
            "TOOL_SCHEMA_VALIDATION_ERROR",
            400,
            error.flatten(),
            "invoke"
          );
        }
        throw new PluginError(
          `Tool invocation failed for ${toolName}.`,
          "TOOL_INVOCATION_ERROR",
          500,
          error,
          "invoke"
        );
      }
    }
  };
};

export const register = () => createGoogleAdsPlugin();
const defaultExport = register;
export default defaultExport;

export type { OpenClawPlugin } from "./types/tool.js";
export { PluginError } from "./errors/plugin-error.js";
export { TOOL_NAMES } from "./constants/tool-names.js";
export { PLUGIN_ID } from "./constants/plugin.js";
export const schemas = { z };
