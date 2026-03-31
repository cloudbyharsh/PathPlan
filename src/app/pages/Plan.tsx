import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, BookOpen, CheckCircle, ExternalLink, Flame,
  Map, RotateCcw, Zap, Lock, ChevronDown, ChevronUp,
} from "lucide-react";
import { DayTask, LearningPlan, PlanConfig } from "@/types";
import { buildDayPlan } from "@/lib/scheduler";
import { isDayComplete, getStreak, getCurrentDayNumber, getCompletionPercent } from "@/lib/checkinStore";
import { getRoadmapUrl } from "@/lib/roadmapLinks";

const PRIORITY_COLORS = {
  required: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", dot: "bg-red-500" },
  preferred: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
};

const RESOURCE_ICONS: Record<string, string> = {
  course: "🎓", book: "📖", practice: "💻", certification: "🏆", project: "🛠️",
};

function DayCard({
  task,
  planId,
  currentDay,
  onCheckin,
}: {
  task: DayTask;
  planId: string;
  currentDay: number;
  onCheckin: (day: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const done = isDayComplete(planId, task.day);
  const isToday = task.day === currentDay;
  const isFuture = task.day > currentDay;
  const colors = PRIORITY_COLORS[task.priority];
  const roadmapUrl = getRoadmapUrl(task.skillName);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        done
          ? "border-emerald-200 bg-emerald-50/50"
          : isToday
          ? "border-indigo-300 bg-white shadow-md ring-2 ring-indigo-100"
          : isFuture
          ? "border-gray-100 bg-white opacity-70"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Day header — always visible */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer select-none"
        onClick={() => !isFuture && setExpanded((v) => !v)}
      >
        {/* Day number bubble */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
            done
              ? "bg-emerald-500 text-white"
              : isToday
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {done ? <CheckCircle className="w-5 h-5" /> : task.day}
        </div>

        {/* Skill name + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${done ? "text-emerald-700 line-through" : "text-gray-900"}`}>
              {task.skillName}
            </p>
            {isToday && (
              <span className="text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
            {done && (
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Done
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {RESOURCE_ICONS[task.resource.type]} {task.resource.title}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {isFuture && <Lock className="w-3.5 h-3.5 text-gray-300" />}
          {!isFuture && (
            expanded
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && !isFuture && (
        <div className="px-4 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Why this skill */}
          <p className="text-sm text-gray-500 leading-relaxed">{task.why}</p>

          {/* Priority badge */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {task.priority === "required" ? "Required skill" : "Preferred skill"}
          </span>

          {/* Resource link */}
          <a
            href={task.resource.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
          >
            <span className="text-lg">{RESOURCE_ICONS[task.resource.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                {task.resource.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{task.resource.provider}</span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400">{task.resource.duration}</span>
                {task.resource.free && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Free</span>
                )}
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 shrink-0" />
          </a>

          {/* Micro-task */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Your task today</p>
            <p className="text-sm text-indigo-900 leading-relaxed">{task.microTask}</p>
          </div>

          {/* roadmap.sh link */}
          {roadmapUrl && (
            <a
              href={roadmapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium group"
            >
              <Map className="w-4 h-4" />
              View full {task.skillName} roadmap on roadmap.sh
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </a>
          )}

          {/* Check-in CTA */}
          <button
            onClick={() => onCheckin(task.day)}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
              done
                ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {done ? "Update reflection" : `Mark Day ${task.day} complete →`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Plan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [config, setConfig] = useState<PlanConfig | null>(null);
  const [dayTasks, setDayTasks] = useState<DayTask[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [streak, setStreak] = useState(0);
  const [completionPct, setCompletionPct] = useState(0);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("pp_plan");
    const storedConfig =
      sessionStorage.getItem("pp_planConfig") ?? localStorage.getItem("pp_activeConfig");

    if (!storedPlan || !storedConfig) {
      navigate("/analyze");
      return;
    }

    const p: LearningPlan = JSON.parse(storedPlan);
    const cfg: PlanConfig = JSON.parse(storedConfig);

    // Build (or reload) the day plan
    let tasks: DayTask[];
    const cached = sessionStorage.getItem("pp_dayPlan");
    const cachedConfig = sessionStorage.getItem("pp_planConfig");
    if (cached && cachedConfig && JSON.parse(cachedConfig).planId === cfg.planId) {
      tasks = JSON.parse(cached);
    } else {
      const storedAnalysis = sessionStorage.getItem("pp_analysis");
      const gaps = storedAnalysis ? (JSON.parse(storedAnalysis).skillGaps ?? []) : [];
      tasks = buildDayPlan(gaps, p.modules, cfg);
      sessionStorage.setItem("pp_dayPlan", JSON.stringify(tasks));
    }

    const day = getCurrentDayNumber(cfg.startDate);

    setPlan(p);
    setConfig(cfg);
    setDayTasks(tasks);
    setCurrentDay(day);
    setStreak(getStreak(cfg.planId));
    setCompletionPct(getCompletionPercent(cfg.planId, cfg.totalDays));
  }, [navigate]);

  // Refresh streak/completion when returning from check-in
  useEffect(() => {
    if (!config) return;
    const refresh = () => {
      setStreak(getStreak(config.planId));
      setCompletionPct(getCompletionPercent(config.planId, config.totalDays));
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [config]);

  if (!plan || !config) return null;

  const todayTask = dayTasks.find((t) => t.day === currentDay);
  const completedCount = dayTasks.filter((t) => isDayComplete(config.planId, t.day)).length;

  function handleCheckin(day: number) {
    navigate(`/checkin?day=${day}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/results")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Results
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">PathPlan</span>
          </div>
          <button
            onClick={() => navigate("/analyze")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Stats bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {config.totalDays}-day learning plan
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Day {Math.min(currentDay, config.totalDays)} of {config.totalDays} ·{" "}
                {completedCount}/{dayTasks.length} tasks done
              </p>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-sm font-semibold px-3 py-1.5 rounded-xl">
                <Flame className="w-4 h-4" />
                {streak}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>{completionPct}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's highlight — shown only if not yet done */}
        {todayTask && !isDayComplete(config.planId, todayTask.day) && (
          <div className="bg-indigo-600 rounded-2xl p-6 text-white">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-2">
              Today — Day {currentDay}
            </p>
            <h2 className="text-xl font-bold mb-1">{todayTask.skillName}</h2>
            <p className="text-indigo-200 text-sm mb-4">{todayTask.resource.title}</p>
            <button
              onClick={() => handleCheckin(currentDay)}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Start check-in
            </button>
          </div>
        )}

        {/* All days */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Full schedule
          </h2>
          <div className="space-y-2">
            {dayTasks.map((task) => (
              <DayCard
                key={task.day}
                task={task}
                planId={config.planId}
                currentDay={currentDay}
                onCheckin={handleCheckin}
              />
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center pb-6">
          <button
            onClick={() => navigate("/plan-config")}
            className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
          >
            Change plan length
          </button>
        </div>
      </div>
    </div>
  );
}
