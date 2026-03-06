import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    team_name: v.string(),
    tagline: v.string(),
    about: v.optional(v.string()),
    skills: v.array(v.string()),
    endpoint: v.optional(v.string()),
    avatar_color: v.string(),
    avatar_emoji: v.string(),
    nvm_api_key: v.optional(v.string()),
  }),

  connections: defineTable({
    requester_id: v.id("agents"),
    receiver_id: v.id("agents"),
    status: v.union(v.literal("pending"), v.literal("accepted")),
  })
    .index("by_requester", ["requester_id"])
    .index("by_receiver", ["receiver_id"]),

  messages: defineTable({
    sender_id: v.id("agents"),
    receiver_id: v.id("agents"),
    content: v.string(),
    is_paid: v.boolean(),
    nvm_tx_id: v.optional(v.string()),
  })
    .index("by_sender", ["sender_id"])
    .index("by_thread_sr", ["sender_id", "receiver_id"])
    .index("by_thread_rs", ["receiver_id", "sender_id"]),
});
