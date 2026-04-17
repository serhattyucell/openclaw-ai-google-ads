import plugin from "../dist/index.js";
import { TOOL_NAMES } from "../dist/constants/tool-names.js";
import { PluginError } from "../dist/errors/plugin-error.js";

const classify = (error: unknown) => {
  if (error instanceof PluginError) {
    return {
      category: error.category,
      code: error.code,
      message: error.message
    };
  }
  return {
    category: "internal",
    code: "UNKNOWN_ERROR",
    message: String(error)
  };
};

const run = async () => {
  try {
    const instance = plugin();
    console.log(`[smoke] register ok, tools=${instance.tools.length}`);
    const result = await instance.invokeTool(TOOL_NAMES.LIST_ACCOUNTS, {});
    console.log("[smoke] list_google_ads_accounts ok");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    const normalized = classify(error);
    console.error(`[smoke] failed category=${normalized.category} code=${normalized.code}`);
    console.error(`[smoke] ${normalized.message}`);
    process.exitCode = 1;
  }
};

run();
