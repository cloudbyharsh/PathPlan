import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft, Terminal, Lightbulb } from "lucide-react";
import { analyzeMatch } from "@/lib/analyzer";
import { buildLearningPlan } from "@/lib/learningData";

const CV_PLACEHOLDER = `Senior Product Manager — 5 years experience

Skills: Product roadmap, stakeholder management, agile, user research, SQL, data analysis, A/B testing, Jira, Figma

Experience:
- Led cross-functional squad of 8 (eng, design, data) to ship a retention feature reducing churn by 22%
- Defined OKRs and quarterly planning process for a 30-person product team
- Ran 40+ user interviews to inform a 0-to-1 onboarding redesign

Education: BSc Computer Science, University of Toronto`;

const JD_PLACEHOLDER = `Senior Product Manager — Customer Success Platform

We're looking for a Senior PM to own our customer success tooling. You'll work closely with CS, Sales, and Engineering to build features that reduce churn and drive expansion revenue.

Required skills:
- Product management, product strategy, go-to-market
- Data analysis, SQL, A/B testing
- Stakeholder management, cross-functional leadership
- Python (for working with data pipelines)

Preferred:
- Customer success domain knowledge
- Machine learning (for churn prediction features)
- Tableau or Power BI`;

type Step = 1 | 2;

export default function Analyze() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [cv, setCv] = useState("");
  const [jd, setJd] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeLog, setAnalyzeLog] = useState<string[]>([]);

  const handleAnalyze = () => {
    if (!cv.trim() || !jd.trim()) return;
    setIsAnalyzing(true);
    const logs = [
      "$ initialising analysis engine...",
      "$ parsing cv input................[OK]",
      "$ parsing job description.........[OK]",
      "$ running skill-gap algorithm.....",
      "$ building learning plan..........",
      "$ analysis complete...............[OK]",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setAnalyzeLog((prev) => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        const analysis = analyzeMatch(cv, jd);
        const plan = buildLearningPlan(analysis.skillGaps);
        sessionStorage.setItem("pp_analysis", JSON.stringify(analysis));
        sessionStorage.setItem("pp_plan", JSON.stringify(plan));
        navigate("/results");
      }
    }, 180);
  };

  const canProceedStep1 = cv.trim().length >= 50;
  const canAnalyze = jd.trim().length >= 50;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono text-[#33ff00] relative">
      <div className="crt-overlay" />

      {/* Header */}
      <header className="border-b border-[#1f521f] sticky top-0 bg-[#0a0a0a] z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs text-[#1f521f] hover:text-[#33ff00] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" strokeWidth={2} />
            [ back ]
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#33ff00] text-glow" strokeWidth={2} />
            <span className="font-bold text-[#33ff00] text-glow text-sm tracking-widest uppercase">PathPlan</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Progress indicator */}
        <div className="flex items-center gap-4 mb-8 text-xs">
          <span className={step === 1 ? "text-[#33ff00] text-glow" : "text-[#ffb000] text-glow-amber"}>
            {step === 1 ? "►" : "✓"} [1] cv_input
          </span>
          <span className="text-[#1f521f]">──────────</span>
          <span className={step === 2 ? "text-[#33ff00] text-glow" : "text-[#1f521f]"}>
            {step === 2 ? "►" : "○"} [2] job_description
          </span>
          <span className="text-[#1f521f]">──────────</span>
          <span className="text-[#1f521f]">○ [3] analysis</span>
        </div>

        {/* Step 1 — CV */}
        {step === 1 && !isAnalyzing && (
          <div className="animate-fade-in">
            <div className="term-pane">
              <div className="term-pane-header">
                +─────────────── CV_INPUT.txt ───────────────+
                <button
                  onClick={() => setCv(CV_PLACEHOLDER)}
                  className="flex items-center gap-1 text-[#ffb000] hover:text-[#0a0a0a] hover:bg-[#ffb000] px-2 py-0 transition-all text-xs text-glow-amber"
                >
                  <Lightbulb className="w-3 h-3" strokeWidth={2} />
                  [load example]
                </button>
              </div>
              <div className="p-4">
                <div className="text-[#1f521f] text-xs mb-3">
                  // paste your cv below · plain text · no formatting needed
                </div>
                <div className="flex gap-2 text-xs text-[#1f521f] mb-1">
                  <span>user@pathplan:~/cv$</span>
                </div>
                <textarea
                  value={cv}
                  onChange={(e) => setCv(e.target.value)}
                  placeholder="paste your cv here..."
                  rows={16}
                  className="term-input w-full text-xs leading-relaxed"
                  autoFocus
                />
                <div className="mt-3 pt-3 border-t border-[#1f521f] flex items-center justify-between text-xs">
                  <span className={cv.length >= 50 ? "text-[#33ff00] text-glow" : "text-[#1f521f]"}>
                    {cv.length >= 50 ? "[OK]" : "[--]"} {cv.length} chars
                    {cv.length < 50 ? ` · need ${50 - cv.length} more` : " · ready"}
                  </span>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="term-btn text-xs flex items-center gap-2"
                  >
                    [ next: job description ] <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — JD */}
        {step === 2 && !isAnalyzing && (
          <div className="animate-fade-in">
            <div className="term-pane">
              <div className="term-pane-header">
                +─────────────── JOB_DESCRIPTION.txt ───────────────+
                <button
                  onClick={() => setJd(JD_PLACEHOLDER)}
                  className="flex items-center gap-1 text-[#ffb000] hover:text-[#0a0a0a] hover:bg-[#ffb000] px-2 py-0 transition-all text-xs text-glow-amber"
                >
                  <Lightbulb className="w-3 h-3" strokeWidth={2} />
                  [load example]
                </button>
              </div>
              <div className="p-4">
                <div className="text-[#1f521f] text-xs mb-3">
                  // paste the full JD · the more detail, the better the analysis
                </div>
                <div className="flex gap-2 text-xs text-[#1f521f] mb-1">
                  <span>user@pathplan:~/jd$</span>
                </div>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="paste the job description here..."
                  rows={16}
                  className="term-input w-full text-xs leading-relaxed"
                  autoFocus
                />
                <div className="mt-3 pt-3 border-t border-[#1f521f] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-[#1f521f] hover:text-[#33ff00] transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" strokeWidth={2} />
                    [ back ]
                  </button>
                  <div className="flex items-center gap-4">
                    <span className={jd.length >= 50 ? "text-[#33ff00] text-glow" : "text-[#1f521f]"}>
                      {jd.length >= 50 ? "[OK]" : "[--]"} {jd.length} chars
                    </span>
                    <button
                      onClick={handleAnalyze}
                      disabled={!canAnalyze || isAnalyzing}
                      className="term-btn text-xs flex items-center gap-2"
                    >
                      [ run analysis ] <ArrowRight className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing — boot log */}
        {isAnalyzing && (
          <div className="term-pane animate-fade-in">
            <div className="term-pane-header">
              +─────────────── ANALYSIS_ENGINE.run ───────────────+
            </div>
            <div className="p-6 space-y-1">
              {analyzeLog.map((line, i) => (
                <div key={i} className="text-xs text-[#33ff00] text-glow">{line}</div>
              ))}
              {analyzeLog.length < 6 && (
                <span className="text-[#33ff00] text-glow text-xs animate-blink">█</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft, FileText, Briefcase, Zap, Lightbulb } from "lucide-react";
import { analyzeMatch } from "@/lib/analyzer";
import { buildLearningPlan } from "@/lib/learningData";

const CV_PLACEHOLDER = `Senior Product Manager — 5 years experience

Skills: Product roadmap, stakeholder management, agile, user research, SQL, data analysis, A/B testing, Jira, Figma

Experience:
- Led cross-functional squad of 8 (eng, design, data) to ship a retention feature reducing churn by 22%
- Defined OKRs and quarterly planning process for a 30-person product team
- Ran 40+ user interviews to inform a 0-to-1 onboarding redesign

Education: BSc Computer Science, University of Toronto`;

const JD_PLACEHOLDER = `Senior Product Manager — Customer Success Platform

We're looking for a Senior PM to own our customer success tooling. You'll work closely with CS, Sales, and Engineering to build features that reduce churn and drive expansion revenue.

Required skills:
- Product management, product strategy, go-to-market
- Data analysis, SQL, A/B testing
- Stakeholder management, cross-functional leadership
- Python (for working with data pipelines)

Preferred:
- Customer success domain knowledge
- Machine learning (for churn prediction features)
- Tableau or Power BI`;

type Step = 1 | 2;

export default function Analyze() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [cv, setCv] = useState("");
  const [jd, setJd] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!cv.trim() || !jd.trim()) return;
    setIsAnalyzing(true);

    // Simulate slight delay for UX feel
    setTimeout(() => {
      const analysis = analyzeMatch(cv, jd);
      const plan = buildLearningPlan(analysis.skillGaps);
      sessionStorage.setItem("pp_analysis", JSON.stringify(analysis));
      sessionStorage.setItem("pp_plan", JSON.stringify(plan));
      navigate("/results");
    }, 1200);
  };

  const canProceedStep1 = cv.trim().length >= 50;
  const canAnalyze = jd.trim().length >= 50;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900">PathPlan</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-10">
          {[
            { n: 1, label: "Your CV" },
            { n: 2, label: "Job Description" },
          ].map(({ n, label }, idx) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step === n ? "text-indigo-600" : step > n ? "text-emerald-600" : "text-gray-400"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${step === n ? "border-indigo-600 bg-indigo-600 text-white" : step > n ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 text-gray-400"}`}>
                  {step > n ? "✓" : n}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {idx === 0 && <div className={`h-px w-8 ${step > 1 ? "bg-emerald-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — CV */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Paste your CV</h1>
              </div>
              <p className="text-gray-500 text-sm">Copy and paste the text from your CV. No formatting needed — plain text works best.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your CV</span>
                <button
                  onClick={() => setCv(CV_PLACEHOLDER)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Load example
                </button>
              </div>
              <textarea
                value={cv}
                onChange={(e) => setCv(e.target.value)}
                placeholder="Paste your CV here..."
                rows={16}
                className="w-full px-4 py-4 text-sm text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none leading-relaxed"
              />
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                <span className={`text-xs ${cv.length > 50 ? "text-emerald-600" : "text-gray-400"}`}>
                  {cv.length} characters {cv.length >= 50 ? "✓" : `(need at least 50)`}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Next: Job Description
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — JD */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Paste the job description</h1>
              </div>
              <p className="text-gray-500 text-sm">Copy and paste the full JD from the job posting. The more detail, the better the analysis.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Description</span>
                <button
                  onClick={() => setJd(JD_PLACEHOLDER)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Load example
                </button>
              </div>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                rows={16}
                className="w-full px-4 py-4 text-sm text-gray-700 placeholder:text-gray-300 resize-none focus:outline-none leading-relaxed"
              />
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                <span className={`text-xs ${jd.length > 50 ? "text-emerald-600" : "text-gray-400"}`}>
                  {jd.length} characters {jd.length >= 50 ? "✓" : `(need at least 50)`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm min-w-[160px] justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analysing…
                  </>
                ) : (
                  <>
                    Analyse match
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
