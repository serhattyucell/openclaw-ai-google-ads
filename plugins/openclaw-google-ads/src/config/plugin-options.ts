export type PluginMode = "read-only" | "action";

export interface PluginOptions {
  mode?: PluginMode;
  enableActions?: boolean;
}
