import { z } from "zod";
import { TOOL_NAMES } from "../constants/tool-names.js";
import { type OpenClawToolDefinition } from "../types/tool.js";
import {
  accountHealthOutputSchema,
  accountInputSchema,
  accountOverviewOutputSchema,
  actionResultSchema,
  billingOutputSchema,
  campaignDetailInputSchema,
  campaignDetailOutputSchema,
  explainStatusOutputSchema,
  listAccountsInputSchema,
  listAccountsOutputSchema,
  listCampaignsInputSchema,
  listCampaignsOutputSchema,
  performanceInputSchema,
  performanceOutputSchema,
  policyOutputSchema,
  spendAnomalyInputSchema,
  spendAnomalyOutputSchema,
  updateCampaignBudgetInputSchema
} from "../validators/tool-schemas.js";
import { ToolHandlers } from "./handlers.js";

type ToolDef = OpenClawToolDefinition<z.ZodTypeAny, z.ZodTypeAny>;

export const buildToolRegistry = (h: ToolHandlers): ToolDef[] => [
  {
    name: TOOL_NAMES.LIST_ACCOUNTS,
    description: "MCC altindaki Google Ads hesaplarini listeler. 'sorunlu hesaplari goster' isteginde ilk adimdir.",
    mode: "read",
    inputSchema: listAccountsInputSchema,
    outputSchema: listAccountsOutputSchema,
    execute: () => h.listGoogleAdsAccounts()
  },
  {
    name: TOOL_NAMES.GET_ACCOUNT_OVERVIEW,
    description: "Hesap ozetini ceker: spend, clicks, conversions, ROAS, budget, serving, payment, policy ve trend metni.",
    mode: "read",
    inputSchema: accountInputSchema,
    outputSchema: accountOverviewOutputSchema,
    execute: h.getAccountOverview
  },
  {
    name: TOOL_NAMES.GET_ACCOUNT_HEALTH,
    description: "Riskleri skorlayip hesap saglik degeri uretir. 'neden sorunlu' gibi sorular icin uygundur.",
    mode: "read",
    inputSchema: accountInputSchema,
    outputSchema: accountHealthOutputSchema,
    execute: h.getAccountHealth
  },
  {
    name: TOOL_NAMES.LIST_CAMPAIGNS,
    description: "Hesaptaki kampanyalari status filtreli listelemek icin kullanilir.",
    mode: "read",
    inputSchema: listCampaignsInputSchema,
    outputSchema: listCampaignsOutputSchema,
    execute: h.listCampaigns
  },
  {
    name: TOOL_NAMES.GET_CAMPAIGN_DETAIL,
    description: "Tek kampanyanin durum ve son 7 gun performans detayini verir.",
    mode: "read",
    inputSchema: campaignDetailInputSchema,
    outputSchema: campaignDetailOutputSchema,
    execute: h.getCampaignDetail
  },
  {
    name: TOOL_NAMES.GET_BILLING_STATUS,
    description: "Odeme problemi olan musterileri tespit etmek icin billing durumunu dondurur.",
    mode: "read",
    inputSchema: accountInputSchema,
    outputSchema: billingOutputSchema,
    execute: h.getBillingStatus
  },
  {
    name: TOOL_NAMES.GET_POLICY_ISSUES,
    description: "Policy redlerini ve ihlal nedenlerini listeler.",
    mode: "read",
    inputSchema: accountInputSchema,
    outputSchema: policyOutputSchema,
    execute: h.getPolicyIssues
  },
  {
    name: TOOL_NAMES.GET_SPEND_ANOMALIES,
    description: "24 saat harcama degisiminin 7-gun baseline'a gore anomali olup olmadigini hesaplar.",
    mode: "read",
    inputSchema: spendAnomalyInputSchema,
    outputSchema: spendAnomalyOutputSchema,
    execute: h.getSpendAnomalies
  },
  {
    name: TOOL_NAMES.GET_PERFORMANCE_SUMMARY,
    description: "Belirli aralikta performans ozetini verir; CPC, CPA, ROAS ve CTR dahil.",
    mode: "read",
    inputSchema: performanceInputSchema,
    outputSchema: performanceOutputSchema,
    execute: h.getPerformanceSummary
  },
  {
    name: TOOL_NAMES.PAUSE_CAMPAIGN,
    description: "Onayli aksiyon: kampanyayi durdurur. Action mode acik degilse engellenir.",
    mode: "action",
    inputSchema: campaignDetailInputSchema,
    outputSchema: actionResultSchema,
    execute: h.pauseCampaign
  },
  {
    name: TOOL_NAMES.ENABLE_CAMPAIGN,
    description: "Onayli aksiyon: kampanyayi aktif eder. Action mode acik degilse engellenir.",
    mode: "action",
    inputSchema: campaignDetailInputSchema,
    outputSchema: actionResultSchema,
    execute: h.enableCampaign
  },
  {
    name: TOOL_NAMES.UPDATE_CAMPAIGN_BUDGET,
    description: "Onayli aksiyon: kampanya butcesini yeni amount_micros degerine gunceller.",
    mode: "action",
    inputSchema: updateCampaignBudgetInputSchema,
    outputSchema: actionResultSchema,
    execute: h.updateCampaignBudget
  },
  {
    name: TOOL_NAMES.LIST_DISAPPROVED_ADS,
    description: "Reddedilen reklamlari listeler; policy red taramasi icin hizli tooldur.",
    mode: "read",
    inputSchema: accountInputSchema,
    outputSchema: policyOutputSchema,
    execute: h.listDisapprovedAds
  },
  {
    name: TOOL_NAMES.EXPLAIN_ACCOUNT_STATUS,
    description: "Ajanin 'neden harcama dustu' veya 'bu hesapta ne oluyor' sorularina aciklayici metin dondurur.",
    mode: "read",
    inputSchema: accountInputSchema,
    outputSchema: explainStatusOutputSchema,
    execute: h.explainAccountStatus
  }
];
