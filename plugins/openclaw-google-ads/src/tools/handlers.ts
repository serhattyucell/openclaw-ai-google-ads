import { z } from "zod";
import { PluginError } from "../errors/plugin-error.js";
import { AccountsService } from "../services/accounts.service.js";
import { AnalysisService } from "../services/analysis.service.js";
import { BillingService } from "../services/billing.service.js";
import { CampaignsService } from "../services/campaigns.service.js";
import { PerformanceService } from "../services/performance.service.js";
import { PolicyService } from "../services/policy.service.js";

export class ToolHandlers {
  constructor(
    private readonly options: { mode: "read-only" | "action"; enableActions: boolean; managerCustomerId: string },
    private readonly accounts: AccountsService,
    private readonly campaigns: CampaignsService,
    private readonly billing: BillingService,
    private readonly policy: PolicyService,
    private readonly performance: PerformanceService,
    private readonly analysis: AnalysisService
  ) {}

  private assertActionAllowed() {
    if (this.options.mode !== "action" || !this.options.enableActions) {
      throw new PluginError(
        "Action tool is disabled. Switch to action mode and enable actions in plugin config.",
        "ACTION_DISABLED",
        403
      );
    }
  }

  listGoogleAdsAccounts = async () => ({
    managerCustomerId: this.options.managerCustomerId,
    accounts: await this.accounts.listAccessibleAccounts()
  });

  getAccountOverview = async (input: { customerId: string }) => {
    const [health, perf, billing, policy] = await Promise.all([
      this.analysis.getAccountHealth(input.customerId),
      this.performance.getPerformanceSummary(input.customerId),
      this.billing.getBillingStatus(input.customerId),
      this.policy.getPolicyIssues(input.customerId)
    ]);

    return {
      account: { customerId: input.customerId, descriptiveName: input.customerId },
      servingStatus: health.severity === "critical" ? "LIMITED" : "SERVING",
      budgetStatus: perf.metrics.cost > 0 ? "ACTIVE" : "NO_SPEND",
      paymentStatus: billing.paymentStatus,
      policyIssueCount: policy.length,
      trend24h: "Use get_spend_anomalies for detailed 24h movement.",
      trend7d: `7-day cost ${perf.metrics.cost.toFixed(2)}, ROAS ${perf.metrics.roas.toFixed(2)}.`,
      metrics: {
        cost: perf.metrics.cost,
        impressions: perf.metrics.impressions,
        clicks: perf.metrics.clicks,
        conversions: perf.metrics.conversions,
        cpc: perf.metrics.cpc,
        cpa: perf.metrics.cpa,
        roas: perf.metrics.roas
      }
    };
  };

  getAccountHealth = async (input: { customerId: string }) => this.analysis.getAccountHealth(input.customerId);
  listCampaigns = async (input: { customerId: string; status?: string }) => ({
    customerId: input.customerId,
    campaigns: await this.campaigns.listCampaigns(input.customerId, input.status)
  });
  getCampaignDetail = async (input: { customerId: string; campaignId: string }) => ({
    customerId: input.customerId,
    ...(await this.campaigns.getCampaignDetail(input.customerId, input.campaignId))
  });
  getBillingStatus = async (input: { customerId: string }) => ({
    customerId: input.customerId,
    ...(await this.billing.getBillingStatus(input.customerId))
  });
  getPolicyIssues = async (input: { customerId: string }) => ({
    customerId: input.customerId,
    issues: await this.policy.getPolicyIssues(input.customerId)
  });
  getSpendAnomalies = async (input: { customerId: string; thresholdPercent?: number }) => ({
    customerId: input.customerId,
    ...(await this.performance.getSpendAnomaly(input.customerId, input.thresholdPercent ?? 30))
  });
  getPerformanceSummary = async (input: { customerId: string; range?: { startDate: string; endDate: string } }) => ({
    customerId: input.customerId,
    ...(await this.performance.getPerformanceSummary(input.customerId, input.range))
  });

  pauseCampaign = async (input: { customerId: string; campaignId: string }) => {
    this.assertActionAllowed();
    await this.campaigns.pauseCampaign(input.customerId, input.campaignId);
    return { ...input, status: "PAUSED", message: "Campaign paused." };
  };

  enableCampaign = async (input: { customerId: string; campaignId: string }) => {
    this.assertActionAllowed();
    await this.campaigns.enableCampaign(input.customerId, input.campaignId);
    return { ...input, status: "ENABLED", message: "Campaign enabled." };
  };

  updateCampaignBudget = async (input: { customerId: string; campaignId: string; amountMicros: number }) => {
    this.assertActionAllowed();
    await this.campaigns.updateCampaignBudget(input.customerId, input.campaignId, input.amountMicros);
    return { ...input, status: "UPDATED", message: `Campaign budget set to ${input.amountMicros} micros.` };
  };

  listDisapprovedAds = async (input: { customerId: string }) => ({
    customerId: input.customerId,
    issues: await this.policy.getPolicyIssues(input.customerId)
  });

  explainAccountStatus = async (input: { customerId: string }) => ({
    customerId: input.customerId,
    ...(await this.analysis.explainAccountStatus(input.customerId))
  });
}

export type AnyZodObject = z.ZodObject<Record<string, z.ZodTypeAny>>;
