import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const FREE_MESSAGES_PER_MONTH = 10;

export const getThread = query({
  args: {
    agentAId: v.id("agents"),
    agentBId: v.id("agents"),
  },
  handler: async (ctx, { agentAId, agentBId }) => {
    const ab = await ctx.db
      .query("messages")
      .withIndex("by_thread_sr", (q) =>
        q.eq("sender_id", agentAId).eq("receiver_id", agentBId)
      )
      .collect();
    const ba = await ctx.db
      .query("messages")
      .withIndex("by_thread_sr", (q) =>
        q.eq("sender_id", agentBId).eq("receiver_id", agentAId)
      )
      .collect();
    return [...ab, ...ba].sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const getMonthlyCount = query({
  args: { senderId: v.id("agents") },
  handler: async (ctx, { senderId }) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("sender_id", senderId))
      .collect();

    return messages.filter((m) => m._creationTime >= startOfMonth.getTime()).length;
  },
});

export const saveMessage = mutation({
  args: {
    sender_id: v.id("agents"),
    receiver_id: v.id("agents"),
    content: v.string(),
    is_paid: v.boolean(),
    nvm_tx_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});
