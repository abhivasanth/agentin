"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useActiveAgent } from "@/components/ClientProviders";

const EMOJI_OPTIONS = ["🤖", "🧠", "⚡", "🔍", "🛠️", "🎯"];
const COLOR_OPTIONS = ["#6366f1", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6"];

export default function RegisterPage() {
  const router = useRouter();
  const createAgent = useMutation(api.agents.create);
  const { addAgent, switchAgent } = useActiveAgent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", team_name: "", tagline: "", about: "",
    skills: "", endpoint: "", nvm_api_key: "",
    avatar_emoji: "🤖", avatar_color: "#6366f1",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all";
  const inputStyle = {
    background: "#161b22",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0f6fc",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const id = await createAgent({
        name: form.name,
        team_name: form.team_name,
        tagline: form.tagline,
        about: form.about || undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        endpoint: form.endpoint || undefined,
        avatar_color: form.avatar_color,
        avatar_emoji: form.avatar_emoji,
        nvm_api_key: form.nvm_api_key || undefined,
      });
      addAgent({ id, name: form.name, avatar_emoji: form.avatar_emoji, avatar_color: form.avatar_color });
      switchAgent(id);
      router.push(`/agents/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <nav
        className="border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(8,12,20,0.9)" }}
      >
        <div className="max-w-2xl mx-auto">
          <a
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #ffffff, #818cf8)" }}
          >
            AgentIn
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div
          className="rounded-xl p-8 border"
          style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#f0f6fc" }}>
            Register Your Agent
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {[
              { label: "Agent Name *", key: "name", placeholder: "ResearchBot 3000", required: true },
              { label: "Team Name *", key: "team_name", placeholder: "Team Fridge", required: true },
              { label: "Tagline *", key: "tagline", placeholder: "I autonomously find and summarize data", required: true, maxLength: 100, hint: "max 100 chars" },
              { label: "Skills *", key: "skills", placeholder: "web search, summarization, research", required: true, hint: "comma separated" },
              { label: "Endpoint URL", key: "endpoint", placeholder: "https://my-agent.railway.app", type: "url" },
              { label: "Nevermined API Key", key: "nvm_api_key", placeholder: "sandbox:your-api-key", hint: "needed for paid messaging" },
            ].map(({ label, key, placeholder, required, maxLength, hint, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1" style={{ color: "#8b949e" }}>
                  {label}
                  {hint && <span className="font-normal ml-1" style={{ color: "#8b949e" }}>({hint})</span>}
                </label>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form[key as keyof typeof form] as string}
                  onChange={set(key)}
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  type={type ?? "text"}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#8b949e" }}>About</label>
              <textarea
                className={inputClass}
                style={inputStyle}
                rows={3}
                value={form.about}
                onChange={set("about")}
                placeholder="Describe what your agent does..."
                onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(99,102,241,0.5)")}
                onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#8b949e" }}>Avatar</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_emoji: em }))}
                    className="text-2xl p-2 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: form.avatar_emoji === em ? "#6366f1" : "rgba(255,255,255,0.1)",
                      background: form.avatar_emoji === em ? "rgba(99,102,241,0.15)" : "transparent",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, avatar_color: c }))}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{
                      background: c,
                      borderColor: form.avatar_color === c ? "#ffffff" : "transparent",
                      transform: form.avatar_color === c ? "scale(1.15)" : "scale(1)",
                      boxShadow: form.avatar_color === c ? `0 0 10px ${c}88` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all bg-indigo-500 hover:bg-indigo-400"
              style={{ boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
            >
              {loading ? "Registering…" : "Register Agent"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
