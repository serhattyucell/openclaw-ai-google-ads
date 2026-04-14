import { z } from "zod";

export const customerIdSchema = z
  .string()
  .min(10)
  .max(20)
  .regex(/^\d+$/, "customer_id only accepts numeric digits");

export const campaignIdSchema = z
  .string()
  .min(1)
  .regex(/^\d+$/, "campaign_id only accepts numeric digits");

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
