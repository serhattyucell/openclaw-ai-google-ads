import { config as dotenvConfig } from "dotenv";
import { z } from "zod";
import { type PluginMode, type PluginOptions } from "./plugin-options.js";
import { PluginError } from "../errors/plugin-error.js";

dotenvConfig();

const customerIdSchema = z
  .string()
  .min(10, "Customer ID en az 10 haneli olmalidir")
  .max(20, "Customer ID en fazla 20 haneli olmalidir")
  .regex(/^\d+$/, "Customer ID sadece rakam icermelidir");

const envSchema = z.object({
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().min(1, "GOOGLE_ADS_DEVELOPER_TOKEN zorunludur"),
  GOOGLE_ADS_CLIENT_ID: z.string().min(1, "GOOGLE_ADS_CLIENT_ID zorunludur"),
  GOOGLE_ADS_CLIENT_SECRET: z.string().min(1, "GOOGLE_ADS_CLIENT_SECRET zorunludur"),
  GOOGLE_ADS_REFRESH_TOKEN: z.string().min(1, "GOOGLE_ADS_REFRESH_TOKEN zorunludur"),
  GOOGLE_ADS_LOGIN_CUSTOMER_ID: customerIdSchema,
  GOOGLE_ADS_MANAGER_CUSTOMER_ID: customerIdSchema,
  OPENCLAW_GOOGLE_ADS_MODE: z.enum(["read-only", "action"]).optional(),
  OPENCLAW_GOOGLE_ADS_ENABLE_ACTIONS: z
    .string()
    .optional()
    .transform((v) => (v ? v.toLowerCase() === "true" : undefined))
});

export type EnvConfig = {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  loginCustomerId?: string;
  managerCustomerId: string;
  mode: PluginMode;
  enableActions: boolean;
};

export const loadEnvConfig = (options?: PluginOptions): EnvConfig => {
  const parsedResult = envSchema.safeParse(process.env);
  if (!parsedResult.success) {
    const messages = parsedResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" | ");
    throw new PluginError(
      `Google Ads plugin env dogrulamasi basarisiz. Lutfen 'npm run setup' ile zorunlu alanlari doldurun. Detay: ${messages}`,
      "INVALID_ENV_CONFIG",
      400,
      parsedResult.error.flatten()
    );
  }
  const parsed = parsedResult.data;
  const mode = options?.mode ?? parsed.OPENCLAW_GOOGLE_ADS_MODE ?? "read-only";
  const enableActions = options?.enableActions ?? parsed.OPENCLAW_GOOGLE_ADS_ENABLE_ACTIONS ?? false;

  return {
    developerToken: parsed.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: parsed.GOOGLE_ADS_CLIENT_ID,
    clientSecret: parsed.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: parsed.GOOGLE_ADS_REFRESH_TOKEN,
    loginCustomerId: parsed.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    managerCustomerId: parsed.GOOGLE_ADS_MANAGER_CUSTOMER_ID,
    mode,
    enableActions
  };
};
