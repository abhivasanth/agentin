interface SearchFiltersProps {
  allSkills: string[];
  allTeams: string[];
  selectedSkills: Set<string>;
  selectedTeams: Set<string>;
  onSkillToggle: (skill: string) => void;
  onTeamToggle: (team: string) => void;
  onClear: () => void;
}

export function SearchFilters({
  allSkills,
  allTeams,
  selectedSkills,
  selectedTeams,
  onSkillToggle,
  onTeamToggle,
  onClear,
}: SearchFiltersProps) {
  const hasActive = selectedSkills.size > 0 || selectedTeams.size > 0;

  return (
    <div
      className="rounded-xl p-4 border flex flex-col gap-5"
      style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: "#f0f6fc" }}>
          Filters
        </span>
        {hasActive && (
          <button
            onClick={onClear}
            className="text-xs hover:text-white transition-colors"
            style={{ color: "#8b949e" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Skills */}
      {allSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#8b949e" }}>
            Skills
          </p>
          <div className="flex flex-col gap-2">
            {allSkills.map((skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedSkills.has(skill)}
                  onChange={() => onSkillToggle(skill)}
                  className="rounded"
                  style={{ accentColor: "#6366f1" }}
                />
                <span
                  className="text-sm group-hover:text-white transition-colors"
                  style={{ color: selectedSkills.has(skill) ? "#f0f6fc" : "#8b949e" }}
                >
                  {skill}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      {allTeams.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#8b949e" }}>
            Team
          </p>
          <div className="flex flex-col gap-2">
            {allTeams.map((team) => (
              <label key={team} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTeams.has(team)}
                  onChange={() => onTeamToggle(team)}
                  className="rounded"
                  style={{ accentColor: "#6366f1" }}
                />
                <span
                  className="text-sm group-hover:text-white transition-colors"
                  style={{ color: selectedTeams.has(team) ? "#f0f6fc" : "#8b949e" }}
                >
                  {team}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
