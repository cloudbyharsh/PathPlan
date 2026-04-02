import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Terminal, Target, BookOpen, Upload, CheckCircle, ArrowRight } from "lucide-react";

const ASCII_LOGO = `
 ██████╗  █████╗ ████████╗██╗  ██╗██████╗ ██╗      █████╗ ███╗   ██╗
 ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔══██╗██║     ██╔══██╗████╗  ██║
 ██████╔╝███████║   ██║   ███████║██████╔╝██║     ███████║██╔██╗ ██║
 ██╔═══╝ ██╔══██║   ██║   ██╔══██║██╔═══╝ ██║     ██╔══██║██║╚██╗██║
 ██║     ██║  ██║   ██║   ██║  ██║██║     ███████╗██║  ██║██║ ╚████║
 ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝`;

const BOOT_LINES = [
  "PathPlan OS v2.0.0 — initialising...",
  "loading skill-gap engine............[OK]",
  "loading learning-plan module........[OK]",
  "loading cv-parser....................[OK]",
  "all systems operational..............[OK]",
];

const FEATURES = [
  {
    icon: <Upload className="w-4 h-4" strokeWidth={2} />,
    cmd: "$ paste --cv --jd",
    title: "PASTE YOUR CV & JD",
    desc: "No uploads. No accounts. Paste your CV and the job description you're targeting.",
  },
  {
    icon: <Target className="w-4 h-4" strokeWidth={2} />,
    cmd: "$ analyse --match --gaps",
    title: "GET MATCH SCORE + GAP ANALYSIS",
    desc: "See exactly which skills you have, which are missing, and your alignment percentage.",
  },
  {
    icon: <BookOpen className="w-4 h-4" strokeWidth={2} />,
    cmd: "$ build --learning-plan",
    title: "RECEIVE A LEARNING PLAN",
    desc: "Curated courses, books, and projects — prioritised by what the employer actually needs.",
  },
];

const TESTIMONIALS = [
  {
    quote: "PathPlan showed me exactly what was missing. I closed the gap in 6 weeks and got the offer.",
    name: "priya_s",
    role: "associate-pm → senior-pm",
    score: 82,
  },
  {
    quote: "I was applying blind. PathPlan gave me a 63% match score and a clear 8-week plan.",
    name: "james_o",
    role: "analyst → product-manager",
    score: 63,
  },
  {
    quote: "The learning plan mapped exactly to the skills in the JD. First interview I got an offer.",
    name: "mei_l",
    role: "engineer → pm",
    score: 91,
  },
];

function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => { setDone(true); setTimeout(onDone, 400); }, 300);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className={`transition-opacity duration-500 ${done ? "opacity-0" : "opacity-100"}`}>
      {lines.map((line, i) => (
        <div key={i} className="text-[#33ff00] text-xs font-mono text-glow mb-1">{line}</div>
      ))}
    </div>
  );
}

function AsciiProgressBar({ value, max = 100, width = 20 }: { value: number; max?: number; width?: number }) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return (
    <span className="font-mono text-xs text-glow">
      [<span className="text-[#33ff00]">{"█".repeat(filled)}</span>
      <span className="text-[#1f521f]">{"░".repeat(empty)}</span>]
      {" "}{value}%
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [booted, setBooted] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    if (booted) setTimeout(() => setHeroVisible(true), 100);
  }, [booted]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono text-[#33ff00] relative">
      {/* CRT overlay */}
      <div className="crt-overlay" />

      {/* Nav */}
      <nav className="border-b border-[#1f521f] sticky top-0 bg-[#0a0a0a] z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#33ff00] text-glow" strokeWidth={2} />
            <span className="text-[#33ff00] font-bold text-sm text-glow tracking-widest uppercase">PathPlan</span>
            <span className="text-[#1f521f] text-xs ml-2">v2.0.0</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-[#1f521f]">user@pathplan:~$</span>
            <button
              onClick={() => navigate("/analyze")}
              className="text-[#ffb000] hover:text-[#0a0a0a] hover:bg-[#ffb000] border border-[#ffb000] px-3 py-1 transition-all text-glow-amber uppercase tracking-wider"
            >
              [ launch ]
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6">

        {/* Boot sequence */}
        {!booted && (
          <div className="py-12">
            <BootSequence onDone={() => setBooted(true)} />
          </div>
        )}

        {/* Hero */}
        {booted && (
          <div className={`transition-opacity duration-500 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
            <section className="py-16 border-b border-[#1f521f]">
              {/* ASCII Logo */}
              <pre className="text-[#33ff00] text-glow text-[6px] sm:text-[7px] md:text-[8px] leading-tight mb-8 overflow-x-auto hidden sm:block">
                {ASCII_LOGO}
              </pre>
              <div className="sm:hidden text-3xl font-bold text-glow tracking-widest mb-8 uppercase">PathPlan</div>

              {/* Status bar */}
              <div className="flex items-center gap-3 mb-8 text-xs">
                <span className="text-[#1f521f]">──────────────────────────────────────────────────────</span>
              </div>
              <div className="flex items-center gap-4 mb-8 text-xs flex-wrap">
                <span className="text-[#33ff00] text-glow">[STATUS: ONLINE]</span>
                <span className="text-[#1f521f]">│</span>
                <span className="text-[#ffb000] text-glow-amber">[FREE]</span>
                <span className="text-[#1f521f]">│</span>
                <span className="text-[#33ff00]">[NO ACCOUNT REQUIRED]</span>
                <span className="text-[#1f521f]">│</span>
                <span className="text-[#33ff00]">[INSTANT RESULTS]</span>
              </div>

              <div className="mb-4 text-[#1f521f] text-xs">root@pathplan:~$ ./run --mode=gap-analysis --help</div>
              <h1 className="text-3xl md:text-5xl font-bold text-[#33ff00] text-glow leading-tight mb-4 uppercase tracking-tight">
                Stop guessing.<br />
                <span className="text-[#ffb000] text-glow-amber">Know exactly</span> what's missing.
              </h1>
              <p className="text-sm text-[#33ff00]/70 max-w-2xl mb-8 leading-relaxed">
                PathPlan analyses your CV against any job description, identifies your skill gaps,
                and builds a personalised learning plan — so you apply with confidence, not hope.
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 mb-10 text-xs">
                {["[OK] instant results", "[OK] privacy-first · no data stored", "[OK] covers 100+ skills"].map((t) => (
                  <span key={t} className="text-[#33ff00] text-glow">{t}</span>
                ))}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate("/analyze")}
                  className="term-btn text-sm flex items-center gap-2"
                >
                  [ analyse my cv ] <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
                <span className="text-[#1f521f] text-xs">// takes 2 minutes · no sign-up</span>
              </div>
            </section>

            {/* How it works */}
            <section className="py-16 border-b border-[#1f521f]">
              <div className="text-[#1f521f] text-xs mb-2">root@pathplan:~$ ./how-it-works --steps</div>
              <h2 className="text-xl font-bold text-[#33ff00] text-glow uppercase tracking-widest mb-2">HOW IT WORKS</h2>
              <div className="text-[#1f521f] text-xs mb-8">// three steps from CV to learning plan</div>

              <div className="grid md:grid-cols-3 gap-0 border border-[#1f521f]">
                {FEATURES.map((f, i) => (
                  <div key={i} className={`p-6 ${i < 2 ? "border-r border-[#1f521f]" : ""}`}>
                    <div className="term-pane-header mb-4 text-xs">
                      +─── STEP {i + 1} ───+
                    </div>
                    <div className="text-[#ffb000] text-xs mb-3 text-glow-amber flex items-center gap-2">
                      {f.icon} {f.cmd}
                    </div>
                    <h3 className="text-sm font-bold text-[#33ff00] text-glow mb-2 uppercase tracking-wide">{f.title}</h3>
                    <p className="text-xs text-[#33ff00]/60 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 border-b border-[#1f521f]">
              <div className="text-[#1f521f] text-xs mb-2">root@pathplan:~$ ./logs --users --success</div>
              <h2 className="text-xl font-bold text-[#33ff00] text-glow uppercase tracking-widest mb-2">USER LOGS</h2>
              <div className="text-[#1f521f] text-xs mb-8">// job seekers making real moves</div>

              <div className="grid md:grid-cols-3 gap-4">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} className="term-pane p-0">
                    <div className="term-pane-header">
                      +─── {t.name} ───+
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-[#1f521f] mb-2">match_score: <AsciiProgressBar value={t.score} width={12} /></div>
                      <p className="text-xs text-[#33ff00]/80 leading-relaxed mb-3">"{t.quote}"</p>
                      <div className="text-xs text-[#ffb000] text-glow-amber">$ role: {t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="py-16 border-b border-[#1f521f]">
              <div className="border border-[#33ff00] p-8 text-center">
                <div className="text-[#1f521f] text-xs mb-4">// system ready · awaiting input</div>
                <h2 className="text-2xl font-bold text-[#33ff00] text-glow uppercase tracking-widest mb-3">
                  YOUR NEXT ROLE STARTS<br />WITH KNOWING THE GAP.
                </h2>
                <p className="text-sm text-[#33ff00]/60 mb-8">
                  Paste your CV and a job description. PathPlan does the rest.
                </p>
                <button
                  onClick={() => navigate("/analyze")}
                  className="term-btn text-sm flex items-center gap-2 mx-auto"
                >
                  [ get started — it's free ] <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </section>

            {/* Footer */}
            <footer className="py-8">
              <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-[#33ff00]" strokeWidth={2} />
                  <span className="text-[#33ff00] font-bold tracking-widest uppercase text-glow">PathPlan</span>
                  <span className="text-[#1f521f]">// cv gap analysis engine</span>
                </div>
                <p className="text-[#1f521f]">
                  © 2026 PathPlan · built by{" "}
                  <a
                    href="https://github.com/cloudbyharsh"
                    className="text-[#33ff00] underline hover:text-glow"
                    target="_blank"
                    rel="noreferrer"
                  >
                    cloudbyharsh
                  </a>
                </p>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}import { useNavigate } from "react-router";
import { ArrowRight, CheckCircle, Zap, Target, BookOpen, Upload } from "lucide-react";

const FEATURES = [
  {
    icon: <Upload className="w-5 h-5 text-indigo-600" />,
    title: "Paste your CV & job description",
    desc: "No uploads, no accounts. Just paste your CV and the JD you're targeting.",
  },
  {
    icon: <Target className="w-5 h-5 text-indigo-600" />,
    title: "Get a match score + gap analysis",
    desc: "See exactly which skills you have, which you're missing, and how well you align.",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
    title: "Receive a personalised learning plan",
    desc: "Curated courses, books, and projects — prioritised by what the employer actually needs.",
  },
];

const TESTIMONIALS = [
  {
    quote: "PathPlan showed me exactly what was missing from my PM application. I closed the gap in 6 weeks and got the offer.",
    name: "Priya S.",
    role: "Associate PM → Senior PM",
    initials: "PS",
  },
  {
    quote: "I was applying blind. PathPlan gave me a 63% match score and a clear 8-week plan. Game changer.",
    name: "James O.",
    role: "Analyst → Product Manager",
    initials: "JO",
  },
  {
    quote: "The learning plan mapped exactly to the skills in the JD. First interview I got an offer.",
    name: "Mei L.",
    role: "Engineer → PM",
    initials: "ML",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 text-lg">PathPlan</span>
          </div>
          <button
            onClick={() => navigate("/analyze")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Try it free →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          Free · No account required
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
          Stop guessing.<br />
          <span className="text-indigo-600">Know exactly</span> what's missing.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          PathPlan analyses your CV against any job description, identifies your skill gaps, and builds a personalised learning plan — so you apply with confidence, not hope.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-base"
          >
            Analyse my CV
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-400">Takes 2 minutes. No sign-up.</p>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          {["Instant results", "Privacy-first (no data stored)", "Covers 100+ skills"].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">How it works</h2>
          <p className="text-gray-500 text-center mb-12">Three steps from CV to learning plan.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <div className="text-xs font-bold text-indigo-500 mb-1">Step {i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Used by job seekers making real moves
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-indigo-700 text-xs font-bold">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your next role starts with knowing the gap.
          </h2>
          <p className="text-indigo-200 mb-8">
            Paste your CV and a job description. PathPlan does the rest.
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-base"
          >
            Get started — it's free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">PathPlan</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 PathPlan · Built by{" "}
            <a
              href="https://github.com/cloudbyharsh"
              className="underline hover:text-indigo-600 transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              cloudbyharsh
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
