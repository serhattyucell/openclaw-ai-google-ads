import { GoogleAdsClient } from "../clients/google-ads.client.js";

type BillingRow = {
  customer: { id: string };
  customer_client?: { descriptive_name: string };
};

export class BillingService {
  constructor(private readonly client: GoogleAdsClient) {}

  async getBillingStatus(customerId: string) {
    const rows = await this.client.query<BillingRow>(
      customerId,
      "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1"
    );
    const paymentStatus = rows.length > 0 ? "active" : "unknown";
    return {
      paymentStatus,
      issues: paymentStatus === "active" ? [] : ["Unable to validate billing profile from API."]
    };
  }
}
