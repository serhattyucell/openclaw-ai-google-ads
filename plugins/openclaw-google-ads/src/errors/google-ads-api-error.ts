import { PluginError } from "./plugin-error.js";

export class GoogleAdsApiError extends PluginError {
  constructor(message: string, causeData?: unknown) {
    super(message, "GOOGLE_ADS_API_ERROR", 502, causeData);
    this.name = "GoogleAdsApiError";
  }
}
