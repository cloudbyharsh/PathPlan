import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { AnalysisResult } from "@/types";

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Strong match" : score >= 45 ? "Partial match" : "Needs work";

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#f3f4f6" strokeWidth="12" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" className="fill-gray-900" fontSize="28" fontWeight="800" fontFamily="Inter, sans-serif">
          {score}%
        </text>
        <text x="70" y="84" textAnchor="middle" className="fill-gray-400" fontSize="11" fontFamily="Inter, sans-serif">
          match score
        </text>
      </svg>
      <span
        className="text-sm font-semibold mt-1"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("pp_analysis");
    if (!stored) { navigate("/analyze"); return; }
    setAnalysis(JSON.parse(stored) as AnalysisResult);
  }, [navigate]);

  if (!analysis) return null;

  const { matchScore, strongMatches, skillGaps, extraSkills, cvSummary, jdSummary } = analysis;
  const requiredGaps = skillGaps.filter((g) => g.priority === "required");
  const preferredGaps = skillGaps.filter((g) => g.priority === "preferred");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/analyze")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Edit inputs
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">PathPlan</span>
          </div>
          <button
            onClick={() => navigate("/plan-config")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View learning plan <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Hero score card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex justify-center">
              <ScoreRing score={matchScore} />
            </div>
            <div className="md:col-span-2 space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Match analysis: {jdSummary.role}
                </h1>
                {jdSummary.company && (
                  <p className="text-sm text-gray-500">{jdSummary.company}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <Stat label="Skills matched" value={strongMatches.length} color="text-emerald-600" />
                <Stat label="Gaps to close" value={skillGaps.length} color="text-amber-600" />
                <Stat label="Bonus skills" value={extraSkills.length} color="text-indigo-600" />
              </div>
              {cvSummary.yearsOfExperience && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{cvSummary.yearsOfExperience} years</span> of experience detected · {jdSummary.seniority !== "unknown" && <><span className="font-medium text-gray-700 capitalize">{jdSummary.seniority}-level</span> role</>}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Strong matches */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold text-gray-900">Strong matches ({strongMatches.length})</h2>
            </div>
            {strongMatches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {strongMatches.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No matching skills detected. Try adding more detail to your CV.</p>
            )}
          </div>

          {/* Bonus skills */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h2 className="font-semibold text-gray-900">Bonus skills you bring ({extraSkills.length})</h2>
            </div>
            {extraSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {extraSkills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No extra skills detected beyond the JD requirements.</p>
            )}
          </div>
        </div>

        {/* Skill gaps */}
        {skillGaps.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <XCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-semibold text-gray-900">Skill gaps ({skillGaps.length})</h2>
            </div>

            {requiredGaps.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Required — close these first</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requiredGaps.map((g) => (
                    <span key={g.skill} className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {g.skill}
                      <span className="text-red-400">· {g.category}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferredGaps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Preferred — will differentiate you</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferredGaps.map((g) => (
                    <span key={g.skill} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-100">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {g.skill}
                      <span className="text-amber-400">· {g.category}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            {skillGaps.length > 0
              ? `You have ${skillGaps.length} skill gap${skillGaps.length > 1 ? "s" : ""} to close.`
              : "Great match! Here's how to strengthen your application."}
          </h2>
          <p className="text-indigo-200 text-sm mb-6">
            Your personalised learning plan is ready — prioritised by what this role actually needs.
          </p>
          <button
            onClick={() => navigate("/plan-config")}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            View my learning plan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
