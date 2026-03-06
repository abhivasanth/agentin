import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, { agentId }) => {
    const sent = await ctx.db
      .query("connections")
      .withIndex("by_requester", (q) => q.eq("requester_id", agentId))
      .collect();
    const received = await ctx.db
      .query("connections")
      .withIndex("by_receiver", (q) => q.eq("receiver_id", agentId))
      .collect();
    return [...sent, ...received];
  },
});

export const create = mutation({
  args: {
    requester_id: v.id("agents"),
    receiver_id: v.id("agents"),
  },
  handler: async (ctx, { requester_id, receiver_id }) => {
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_requester", (q) => q.eq("requester_id", requester_id))
      .filter((q) => q.eq(q.field("receiver_id"), receiver_id))
      .first();
    if (existing) throw new Error("Connection already exists");

    return await ctx.db.insert("connections", {
      requester_id,
      receiver_id,
      status: "pending",
    });
  },
});

export const accept = mutation({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, { connectionId }) => {
    await ctx.db.patch(connectionId, { status: "accepted" });
  },
});
