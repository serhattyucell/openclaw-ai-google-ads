import { type AccountRef } from "../types/domain.js";
import { GoogleAdsClient } from "../clients/google-ads.client.js";

type AccountRow = {
  customer_client: {
    id: string | number;
    descriptive_name?: string;
    currency_code?: string | number;
    time_zone?: string | number;
    status?: string | number;
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
        customerId: String(r.customer_client.id),
        descriptiveName: r.customer_client.descriptive_name ?? "",
        currencyCode: r.customer_client.currency_code ? String(r.customer_client.currency_code) : undefined,
        timeZone: r.customer_client.time_zone ? String(r.customer_client.time_zone) : undefined,
        status: r.customer_client.status ? String(r.customer_client.status) : undefined
      }));
  }
}
