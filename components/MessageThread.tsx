"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TextShimmer } from "@/components/ui/text-shimmer";
import type { Id } from "@/convex/_generated/dataModel";

type Props = {
  myAgentId: Id<"agents">;
  otherAgentId: Id<"agents">;
  otherAgentName: string;
};

const FREE_LIMIT = 10;

export function MessageThread({ myAgentId, otherAgentId, otherAgentName }: Props) {
  const messages = useQuery(api.messages.getThread, { agentAId: myAgentId, agentBId: otherAgentId });
  const monthlyCount = useQuery(api.messages.getMonthlyCount, { senderId: myAgentId });
  const sendMessage = useAction(api.messages.send);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const count = monthlyCount ?? 0;
  const isPaidMode = count >= FREE_LIMIT;

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await sendMessage({ sender_id: myAgentId, receiver_id: otherAgentId, content: input.trim() });
      setInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages?.map((msg) => {
          const isMine = msg.sender_id === myAgentId;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[70%] px-4 py-2 rounded-2xl text-sm"
                style={
                  isMine
                    ? {
                        background: "#6366f1",
                        color: "#ffffff",
                        borderBottomRightRadius: "4px",
                        boxShadow: msg.is_paid ? "0 0 8px rgba(99,102,241,0.5)" : undefined,
                      }
                    : {
                        background: "#161b22",
                        color: "#f0f6fc",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {msg.content}
                {msg.is_paid && (
                  <span
                    className="ml-2 text-xs font-medium px-1 py-0.5 rounded"
                    style={{
                      color: "#f59e0b",
                      background: "rgba(245,158,11,0.15)",
                    }}
                    title="Paid via Nevermined"
                  >
                    ⚡
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Credit counter */}
      <div className="px-4 py-1 text-center">
        {sending && isPaidMode ? (
          <TextShimmer
            duration={1}
            className="text-xs [--base-color:#8b949e] [--base-gradient-color:#818cf8]"
          >
            Processing payment via Nevermined…
          </TextShimmer>
        ) : !isPaidMode ? (
          <p className="text-xs" style={{ color: "#8b949e" }}>
            💬 {count} of {FREE_LIMIT} free messages used this month
          </p>
        ) : (
          <p
            className="text-xs font-medium"
            style={{
              color: "#f59e0b",
              textShadow: "0 0 8px rgba(245,158,11,0.4)",
            }}
          >
            ⚡ Paid messaging active · 1 credit per message · powered by Nevermined
          </p>
        )}
      </div>

      {error && <p className="text-xs text-center px-4" style={{ color: "#f87171" }}>{error}</p>}

      {/* Input bar */}
      <div
        className="px-4 pb-4 pt-2 flex gap-2 border-t"
        style={{ background: "#080c14", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <input
          className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none transition-all"
          style={{
            background: "#161b22",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f0f6fc",
          }}
          placeholder={`Message ${otherAgentName}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(99,102,241,0.5)")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 transition-all flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400"
          style={{ boxShadow: "0 0 14px rgba(99,102,241,0.3)" }}
        >
          {isPaidMode && <span>⚡</span>}
          {sending ? "…" : "Send"}
          {isPaidMode && <span className="text-xs opacity-70">1cr</span>}
        </button>
      </div>
    </div>
  );
}
