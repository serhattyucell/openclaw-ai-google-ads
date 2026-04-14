import { z } from "zod";
import { campaignIdSchema, customerIdSchema, dateRangeSchema } from "./common.js";

export const listAccountsInputSchema = z.object({});
export const listAccountsOutputSchema = z.object({
  managerCustomerId: z.string(),
  accounts: z.array(
    z.object({
      customerId: z.string(),
      descriptiveName: z.string(),
      currencyCode: z.string().optional(),
      timeZone: z.string().optional(),
      status: z.string().optional()
    })
  )
});

export const accountInputSchema = z.object({ customerId: customerIdSchema });
export const accountOverviewOutputSchema = z.object({
  account: z.object({ customerId: z.string(), descriptiveName: z.string() }),
  servingStatus: z.string(),
  budgetStatus: z.string(),
  paymentStatus: z.string(),
  policyIssueCount: z.number(),
  trend24h: z.string(),
  trend7d: z.string(),
  metrics: z.object({
    cost: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    roas: z.number()
  })
});

export const accountHealthOutputSchema = z.object({
  score: z.number().min(0).max(100),
  severity: z.enum(["low", "medium", "high", "critical"]),
  reasons: z.array(z.string())
});

export const listCampaignsInputSchema = z.object({
  customerId: customerIdSchema,
  status: z.string().optional()
});

export const listCampaignsOutputSchema = z.object({
  customerId: z.string(),
  campaigns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.string(),
      advertisingChannelType: z.string().optional(),
      budgetMicros: z.number().optional()
    })
  )
});

export const campaignDetailInputSchema = z.object({
  customerId: customerIdSchema,
  campaignId: campaignIdSchema
});

export const campaignDetailOutputSchema = z.object({
  customerId: z.string(),
  campaign: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    servingStatus: z.string().optional(),
    budgetMicros: z.number().optional()
  }),
  metrics: z.object({
    cost: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    roas: z.number()
  })
});

export const billingOutputSchema = z.object({
  customerId: z.string(),
  paymentStatus: z.string(),
  issues: z.array(z.string())
});

export const policyOutputSchema = z.object({
  customerId: z.string(),
  issues: z.array(
    z.object({
      level: z.string(),
      entityId: z.string(),
      entityType: z.string(),
      reason: z.string()
    })
  )
});

export const spendAnomalyInputSchema = z.object({
  customerId: customerIdSchema,
  thresholdPercent: z.number().min(5).max(95).default(30)
});

export const spendAnomalyOutputSchema = z.object({
  customerId: z.string(),
  hasAnomaly: z.boolean(),
  deltaPercent: z.number(),
  explanation: z.string()
});

export const performanceInputSchema = z.object({
  customerId: customerIdSchema,
  range: dateRangeSchema.optional()
});

export const performanceOutputSchema = z.object({
  customerId: z.string(),
  range: dateRangeSchema,
  metrics: z.object({
    cost: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    conversionValue: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    roas: z.number(),
    ctr: z.number()
  })
});

export const updateCampaignBudgetInputSchema = z.object({
  customerId: customerIdSchema,
  campaignId: campaignIdSchema,
  amountMicros: z.number().positive()
});

export const actionResultSchema = z.object({
  customerId: z.string(),
  campaignId: z.string(),
  status: z.string(),
  message: z.string()
});

export const explainStatusOutputSchema = z.object({
  customerId: z.string(),
  summary: z.string(),
  topRisks: z.array(z.string()),
  recommendedActions: z.array(z.string())
});
