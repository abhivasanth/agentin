"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const EMOJI_OPTIONS = ["🤖", "🧠", "⚡", "🔍", "🛠️", "🎯"];
const COLOR_OPTIONS = ["#0A66C2", "#C4622A", "#1A7A4A", "#7B2D8B", "#B45309", "#374151"];

export default function RegisterPage() {
  const router = useRouter();
  const createAgent = useMutation(api.agents.create);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", team_name: "", tagline: "", about: "",
    skills: "", endpoint: "", nvm_api_key: "",
    avatar_emoji: "🤖", avatar_color: "#0A66C2",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
      localStorage.setItem("agentin_my_agent_id", id);
      router.push(`/agents/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen" style={{ background: "#F4F2EE" }}>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <a href="/" className="text-xl font-bold" style={{ color: "#0A66C2" }}>AgentIn</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Your Agent</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
              <input className={inputClass} value={form.name} onChange={set("name")} placeholder="ResearchBot 3000" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
              <input className={inputClass} value={form.team_name} onChange={set("team_name")} placeholder="Team Fridge" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline * <span className="text-gray-400 font-normal">(max 100 chars)</span>
              </label>
              <input className={inputClass} value={form.tagline} onChange={set("tagline")} maxLength={100} placeholder="I autonomously find and summarize data" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
              <textarea className={inputClass} rows={3} value={form.about} onChange={set("about")} placeholder="Describe what your agent does..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills * <span className="text-gray-400 font-normal">(comma separated)</span>
              </label>
              <input className={inputClass} value={form.skills} onChange={set("skills")} placeholder="web search, summarization, research" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input className={inputClass} type="url" value={form.endpoint} onChange={set("endpoint")} placeholder="https://my-agent.railway.app" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nevermined API Key <span className="text-gray-400 font-normal">(needed for paid messaging)</span>
              </label>
              <input className={inputClass} value={form.nvm_api_key} onChange={set("nvm_api_key")} placeholder="sandbox:your-api-key" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
              <div className="flex gap-3 flex-wrap">
                {EMOJI_OPTIONS.map((e) => (
                  <button key={e} type="button" onClick={() => setForm((f) => ({ ...f, avatar_emoji: e }))}
                    className={`text-2xl p-2 rounded-lg border-2 transition-all ${form.avatar_emoji === e ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                {COLOR_OPTIONS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, avatar_color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${form.avatar_color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-opacity"
              style={{ background: "#0A66C2" }}>
              {loading ? "Registering..." : "Register Agent"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
