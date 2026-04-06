import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    code: v.string(),
    clientName: v.string(),
    isActive: v.boolean(),
  }).index("by_isActive", ["isActive"]),

  contacts: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    company: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  emailTemplates: defineTable({
    name: v.string(),
    subject: v.string(),
    body: v.string(),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
  }),

  quotations: defineTable({
    projectId: v.id("projects"),
    quoteNumber: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sending"),
      v.literal("finalised"),
      v.literal("sent")
    ),
    lineItems: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit: v.string(),
        unitRate: v.number(),
        amount: v.number(),
      })
    ),
    totalAmount: v.number(),
    currency: v.string(),
    notes: v.optional(v.string()),
    createdBy: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_status", ["status"]),

  emailLogs: defineTable({
    quotationId: v.id("quotations"),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    resendId: v.optional(v.string()),
    sentAt: v.number(),
  }).index("by_quotation", ["quotationId"]),
});
