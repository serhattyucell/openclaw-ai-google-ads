import { BillingService } from "./billing.service.js";
import { PerformanceService } from "./performance.service.js";
import { PolicyService } from "./policy.service.js";
import { type HealthSummary } from "../types/domain.js";

export class AnalysisService {
  constructor(
    private readonly billingService: BillingService,
    private readonly policyService: PolicyService,
    private readonly performanceService: PerformanceService
  ) {}

  async getAccountHealth(customerId: string): Promise<HealthSummary> {
    const [billing, policyIssues, perf] = await Promise.all([
      this.billingService.getBillingStatus(customerId),
      this.policyService.getPolicyIssues(customerId),
      this.performanceService.getPerformanceSummary(customerId)
    ]);

    let score = 100;
    const reasons: string[] = [];
    if (billing.issues.length > 0) {
      score -= 30;
      reasons.push("Billing needs attention.");
    }
    if (policyIssues.length > 0) {
      score -= Math.min(35, policyIssues.length * 5);
      reasons.push(`${policyIssues.length} policy issue(s) detected.`);
    }
    if (perf.metrics.clicks === 0 && perf.metrics.impressions > 0) {
      score -= 20;
      reasons.push("No clicks despite impressions.");
    }
    if (perf.metrics.cost > 0 && perf.metrics.conversions === 0) {
      score -= 15;
      reasons.push("Spend exists but no conversions.");
    }

    const safeScore = Math.max(0, score);
    const severity: HealthSummary["severity"] =
      safeScore >= 80 ? "low" : safeScore >= 60 ? "medium" : safeScore >= 40 ? "high" : "critical";
    return { score: safeScore, severity, reasons };
  }

  async explainAccountStatus(customerId: string) {
    const [health, anomaly, policy] = await Promise.all([
      this.getAccountHealth(customerId),
      this.performanceService.getSpendAnomaly(customerId, 30),
      this.policyService.getPolicyIssues(customerId)
    ]);

    const topRisks = [...health.reasons];
    if (anomaly.hasAnomaly) {
      topRisks.push(anomaly.explanation);
    }
    if (topRisks.length === 0) {
      topRisks.push("No critical risk found.");
    }

    return {
      summary: `Account health score ${health.score}/100 (${health.severity}).`,
      topRisks,
      recommendedActions: [
        "Review campaigns with sudden spend change.",
        "Inspect disapproved ads and policy topics.",
        "Check payment profile if serving becomes limited."
      ]
    };
  }
}
