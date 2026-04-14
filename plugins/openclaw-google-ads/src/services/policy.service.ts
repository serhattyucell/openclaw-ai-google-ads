import { GoogleAdsClient } from "../clients/google-ads.client.js";

type PolicyRow = {
  ad_group_ad: { ad?: { id?: string } };
  ad_group_ad_asset_view?: {
    policy_summary?: {
      approval_status?: string;
      policy_topic_entries?: Array<{ topic: string }>;
    };
  };
};

export class PolicyService {
  constructor(private readonly client: GoogleAdsClient) {}

  async getPolicyIssues(customerId: string) {
    const rows = await this.client.query<PolicyRow>(
      customerId,
      "SELECT ad_group_ad.ad.id, ad_group_ad_asset_view.policy_summary.approval_status, ad_group_ad_asset_view.policy_summary.policy_topic_entries FROM ad_group_ad_asset_view WHERE ad_group_ad_asset_view.policy_summary.approval_status != 'APPROVED' LIMIT 100"
    );
    return rows.map((r) => ({
      level: "ad",
      entityId: String(r.ad_group_ad.ad?.id ?? ""),
      entityType: "ad",
      reason: r.ad_group_ad_asset_view?.policy_summary?.policy_topic_entries?.[0]?.topic ?? "Policy issue"
    }));
  }
}
