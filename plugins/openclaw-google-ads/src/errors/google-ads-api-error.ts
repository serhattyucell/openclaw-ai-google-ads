import { PluginError } from "./plugin-error.js";

export class GoogleAdsApiError extends PluginError {
  constructor(
    message: string,
    causeData?: unknown,
    category: "auth" | "api" = "api",
    code = category === "auth" ? "GOOGLE_ADS_AUTH_ERROR" : "GOOGLE_ADS_API_ERROR"
  ) {
    super(message, code, category === "auth" ? 401 : 502, causeData, category);
    this.name = "GoogleAdsApiError";
  }
}
