import { GoogleAdsClient } from "../clients/google-ads.client.js";
import { dateRange } from "../utils/date-range.js";
import { microsToUnit, withDerivedMetrics } from "../utils/metrics.js";

type PerformanceRow = {
  metrics: {
    cost_micros: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversions_value: number;
  };
};

export class PerformanceService {
  constructor(private readonly client: GoogleAdsClient) {}

  async getPerformanceSummary(customerId: string, range?: { startDate: string; endDate: string }) {
    const safeRange = range ?? dateRange(7);
    const rows = await this.client.query<PerformanceRow>(
      customerId,
      `SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value FROM customer WHERE segments.date BETWEEN '${safeRange.startDate}' AND '${safeRange.endDate}'`
    );
    const aggregated = rows.reduce(
      (acc, row) => {
        acc.costMicros += row.metrics.cost_micros ?? 0;
        acc.impressions += row.metrics.impressions ?? 0;
        acc.clicks += row.metrics.clicks ?? 0;
        acc.conversions += row.metrics.conversions ?? 0;
        acc.conversionValue += microsToUnit(row.metrics.conversions_value ?? 0);
        return acc;
      },
      { costMicros: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 }
    );

    return {
      range: safeRange,
      metrics: withDerivedMetrics(aggregated)
    };
  }

  async getSpendAnomaly(customerId: string, thresholdPercent: number) {
    const last7 = await this.getPerformanceSummary(customerId, dateRange(7));
    const last1 = await this.getPerformanceSummary(customerId, dateRange(1));
    const avgDaily = last7.metrics.cost / 7;
    const deltaPercent = avgDaily === 0 ? 0 : ((last1.metrics.cost - avgDaily) / avgDaily) * 100;
    const hasAnomaly = Math.abs(deltaPercent) >= thresholdPercent;

    return {
      hasAnomaly,
      deltaPercent,
      explanation: hasAnomaly
        ? `Spend moved ${deltaPercent.toFixed(2)}% vs 7-day baseline.`
        : "No material spend anomaly detected."
    };
  }
}
