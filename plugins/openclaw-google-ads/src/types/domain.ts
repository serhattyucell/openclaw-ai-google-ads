export interface AccountRef {
  customerId: string;
  descriptiveName: string;
  currencyCode?: string;
  timeZone?: string;
  status?: string;
}

export interface PerformanceMetrics {
  costMicros: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
}

export interface HealthSummary {
  score: number;
  severity: "low" | "medium" | "high" | "critical";
  reasons: string[];
}
