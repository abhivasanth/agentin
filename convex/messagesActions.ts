"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const FREE_MESSAGES_PER_MONTH = 10;

export const send = action({
  args: {
    sender_id: v.id("agents"),
    receiver_id: v.id("agents"),
    content: v.string(),
  },
  handler: async (ctx, { sender_id, receiver_id, content }): Promise<{
    id: Id<"messages">;
    messages_used: number;
    free_remaining: number;
  }> => {
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

      const result = await (payments.query as any).createTask({
        planDID: process.env.NVM_PLAN_ID!,
        agentDID: process.env.NVM_AGENT_ID!,
        value: 1,
      });

      if (!result?.did) {
        throw new Error("Payment failed. Check your Nevermined credits.");
      }
      nvm_tx_id = result.did as string;
    }

    const id = (await ctx.runMutation(api.messages.saveMessage, {
      sender_id,
      receiver_id,
      content,
      is_paid: isPaid,
      nvm_tx_id,
    })) as Id<"messages">;

    return {
      id,
      messages_used: monthlyCount + 1,
      free_remaining: Math.max(0, FREE_MESSAGES_PER_MONTH - (monthlyCount + 1)),
    };
  },
});
