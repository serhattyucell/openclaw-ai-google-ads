import { GoogleAdsClient } from "../clients/google-ads.client.js";
import { microsToUnit, withDerivedMetrics } from "../utils/metrics.js";

type CampaignRow = {
  campaign: {
    id: string;
    name: string;
    status: string;
    advertising_channel_type?: string;
    campaign_budget?: string;
    serving_status?: string;
  };
  campaign_budget?: { amount_micros: number };
  metrics?: {
    cost_micros: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversions_value: number;
  };
};

export class CampaignsService {
  constructor(private readonly client: GoogleAdsClient) {}

  async listCampaigns(customerId: string, status?: string) {
    const filter = status ? ` AND campaign.status = '${status}'` : "";
    const rows = await this.client.query<CampaignRow>(
      customerId,
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros FROM campaign WHERE campaign.id > 0${filter} ORDER BY campaign.name`
    );
    return rows.map((r) => ({
      id: r.campaign.id,
      name: r.campaign.name,
      status: r.campaign.status,
      advertisingChannelType: r.campaign.advertising_channel_type,
      budgetMicros: r.campaign_budget?.amount_micros
    }));
  }

  async getCampaignDetail(customerId: string, campaignId: string) {
    const rows = await this.client.query<CampaignRow>(
      customerId,
      `SELECT campaign.id, campaign.name, campaign.status, campaign.serving_status, campaign_budget.amount_micros, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value FROM campaign WHERE campaign.id = ${campaignId} AND segments.date DURING LAST_7_DAYS LIMIT 1`
    );
    const row = rows[0];
    const metrics = withDerivedMetrics({
      costMicros: row.metrics?.cost_micros ?? 0,
      impressions: row.metrics?.impressions ?? 0,
      clicks: row.metrics?.clicks ?? 0,
      conversions: row.metrics?.conversions ?? 0,
      conversionValue: microsToUnit(row.metrics?.conversions_value ?? 0)
    });

    return {
      campaign: {
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        servingStatus: row.campaign.serving_status,
        budgetMicros: row.campaign_budget?.amount_micros
      },
      metrics
    };
  }

  pauseCampaign(customerId: string, campaignId: string) {
    return this.client.mutateCampaignStatus(customerId, campaignId, "PAUSED");
  }

  enableCampaign(customerId: string, campaignId: string) {
    return this.client.mutateCampaignStatus(customerId, campaignId, "ENABLED");
  }

  updateCampaignBudget(customerId: string, campaignId: string, amountMicros: number) {
    return this.client.updateCampaignBudget(customerId, campaignId, amountMicros);
  }
}
