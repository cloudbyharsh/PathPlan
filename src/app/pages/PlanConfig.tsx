import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock, Zap } from "lucide-react";
import type { LearningPlan, PlanConfig } from "@/types";

const DAY_OPTIONS = [
  {
    days: 14 as const,
    label: "14 days",
    subtitle: "Sprint",
    description: "Tight focus on the highest-priority gaps. Best for roles you're applying to right now.",
    color: "border-red-200 bg-red-50 text-red-700",
    activeColor: "border-red-500 bg-red-500 text-white",
    dotColor: "bg-red-500",
  },
  {
    days: 21 as const,
    label: "21 days",
    subtitle: "Balanced",
    description: "Covers required and most preferred skills without burning out. The most popular choice.",
    color: "border-indigo-200 bg-indigo-50 text-indigo-700",
    activeColor: "border-indigo-600 bg-indigo-600 text-white",
    dotColor: "bg-indigo-600",
    recommended: true,
  },
  {
    days: 30 as const,
    label: "30 days",
    subtitle: "Deep dive",
    description: "Full coverage with practice projects and consolidation days. Best for career switchers.",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    activeColor: "border-emerald-600 bg-emerald-600 text-white",
    dotColor: "bg-emerald-600",
  },
];

function generatePlanId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function PlanConfig() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [selectedDays, setSelectedDays] = useState<14 | 21 | 30>(21);
  const [hoursPerDay, setHoursPerDay] = useState(1.5);

  useEffect(() => {
    const stored = sessionStorage.getItem("pp_plan");
    if (!stored) { navigate("/analyze"); return; }
    setPlan(JSON.parse(stored) as LearningPlan);
  }, [navigate]);

  if (!plan) return null;

  const totalHours = Math.round(selectedDays * hoursPerDay);

  function handleStart() {
    const config: PlanConfig = {
      totalDays: selectedDays,
      hoursPerDay,
      startDate: new Date().toISOString(),
      planId: generatePlanId(),
    };
    // Store in both sessionStorage (current session) and localStorage (persistence)
    sessionStorage.setItem("pp_planConfig", JSON.stringify(config));
    localStorage.setItem("pp_activeConfig", JSON.stringify(config));
    navigate("/plan");
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
            <ArrowLeft className="w-4 h-4" /> Back to results
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">PathPlan</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure your study plan</h1>
          <p className="text-gray-500">
            You have <span className="font-semibold text-gray-700">{plan.modules.length} skills</span> to develop.
            Choose how long you want to commit and PathPlan will build a day-by-day schedule.
          </p>
        </div>

        {/* Day options */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Commitment length</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {DAY_OPTIONS.map((opt) => {
              const isSelected = selectedDays === opt.days;
              return (
                <button
                  key={opt.days}
                  onClick={() => setSelectedDays(opt.days)}
                  className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                      : "border-gray-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  {opt.recommended && (
                    <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
                    }`}>
                      Popular
                    </span>
                  )}
                  <p className={`text-2xl font-bold mb-0.5 ${isSelected ? "text-white" : "text-gray-900"}`}>
                    {opt.days}
                  </p>
                  <p className={`text-sm font-medium ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                    days
                  </p>
                  <p className={`text-xs mt-2 leading-relaxed ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hours per day */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Hours per day</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600">{hoursPerDay}h</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.5}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>30 min</span>
            <span>4 hours</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{selectedDays}</p>
              <p className="text-xs text-gray-500 mt-0.5">days</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{hoursPerDay}h</p>
              <p className="text-xs text-gray-500 mt-0.5">per day</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{totalHours}h</p>
              <p className="text-xs text-gray-500 mt-0.5">total</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            PathPlan will divide your <strong className="text-gray-700">{plan.modules.length} skills</strong> into{" "}
            <strong className="text-gray-700">one resource and one task per day</strong> — so you always know exactly what to do.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold text-base px-6 py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Build my {selectedDays}-day plan
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
