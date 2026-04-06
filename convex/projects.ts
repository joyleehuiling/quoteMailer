import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Returns all active projects, newest first.
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("projects")
			.withIndex("by_isActive", (q) => q.eq("isActive", true))
			.order("desc")
			.collect();
	},
});

// Creates a new project, active by default.
export const create = mutation({
	args: {
		name: v.string(),
		code: v.string(),
		clientName: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("projects", {
			name: args.name,
			code: args.code,
			clientName: args.clientName,
			isActive: true,
		});
	},
});
