import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvConfig } from "../src/config/env.js";
import { createGoogleAdsPlugin } from "../src/index.js";
import { PluginError } from "../src/errors/plugin-error.js";
import { TOOL_NAMES } from "../src/constants/tool-names.js";

type EnvField = {
  key: string;
  label: string;
  required: boolean;
  validate?: (value: string) => string | null;
  defaultValue?: string;
  secret?: boolean;
};

const customerIdValidator = (value: string): string | null => {
  if (!/^\d{10,20}$/.test(value)) {
    return "Sadece rakam olmali ve 10-20 hane olmali.";
  }
  return null;
};

const fields: EnvField[] = [
  { key: "GOOGLE_ADS_DEVELOPER_TOKEN", label: "Google Ads Developer Token", required: true, secret: true },
  { key: "GOOGLE_ADS_CLIENT_ID", label: "Google OAuth Client ID", required: true },
  { key: "GOOGLE_ADS_CLIENT_SECRET", label: "Google OAuth Client Secret", required: true, secret: true },
  { key: "GOOGLE_ADS_REFRESH_TOKEN", label: "Google OAuth Refresh Token", required: true, secret: true },
  {
    key: "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
    label: "Google Ads Login Customer ID (MCC)",
    required: true,
    validate: customerIdValidator
  },
  {
    key: "GOOGLE_ADS_MANAGER_CUSTOMER_ID",
    label: "Google Ads Manager Customer ID",
    required: true,
    validate: customerIdValidator
  },
  {
    key: "OPENCLAW_GOOGLE_ADS_MODE",
    label: "Plugin mode (read-only/action)",
    required: true,
    defaultValue: "read-only",
    validate: (value) => (value === "read-only" || value === "action" ? null : "Sadece read-only veya action girin.")
  },
  {
    key: "OPENCLAW_GOOGLE_ADS_ENABLE_ACTIONS",
    label: "Action toollari aktif olsun mu? (true/false)",
    required: true,
    defaultValue: "false",
    validate: (value) => (value === "true" || value === "false" ? null : "Sadece true veya false girin.")
  }
];

const envPath = resolve(process.cwd(), ".env");

const parseEnv = (raw: string): Record<string, string> => {
  const lines = raw.split("\n");
  const map: Record<string, string> = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    map[key] = value;
  }
  return map;
};

const masked = (value: string): string => {
  if (value.length <= 4) {
    return "****";
  }
  return `${"*".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
};

const run = async () => {
  const rl = createInterface({ input, output });
  try {
    const existing = existsSync(envPath) ? parseEnv(await readFile(envPath, "utf-8")) : {};
    const result: Record<string, string> = { ...existing };

    console.log("OpenClaw Google Ads plugin setup baslatildi.");
    console.log("Zorunlu alanlar sorulacak ve .env dosyasina yazilacak.\n");

    for (const field of fields) {
      while (true) {
        const current = result[field.key] ?? field.defaultValue ?? "";
        const preview = current ? ` [mevcut: ${field.secret ? masked(current) : current}]` : "";
        const answer = (
          await rl.question(`${field.label}${preview}: `)
        ).trim();
        const value = answer || current;

        if (!value && field.required) {
          console.log(`- ${field.key} zorunlu, bos birakilamaz.`);
          continue;
        }
        if (value && field.validate) {
          const validationError = field.validate(value);
          if (validationError) {
            console.log(`- ${validationError}`);
            continue;
          }
        }
        result[field.key] = value;
        break;
      }
    }

    const orderedOutput = fields.map((f) => `${f.key}=${result[f.key] ?? ""}`).join("\n");
    await writeFile(envPath, `${orderedOutput}\n`, "utf-8");
    console.log(`\nKurulum tamamlandi: ${envPath}`);
    console.log("Plugin register dogrulamasi baslatiliyor...");

    const previousEnv = { ...process.env };
    Object.assign(process.env, result);
    try {
      loadEnvConfig();
      const plugin = createGoogleAdsPlugin();
      console.log(`- Register OK. Tool sayisi: ${plugin.tools.length}`);
      try {
        await plugin.invokeTool(TOOL_NAMES.LIST_ACCOUNTS, {});
        console.log("- Smoke test OK: list_google_ads_accounts cagrildi.");
      } catch (error) {
        if (error instanceof PluginError) {
          console.log(`- Smoke test fail (${error.code}): ${error.message}`);
        } else {
          console.log(`- Smoke test fail: ${String(error)}`);
        }
        console.log("  Not: Bu adim network/auth durumuna bagli olarak fail olabilir.");
      }
    } finally {
      for (const key of Object.keys(process.env)) {
        if (!(key in previousEnv)) {
          delete process.env[key];
        }
      }
      Object.assign(process.env, previousEnv);
    }
  } finally {
    rl.close();
  }
};

run().catch((error) => {
  console.error("Setup basarisiz:", error);
  process.exitCode = 1;
});
