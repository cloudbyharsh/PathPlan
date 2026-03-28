"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { Quarter, CreateObjectivePayload } from "@/types";
import { CURRENT_QUARTER, CURRENT_YEAR } from "@/lib/utils";

interface KRDraft {
  id: string;
  title: string;
  start_value: string;
  target_value: string;
  unit: string;
}

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];
const CURRENT_YEARS = [2025, 2026, 2027];

function newKR(): KRDraft {
  return {
    id: Math.random().toString(36).slice(2),
    title: "",
    start_value: "0",
    target_value: "",
    unit: "%",
  };
}

export default function NewObjectivePage() {
  const { user, isLoading, createObjective } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quarter, setQuarter] = useState<Quarter>(CURRENT_QUARTER);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [keyResults, setKeyResults] = useState<KRDraft[]>([newKR()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  const addKR = () => {
    if (keyResults.length >= 5) return;
    setKeyResults((prev) => [...prev, newKR()]);
  };

  const removeKR = (id: string) => {
    if (keyResults.length <= 1) return;
    setKeyResults((prev) => prev.filter((kr) => kr.id !== id));
  };

  const updateKR = (id: string, field: keyof KRDraft, value: string) => {
    setKeyResults((prev) =>
      prev.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr))
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (title.trim().length < 5) errs.title = "Title must be at least 5 characters.";
    if (title.trim().length > 200) errs.title = "Title must be under 200 characters.";

    keyResults.forEach((kr, i) => {
      if (!kr.title.trim()) errs[`kr_${i}_title`] = "Required";
      if (!kr.target_value || isNaN(parseFloat(kr.target_value)))
        errs[`kr_${i}_target`] = "Enter a valid number";
      if (kr.start_value && isNaN(parseFloat(kr.start_value)))
        errs[`kr_${i}_start`] = "Enter a valid number";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateObjectivePayload = {
        title: title.trim(),
        description: description.trim(),
        quarter,
        year,
        key_results: keyResults.map((kr) => ({
          title: kr.title.trim(),
          start_value: parseFloat(kr.start_value) || 0,
          target_value: parseFloat(kr.target_value),
          unit: kr.unit.trim() || "%",
        })),
      };
      await createObjective(payload);
      router.push("/dashboard");
    } catch (_) {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My OKRs
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">New Objective</h1>
          <p className="text-gray-500 text-sm mb-8">
            Define what you want to achieve and how you'll measure it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Objective */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Objective
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Reduce early churn by improving 30-day onboarding"
                  maxLength={200}
                />
                {errors.title && (
                  <p className="text-xs text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Context, motivation, or scope for this objective"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quarter
                  </label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value as Quarter)}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    {QUARTERS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    {CURRENT_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Key Results */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Key Results{" "}
                  <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">
                    ({keyResults.length}/5)
                  </span>
                </h2>
              </div>
              <p className="text-xs text-gray-500 -mt-2">
                Define measurable outcomes. Add up to 5 key results.
              </p>

              <div className="space-y-5">
                {keyResults.map((kr, idx) => (
                  <div
                    key={kr.id}
                    className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">
                        KR {idx + 1}
                      </span>
                      {keyResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeKR(kr.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={kr.title}
                        onChange={(e) => updateKR(kr.id, "title", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g. Increase 30-day activation rate from 42% to 75%"
                      />
                      {errors[`kr_${idx}_title`] && (
                        <p className="text-xs text-red-600 mt-1">{errors[`kr_${idx}_title`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start value</label>
                        <input
                          type="number"
                          step="any"
                          value={kr.start_value}
                          onChange={(e) => updateKR(kr.id, "start_value", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Target <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={kr.target_value}
                          onChange={(e) => updateKR(kr.id, "target_value", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="100"
                        />
                        {errors[`kr_${idx}_target`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`kr_${idx}_target`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Unit</label>
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKR(kr.id, "unit", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="%"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {keyResults.length < 5 && (
                <button
                  type="button"
                  onClick={addKR}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Key Result
                </button>
              )}
            </section>

            {errors.form && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                {errors.form}
              </p>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <Button variant="secondary" className="w-full justify-center" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 justify-center"
                isLoading={isSubmitting}
              >
                Create Objective
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
