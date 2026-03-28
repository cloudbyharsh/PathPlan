import { useNavigate } from "react-router";
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
