import { type AccountRef } from "../types/domain.js";
import { GoogleAdsClient } from "../clients/google-ads.client.js";

type AccountRow = {
  customer_client: {
    id: string;
    descriptive_name: string;
    currency_code?: string;
    time_zone?: string;
    status?: string;
    manager?: boolean;
  };
};

export class AccountsService {
  constructor(
    private readonly client: GoogleAdsClient,
    private readonly managerCustomerId: string
  ) {}

  async listAccessibleAccounts(): Promise<AccountRef[]> {
    const rows = await this.client.query<AccountRow>(
      this.managerCustomerId,
      "SELECT customer_client.id, customer_client.descriptive_name, customer_client.currency_code, customer_client.time_zone, customer_client.status, customer_client.manager FROM customer_client WHERE customer_client.level <= 1"
    );

    return rows
      .filter((r) => !r.customer_client.manager)
      .map((r) => ({
        customerId: r.customer_client.id,
        descriptiveName: r.customer_client.descriptive_name,
        currencyCode: r.customer_client.currency_code,
        timeZone: r.customer_client.time_zone,
        status: r.customer_client.status
      }));
  }
}
