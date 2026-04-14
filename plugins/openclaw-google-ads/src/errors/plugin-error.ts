export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 500,
    public readonly causeData?: unknown
  ) {
    super(message);
    this.name = "PluginError";
  }
}
