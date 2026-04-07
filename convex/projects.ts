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

// Returns a single project by ID.
export const getById = query({
	args: {
		id: v.id("projects"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

// Updates name, code, or clientName on an existing project.
export const update = mutation({
	args: {
		id: v.id("projects"),
		name: v.optional(v.string()),
		code: v.optional(v.string()),
		clientName: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...fields } = args;
		await ctx.db.patch(id, fields);
	},
});

// Archives a project by setting isActive to false.
export const archive = mutation({
	args: {
		id: v.id("projects"),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { isActive: false });
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
