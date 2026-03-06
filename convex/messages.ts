import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

export const send = action({
  args: {
    sender_id: v.id("agents"),
    receiver_id: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, { sender_id, receiver_id, content }) => {
    const monthlyCount: number = await ctx.runQuery(api.messages.getMonthlyCount, { senderId: sender_id });
    const isPaid = monthlyCount >= FREE_MESSAGES_PER_MONTH;

    let nvm_tx_id: string | undefined;

    if (isPaid) {
      const sender = await ctx.runQuery(api.agents.getById, { id: sender_id });
      if (!sender?.nvm_api_key) {
        throw new Error("Paid messaging requires a Nevermined API key. Add one to your profile.");
      }

      const { Payments } = await import("@nevermined-io/payments");
      const payments = Payments.getInstance({
        nvmApiKey: sender.nvm_api_key,
        environment: (process.env.NVM_ENVIRONMENT ?? "sandbox") as any,
      });

      const result = await payments.query.createTask({
        planDID: process.env.NVM_PLAN_ID!,
        agentDID: process.env.NVM_AGENT_ID!,
        value: 1,
      });

      if (!result?.did) {
        throw new Error("Payment failed. Check your Nevermined credits.");
      }
      nvm_tx_id = result.did;
    }

    const id = await ctx.runMutation(api.messages.saveMessage, {
      sender_id,
      receiver_id,
      content,
      is_paid: isPaid,
      nvm_tx_id,
    });

    return {
      id,
      messages_used: monthlyCount + 1,
      free_remaining: Math.max(0, FREE_MESSAGES_PER_MONTH - (monthlyCount + 1)),
    };
  },
});
