export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 500,
    public readonly causeData?: unknown,
    public readonly category: "env" | "auth" | "api" | "register" | "invoke" | "internal" = "internal"
  ) {
    super(message);
    this.name = "PluginError";
  }
}
