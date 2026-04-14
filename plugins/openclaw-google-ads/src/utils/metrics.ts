import { type PerformanceMetrics } from "../types/domain.js";

export const safeDivide = (num: number, den: number): number => (den === 0 ? 0 : num / den);

export const microsToUnit = (micros: number): number => micros / 1_000_000;

export const withDerivedMetrics = (metrics: PerformanceMetrics) => {
  const cost = microsToUnit(metrics.costMicros);
  const cpc = safeDivide(cost, metrics.clicks);
  const cpa = safeDivide(cost, metrics.conversions);
  const roas = safeDivide(metrics.conversionValue, cost);
  const ctr = safeDivide(metrics.clicks, metrics.impressions);

  return { ...metrics, cost, cpc, cpa, roas, ctr };
};
