import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Returns all quotations, newest first.
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("quotations").order("desc").collect();
	},
});

// Returns a single quotation by its ID.
export const getById = query({
	args: {
		id: v.id("quotations"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

// Creates a new quotation with status set to "draft".
export const create = mutation({
	args: {
		projectId: v.id("projects"),
		quoteNumber: v.string(),
		title: v.string(),
		lineItems: v.array(
			v.object({
				description: v.string(),
				quantity: v.number(),
				unit: v.string(),
				unitRate: v.number(),
			})
		),
		totalAmount: v.number(),
		currency: v.string(),
		notes: v.optional(v.string()),
		createdBy: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("quotations", {
			projectId: args.projectId,
			quoteNumber: args.quoteNumber,
			title: args.title,
			lineItems: args.lineItems.map((item) => ({
				description: item.description,
				quantity: item.quantity,
				unit: item.unit,
				unitRate: item.unitRate,
				amount: item.quantity * item.unitRate,
			})),
			totalAmount: args.totalAmount,
			currency: args.currency,
			notes: args.notes,
			createdBy: args.createdBy,
			status: "draft",
		});
	},
});

// Updates the status of a quotation.
export const updateStatus = mutation({
	args: {
		id: v.id("quotations"),
		status: v.union(
			v.literal("draft"),
			v.literal("sent"),
			v.literal("finalised")
		),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { status: args.status });
	},
});
