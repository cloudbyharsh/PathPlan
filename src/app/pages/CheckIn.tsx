import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle, Flame, Zap } from "lucide-react";
import { DayTask, PlanConfig } from "@/types";
import { markDayComplete, isDayComplete, getStreak, getCheckinForDay } from "@/lib/checkinStore";

export default function CheckIn() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const day = Number(params.get("day") ?? 1);

  const [task, setTask] = useState<DayTask | null>(null);
  const [config, setConfig] = useState<PlanConfig | null>(null);
  const [reflection, setReflection] = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const storedConfig = sessionStorage.getItem("pp_planConfig") ?? localStorage.getItem("pp_activeConfig");
    const storedTasks = sessionStorage.getItem("pp_dayPlan");
    if (!storedConfig || !storedTasks) { navigate("/analyze"); return; }

    const cfg: PlanConfig = JSON.parse(storedConfig);
    const tasks: DayTask[] = JSON.parse(storedTasks);
    const todayTask = tasks.find((t) => t.day === day);

    setConfig(cfg);
    setTask(todayTask ?? null);
    setStreak(getStreak(cfg.planId));

    const done = isDayComplete(cfg.planId, day);
    setAlreadyDone(done);
    if (done) {
      const entry = getCheckinForDay(cfg.planId, day);
      setReflection(entry?.reflection ?? "");
    }
  }, [day, navigate]);

  function handleComplete() {
    if (!config) return;
    markDayComplete({
      day,
      planId: config.planId,
      completedAt: new Date().toISOString(),
      reflection,
    });
    setAlreadyDone(true);
    setSubmitted(true);
    setStreak(getStreak(config.planId));
  }

  if (!task || !config) return null;

  const priorityColor = task.priority === "required"
    ? { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", dot: "bg-red-500", badge: "Required" }
    : { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500", badge: "Preferred" };

  const resourceTypeIcon: Record<string, string> = {
    course: "🎓", book: "📖", practice: "💻", certification: "🏆", project: "🛠️",
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Day {day} complete!</h1>
        <p className="text-gray-500 mb-2">Great work on <strong>{task.skillName}</strong>.</p>
        {streak > 1 && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Flame className="w-4 h-4" />
            {streak}-day streak — keep it going!
          </div>
        )}
        <button
          onClick={() => navigate("/plan")}
          className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to my plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/plan")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to plan
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">PathPlan</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-sm font-semibold text-orange-600">
              <Flame className="w-4 h-4" />
              {streak}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Day badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-bold">
            {day}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Day {day} of {config.totalDays}</p>
            <h1 className="text-xl font-bold text-gray-900">Daily check-in</h1>
          </div>
        </div>

        {/* Already done notice */}
        {alreadyDone && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">You already completed this day. You can update your reflection below.</p>
          </div>
        )}

        {/* Today's focus */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Today's skill</p>
          <div className="flex items-start gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{task.skillName}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityColor.dot}`} />
                {priorityColor.badge}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{task.why}</p>
        </div>

        {/* Resource */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Today's resource</p>
          <a
            href={task.resource.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
          >
            <span className="text-2xl">{resourceTypeIcon[task.resource.type]}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                {task.resource.title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-400">{task.resource.provider}</span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400">{task.resource.duration}</span>
                {task.resource.free && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Free</span>
                )}
              </div>
            </div>
            <span className="text-xs text-indigo-500 font-medium mt-1">Open →</span>
          </a>
        </div>

        {/* Micro-task */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Today's task</p>
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">{task.microTask}</p>
        </div>

        {/* Reflection */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
            One-sentence reflection <span className="normal-case text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
            placeholder={`e.g. "I now understand how ${task.skillName} works in practice."`}
            className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
        </div>

        {/* Mark complete */}
        <button
          onClick={handleComplete}
          className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold text-base px-6 py-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          {alreadyDone ? "Update day" : `Mark Day ${day} complete`}
        </button>
      </div>
    </div>
  );
}
