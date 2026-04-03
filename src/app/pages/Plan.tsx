import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ExternalLink, Terminal, RotateCcw, CheckSquare, Clock } from "lucide-react";
import { LearningPlan, LearningModule, LearningResource } from "@/types";

const TYPE_LABELS: Record<LearningResource["type"], string> = {
  course: "[COURSE]",
  book: "[BOOK]",
  practice: "[PRACTICE]",
  certification: "[CERT]",
  project: "[PROJECT]",
};

const TYPE_COLORS: Record<LearningResource["type"], string> = {
  course: "text-[#33ff00]",
  book: "text-[#ffb000]",
  practice: "text-[#33ff00]",
  certification: "text-[#ffb000]",
  project: "text-[#33ff00]",
};

function AsciiProgressBar({ value, max, width = 16 }: { value: number; max: number; width?: number }) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return (
    <span className="font-mono text-xs text-[#33ff00] text-glow">
      [{"â".repeat(filled)}{"â".repeat(empty)}] {value}/{max}w
    </span>
  );
}

function ResourceRow({ resource }: { resource: LearningResource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-start gap-3 p-3 border border-[#1f521f] hover:border-[#33ff00] hover:bg-[#0d2b0d] transition-all group"
    >
      <span className={`text-xs font-bold shrink-0 mt-0.5 ${TYPE_COLORS[resource.type]}`}>
        {TYPE_LABELS[resource.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#33ff00] group-hover:text-glow transition-all leading-snug">
          {resource.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#1f521f]">
          <span>{resource.provider}</span>
          <span>Â·</span>
          <span>{resource.duration}</span>
          {resource.free && (
            <span className="text-[#33ff00] border border-[#33ff00] px-1 text-glow">FREE</span>
          )}
        </div>
      </div>
      <ExternalLink className="w-3 h-3 text-[#1f521f] group-hover:text-[#33ff00] shrink-0 mt-1 transition-colors" strokeWidth={2} />
    </a>
  );
}

function ModuleCard({ module, index, total }: { module: LearningModule; index: number; total: number }) {
  const [checked, setChecked] = useState(false);
  const isRequired = module.priority === "required";

  return (
    <div className={`term-pane transition-opacity ${checked ? "opacity-40" : ""}`}>
      <div className={`term-pane-header ${isRequired ? "" : "bg-[#2b1f00] text-[#ffb000]"}`}>
        +âââ MODULE_{String(index + 1).padStart(2, "0")}: {module.skill.toUpperCase()} âââ+
        <div className="flex items-center gap-2 text-xs">
          <span className={`border px-2 py-0 ${isRequired ? "border-[#0a0a0a] text-[#0a0a0a]" : "border-[#ffb000] text-[#ffb000]"}`}>
            {isRequired ? "[REQUIRED]" : "[PREFERRED]"}
          </span>
          <button
            onClick={() => setChecked(!checked)}
            className={`transition-colors ${checked ? "text-[#33ff00]" : "opacity-50 hover:opacity-100"}`}
            title={checked ? "Mark incomplete" : "Mark complete"}
          >
            <CheckSquare className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3 text-xs text-[#1f521f]">
          <span>category: <span className="text-[#33ff00]">{module.category}</span></span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={2} />
            <AsciiProgressBar value={0} max={module.weekEstimate} width={module.weekEstimate} />
            <span className="ml-1">~{module.weekEstimate}w</span>
          </div>
        </div>

        <p className="text-xs text-[#33ff00]/70 leading-relaxed mb-4 border-l border-[#1f521f] pl-3">
          {module.why}
        </p>

        <div className="text-xs text-[#1f521f] mb-2 uppercase tracking-wider">
          $ resources --recommended --module={index + 1}
        </div>
        <div className="space-y-2">
          {module.resources.map((r, i) => (
            <ResourceRow key={i} resource={r} />
          ))}
        </div>
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
    <div className="min-h-screen bg-[#0a0a0a] font-mono text-[#33ff00] relative">
      <div className="crt-overlay" />

      {/* Header */}
      <header className="border-b border-[#1f521f] sticky top-0 bg-[#0a0a0a] z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/results")} className="flex items-center gap-2 text-xs text-[#1f521f] hover:text-[#33ff00] transition-colors">
            <ArrowLeft className="w-3 h-3" strokeWidth={2} /> [ results ]
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#33ff00] text-glow" strokeWidth={2} />
            <span className="font-bold text-[#33ff00] text-glow text-sm tracking-widest uppercase">PathPlan</span>
          </div>
          <button onClick={() => navigate("/analyze")} className="flex items-center gap-2 text-xs text-[#1f521f] hover:text-[#33ff00] transition-colors">
            <RotateCcw className="w-3 h-3" strokeWidth={2} /> [ new analysis ]
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Plan header */}
        <div className="term-pane">
          <div className="term-pane-header">
            +âââââââââââââââ LEARNING_PLAN.out âââââââââââââââ+
          </div>
          <div className="p-6">
            <div className="text-xs text-[#1f521f] mb-2">$ build --learning-plan --personalised</div>
            <h1 className="text-xl font-bold text-[#33ff00] text-glow uppercase tracking-widest mb-1">
              YOUR PERSONALISED LEARNING PLAN
            </h1>
            <div className="text-xs text-[#1f521f] mb-4">
              modules: <span className="text-[#33ff00]">{plan.modules.length}</span>
              {" "}Â· total_weeks: <span className="text-[#33ff00]">~{plan.totalWeeks}w</span>
              {" "}Â· priority: <span className="text-[#33ff00]">role-requirements-first</span>
            </div>

            {/* Phases */}
            {plan.phases.length > 0 && (
              <div className="mt-4">
                <div className="ascii-divider text-xs mb-3">ââââ PHASES ââââââââââââââââââââââââââââââââââââââââââ</div>
                <div className="grid sm:grid-cols-3 gap-0 border border-[#1f521f]">
                  {plan.phases.map((phase, i) => (
                    <div key={i} className={`p-4 ${i < plan.phases.length - 1 ? "border-r border-[#1f521f]" : ""}`}>
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#33ff00] text-glow">
                        <span className="border border-[#33ff00] px-1">{i + 1}</span>
                        <span className="uppercase">{phase.name}</span>
                      </div>
                      <div className="text-xs text-[#ffb000] text-glow-amber mb-1">{phase.weeks}</div>
                      <p className="text-xs text-[#33ff00]/60 leading-relaxed mb-2">{phase.goal}</p>
                      {phase.focus.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {phase.focus.map((f) => (
                            <span key={f} className="text-xs border border-[#1f521f] text-[#1f521f] px-1 uppercase">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required modules */}
        {requiredModules.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="text-[#ff3333]">[ERR]</span>
              <span className="text-[#ff3333] uppercase tracking-widest">REQUIRED â close these first</span>
              <span className="text-[#1f521f] flex-1">ââââââââââââââââââââââââââââââ</span>
            </div>
            <div className="space-y-4">
              {requiredModules.map((m, i) => (
                <ModuleCard key={m.skill} module={m} index={i} total={plan.modules.length} />
              ))}
            </div>
          </div>
        )}

        {/* Preferred modules */Â )
        {preferredModules.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="text-[#ffb000] text-glow-amber">[WARN]</span>
              <span className="text-[#ffb000] uppercase tracking-widest text-glow-amber">PREFERRED â will differentiate you</span>
              <span className="text-[#1f521f] flex-1">ââââââââââââââââââââââââââ</span>
            </div>
            <div className="space-y-4">
              {preferredModules.map((m, i) => (
                <ModuleCard key={m.skill} module={m} index={requiredModules.length + i} total={plan.modules.length} />
              ))}
            </div>
          </div>
        )}

        { plan.modules.length === 0 && (
          <div className="term-pane text-center py-12">
            <div className="term-pane-header mb-0">+âââ SYSTEM STATUS âââ+</div>
            <div className="p-8">
              <div className="text-4xl text-[#33ff00] text-glow mb-3">[OK]</div>
              <h2 className="text-lg font-bold text-[#33ff00] text-glow uppercase tracking-widest mb-2">NO GAPS DETECTED</h2>
              <p className="text-xs text-[#33ff00]/60 max-w-sm mx-auto">
                // your cv already covers the skills in this JD Â· focus on tailoring your application narrative
              </p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pb-4">
          <button
            onClick={() => navigate("/analyze")}
            className="flex items-center gap-2 text-xs text-[#1f521f] hover:text-[#33ff00] transition-colors mx-auto"
          >
            <RotateCcw className="w-3 h-3" strokeWidth={2} />
            [ analyse another job description ]
          </button>
        </div>
      </div>
    </div>
  );
}
