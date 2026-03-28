import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, BookOpen, Clock, ExternalLink, CheckSquare, Zap, RotateCcw } from "lucide-react";
import { LearningPlan, LearningModule, LearningResource } from "@/types";

const TYPE_ICONS: Record<LearningResource["type"], string> = {
  course: "🎓",
  book: "📖",
  practice: "💻",
  certification: "🏆",
  project: "🛠️",
};

const PRIORITY_COLORS = {
  required: { badge: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500" },
  preferred: { badge: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500" },
};

function ResourceCard({ resource }: { resource: LearningResource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
    >
      <span className="text-lg mt-0.5">{TYPE_ICONS[resource.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors leading-snug">{resource.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-gray-400">{resource.provider}</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-400">{resource.duration}</span>
          {resource.free && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Free</span>
          )}
        </div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
    </a>
  );
}

function ModuleCard({ module, index }: { module: LearningModule; index: number }) {
  const [checked, setChecked] = useState(false);
  const colors = PRIORITY_COLORS[module.priority];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-opacity ${checked ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{module.skill}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors.badge}`}>
                {module.priority}
              </span>
              <span className="text-xs text-gray-400">{module.category}</span>
              <span className="text-gray-200">·</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                ~{module.weekEstimate} week{module.weekEstimate > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setChecked(!checked)}
          className={`shrink-0 p-1.5 rounded-lg transition-colors ${checked ? "text-emerald-500 bg-emerald-50" : "text-gray-300 hover:text-indigo-400 hover:bg-indigo-50"}`}
          title={checked ? "Mark incomplete" : "Mark complete"}
        >
          <CheckSquare className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed mb-4 ml-11">{module.why}</p>

      <div className="ml-11 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended resources</p>
        {module.resources.map((r, i) => (
          <ResourceCard key={i} resource={r} />
        ))}
      </div>
    </div>
  );
}

export default function Plan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<LearningPlan | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("pp_plan");
    if (!stored) { navigate("/analyze"); return; }
    setPlan(JSON.parse(stored) as LearningPlan);
  }, [navigate]);

  if (!plan) return null;

  const requiredModules = plan.modules.filter((m) => m.priority === "required");
  const preferredModules = plan.modules.filter((m) => m.priority === "preferred");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/results")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to results
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">PathPlan</span>
          </div>
          <button onClick={() => navigate("/analyze")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> New analysis
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Your personalised learning plan</h1>
              <p className="text-gray-500 text-sm">
                {plan.modules.length} skill{plan.modules.length !== 1 ? "s" : ""} to develop · ~{plan.totalWeeks} weeks total ·
                Resources prioritised by what this role actually requires
              </p>
            </div>
          </div>

          {/* Phases */}
          {plan.phases.length > 0 && (
            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {plan.phases.map((phase, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center ${["bg-red-500", "bg-amber-500", "bg-indigo-500"][i] ?? "bg-gray-400"}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{phase.name}</span>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mb-1">{phase.weeks}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{phase.goal}</p>
                  {phase.focus.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {phase.focus.map((f) => (
                        <span key={f} className="text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded capitalize">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Required modules */}
        {requiredModules.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Required skills — close these first</h2>
            </div>
            <div className="space-y-4">
              {requiredModules.map((m, i) => (
                <ModuleCard key={m.skill} module={m} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Preferred modules */}
        {preferredModules.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Preferred skills — will differentiate you</h2>
            </div>
            <div className="space-y-4">
              {preferredModules.map((m, i) => (
                <ModuleCard key={m.skill} module={m} index={requiredModules.length + i} />
              ))}
            </div>
          </div>
        )}

        {plan.modules.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No gaps detected!</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Your CV already covers the skills in this JD. Focus on tailoring your application narrative.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pb-4">
          <button
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Analyse another job description
          </button>
        </div>
      </div>
    </div>
  );
}
