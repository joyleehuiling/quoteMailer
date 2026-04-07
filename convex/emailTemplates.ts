import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Returns all email templates.
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("emailTemplates").collect();
	},
});

// Creates a new email template.
export const create = mutation({
	args: {
		name: v.string(),
		subject: v.string(),
		body: v.string(),
		isDefault: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("emailTemplates", {
			name: args.name,
			subject: args.subject,
			body: args.body,
			isDefault: args.isDefault,
			createdAt: Date.now(),
		});
	},
});

// Updates an existing email template.
export const update = mutation({
	args: {
		id: v.id("emailTemplates"),
		name: v.optional(v.string()),
		subject: v.optional(v.string()),
		body: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		await ctx.db.patch(id, fields);
	},
});

// Sets one template as the default, clearing isDefault on all others.
export const setDefault = mutation({
	args: {
		id: v.id("emailTemplates"),
	},
	handler: async (ctx, args) => {
		const all = await ctx.db.query("emailTemplates").collect();
		await Promise.all(
			all.map((t) =>
				ctx.db.patch(t._id, { isDefault: t._id === args.id ? true : false })
			)
		);
	},
});
