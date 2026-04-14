import { GoogleAdsApi, type Customer } from "google-ads-api";
import { type EnvConfig } from "../config/env.js";
import { GoogleAdsApiError } from "../errors/google-ads-api-error.js";

export class GoogleAdsClient {
  private readonly api: GoogleAdsApi;

  constructor(private readonly env: EnvConfig) {
    this.api = new GoogleAdsApi({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      developer_token: env.developerToken
    });
  }

  customer(customerId: string): Customer {
    return this.api.Customer({
      customer_id: customerId,
      refresh_token: this.env.refreshToken,
      login_customer_id: this.env.loginCustomerId
    });
  }

  async query<T>(customerId: string, gaql: string): Promise<T[]> {
    try {
      const c = this.customer(customerId);
      const rows = await c.query(gaql);
      return rows as T[];
    } catch (error) {
      throw new GoogleAdsApiError(`GAQL query failed for customer ${customerId}`, error);
    }
  }

  async mutateCampaignStatus(customerId: string, campaignId: string, status: "PAUSED" | "ENABLED"): Promise<void> {
    try {
      const c = this.customer(customerId);
      await c.campaigns.update([{ resource_name: `customers/${customerId}/campaigns/${campaignId}`, status }]);
    } catch (error) {
      throw new GoogleAdsApiError(`Failed to set campaign status to ${status}`, error);
    }
  }

  async updateCampaignBudget(customerId: string, campaignId: string, amountMicros: number): Promise<void> {
    try {
      const c = this.customer(customerId);
      const campaignRows = await this.query<{ campaign: { campaign_budget: string } }>(
        customerId,
        `SELECT campaign.campaign_budget FROM campaign WHERE campaign.id = ${campaignId} LIMIT 1`
      );
      const budgetResourceName = campaignRows[0]?.campaign?.campaign_budget;
      if (!budgetResourceName) {
        throw new GoogleAdsApiError(`Campaign ${campaignId} does not have a budget resource`);
      }
      await c.campaignBudgets.update([{ resource_name: budgetResourceName, amount_micros: amountMicros }]);
    } catch (error) {
      if (error instanceof GoogleAdsApiError) {
        throw error;
      }
      throw new GoogleAdsApiError(`Failed to update campaign budget`, error);
    }
  }
}
