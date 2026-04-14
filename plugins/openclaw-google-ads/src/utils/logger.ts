export const logger = {
  info: (message: string, data?: unknown) => {
    console.info(`[openclaw-google-ads] ${message}`, data ?? "");
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[openclaw-google-ads] ${message}`, data ?? "");
  },
  error: (message: string, data?: unknown) => {
    console.error(`[openclaw-google-ads] ${message}`, data ?? "");
  }
};
