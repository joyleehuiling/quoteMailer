import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Returns all contacts for a given project.
export const list = query({
	args: {
		projectId: v.id("projects"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("contacts")
			.withIndex("by_project", (q) => q.eq("projectId", args.projectId))
			.collect();
	},
});

// Creates a new contact for a project.
export const create = mutation({
	args: {
		projectId: v.id("projects"),
		name: v.string(),
		email: v.string(),
		role: v.optional(v.string()),
		company: v.optional(v.string()),
		isDefault: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("contacts", {
			projectId: args.projectId,
			name: args.name,
			email: args.email,
			role: args.role,
			company: args.company,
			isDefault: args.isDefault,
			createdAt: Date.now(),
		});
	},
});

// Updates an existing contact.
export const update = mutation({
	args: {
		id: v.id("contacts"),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		role: v.optional(v.string()),
		company: v.optional(v.string()),
		isDefault: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		await ctx.db.patch(id, fields);
	},
});

// Deletes a contact.
export const remove = mutation({
	args: {
		id: v.id("contacts"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
