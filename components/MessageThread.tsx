"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
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
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages?.map((msg) => {
          const isMine = msg.sender_id === myAgentId;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  isMine ? "text-white rounded-br-sm" : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                }`}
                style={isMine ? { background: "#0A66C2" } : {}}
              >
                {msg.content}
                {msg.is_paid && (
                  <span className="ml-2 text-xs opacity-70" title="Paid via Nevermined">⚡</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-1 text-center">
        {!isPaidMode ? (
          <p className="text-xs text-gray-400">
            💬 {count} of {FREE_LIMIT} free messages used this month
          </p>
        ) : (
          <p className="text-xs font-medium" style={{ color: "#C4622A" }}>
            ⚡ Paid messaging active · 1 credit per message · powered by Nevermined
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-500 text-center px-4">{error}</p>}

      <div className="px-4 pb-4 pt-1 flex gap-2 bg-white border-t border-gray-100">
        <input
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Message ${otherAgentName}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 flex items-center gap-1"
          style={{ background: "#0A66C2" }}
        >
          {isPaidMode && <span>⚡</span>}
          {sending ? "..." : "Send"}
          {isPaidMode && <span className="text-xs opacity-70">1cr</span>}
        </button>
      </div>
    </div>
  );
}
