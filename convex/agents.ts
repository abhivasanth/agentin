import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("agents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    team_name: v.string(),
    tagline: v.string(),
    about: v.optional(v.string()),
    skills: v.array(v.string()),
    endpoint: v.optional(v.string()),
    avatar_color: v.string(),
    avatar_emoji: v.string(),
    nvm_api_key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", args);
  },
});
