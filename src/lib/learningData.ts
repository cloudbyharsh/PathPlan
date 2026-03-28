import { LearningModule, LearningPlan, LearningPhase, SkillGap } from "@/types";

const RESOURCE_MAP: Record<string, LearningModule> = {
  "product management": {
    skill: "Product Management",
    category: "Product & Strategy",
    priority: "required",
    weekEstimate: 4,
    why: "Core discipline for the role — covers discovery, prioritization, and delivery.",
    resources: [
      { title: "Product Management Fundamentals", provider: "Coursera (Google)", url: "https://coursera.org", duration: "6 hrs", type: "course", free: true },
      { title: "Inspired: How to Create Tech Products Customers Love", provider: "Marty Cagan", url: "https://www.svpg.com/books/inspired/", duration: "Book", type: "book", free: false },
      { title: "Product School Certification", provider: "Product School", url: "https://productschool.com", duration: "8 weeks", type: "certification", free: false },
    ],
  },
  "sql": {
    skill: "SQL",
    category: "Data & Analytics",
    priority: "required",
    weekEstimate: 2,
    why: "Essential for pulling your own data and validating metrics independently.",
    resources: [
      { title: "SQL for Data Analysis", provider: "Mode Analytics", url: "https://mode.com/sql-tutorial/", duration: "4 hrs", type: "course", free: true },
      { title: "SQLZoo Interactive Practice", provider: "SQLZoo", url: "https://sqlzoo.net", duration: "Self-paced", type: "practice", free: true },
      { title: "Advanced SQL for Analytics", provider: "Udemy", url: "https://udemy.com", duration: "8 hrs", type: "course", free: false },
    ],
  },
  "python": {
    skill: "Python",
    category: "Technical",
    priority: "required",
    weekEstimate: 4,
    why: "Enables data automation, scripting, and working directly with engineering.",
    resources: [
      { title: "Python for Everybody", provider: "Coursera (UMich)", url: "https://coursera.org", duration: "20 hrs", type: "course", free: true },
      { title: "Automate the Boring Stuff with Python", provider: "Al Sweigart (free)", url: "https://automatetheboringstuff.com", duration: "Book", type: "book", free: true },
      { title: "Real Python Tutorials", provider: "realpython.com", url: "https://realpython.com", duration: "Self-paced", type: "practice", free: false },
    ],
  },
  "data analysis": {
    skill: "Data Analysis",
    category: "Data & Analytics",
    priority: "required",
    weekEstimate: 3,
    why: "Translates usage data into product decisions — a top skill for modern PMs.",
    resources: [
      { title: "Google Data Analytics Certificate", provider: "Coursera", url: "https://coursera.org", duration: "6 months", type: "certification", free: false },
      { title: "Statistics for Data Science", provider: "Khan Academy", url: "https://khanacademy.org", duration: "Self-paced", type: "course", free: true },
      { title: "Think Stats (free ebook)", provider: "O'Reilly", url: "https://greenteapress.com/thinkstats2/", duration: "Book", type: "book", free: true },
    ],
  },
  "agile": {
    skill: "Agile",
    category: "Product & Strategy",
    priority: "required",
    weekEstimate: 1,
    why: "Standard delivery framework — most engineering teams run Agile/Scrum sprints.",
    resources: [
      { title: "Agile Fundamentals", provider: "Atlassian University", url: "https://university.atlassian.com", duration: "3 hrs", type: "course", free: true },
      { title: "Professional Scrum Master I (PSM I)", provider: "Scrum.org", url: "https://scrum.org", duration: "Self-study", type: "certification", free: false },
      { title: "Agile Practice Guide", provider: "PMI", url: "https://pmi.org", duration: "Book", type: "book", free: false },
    ],
  },
  "user research": {
    skill: "User Research",
    category: "Domain Knowledge",
    priority: "required",
    weekEstimate: 2,
    why: "Grounds product decisions in real user needs — reduces build-the-wrong-thing risk.",
    resources: [
      { title: "User Research Methods", provider: "Nielsen Norman Group", url: "https://nngroup.com", duration: "Videos + articles", type: "course", free: true },
      { title: "Just Enough Research", provider: "Erika Hall", url: "https://abookapart.com/products/just-enough-research", duration: "Book", type: "book", free: false },
      { title: "Maze — free research tool practice", provider: "Maze", url: "https://maze.co", duration: "Self-paced", type: "practice", free: true },
    ],
  },
  "a/b testing": {
    skill: "A/B Testing",
    category: "Data & Analytics",
    priority: "preferred",
    weekEstimate: 1,
    why: "Validates product changes with statistical rigour — expected at growth-stage companies.",
    resources: [
      { title: "A/B Testing (by Google)", provider: "Udacity", url: "https://udacity.com/course/ab-testing--ud257", duration: "8 hrs", type: "course", free: true },
      { title: "Trustworthy Online Controlled Experiments", provider: "Cambridge Press", url: "https://experimentguide.com", duration: "Book", type: "book", free: false },
    ],
  },
  "stakeholder management": {
    skill: "Stakeholder Management",
    category: "Leadership & Management",
    priority: "required",
    weekEstimate: 1,
    why: "PMs succeed or fail based on how well they align diverse stakeholders.",
    resources: [
      { title: "Influence Without Authority", provider: "LinkedIn Learning", url: "https://linkedin.com/learning", duration: "2 hrs", type: "course", free: false },
      { title: "Never Split the Difference", provider: "Chris Voss", url: "https://blackswanltd.com/the-book/", duration: "Book", type: "book", free: false },
    ],
  },
  "machine learning": {
    skill: "Machine Learning",
    category: "Technical",
    priority: "preferred",
    weekEstimate: 6,
    why: "Increasingly required to collaborate with ML engineers and scope AI features.",
    resources: [
      { title: "Machine Learning Specialization", provider: "Coursera (Andrew Ng)", url: "https://coursera.org", duration: "3 months", type: "certification", free: false },
      { title: "Hands-On Machine Learning with Scikit-Learn", provider: "O'Reilly", url: "https://oreilly.com", duration: "Book", type: "book", free: false },
      { title: "Fast.ai Practical Deep Learning", provider: "fast.ai", url: "https://fast.ai", duration: "Self-paced", type: "course", free: true },
    ],
  },
  "figma": {
    skill: "Figma",
    category: "Tools & Platforms",
    priority: "preferred",
    weekEstimate: 1,
    why: "Standard design tool — PMs who can wireframe accelerate the design-dev handoff.",
    resources: [
      { title: "Figma for Beginners", provider: "Figma (official)", url: "https://help.figma.com/hc/en-us/sections/4405269443991", duration: "4 hrs", type: "course", free: true },
      { title: "Figma Community templates", provider: "Figma Community", url: "https://figma.com/community", duration: "Self-paced", type: "practice", free: true },
    ],
  },
  "customer success": {
    skill: "Customer Success",
    category: "Domain Knowledge",
    priority: "required",
    weekEstimate: 2,
    why: "Critical domain knowledge for CS-adjacent product roles.",
    resources: [
      { title: "Customer Success: How Innovative Companies Are Reducing Churn", provider: "Nick Mehta", url: "https://gainsight.com/book/", duration: "Book", type: "book", free: false },
      { title: "Gainsight University", provider: "Gainsight", url: "https://university.gainsight.com", duration: "Self-paced", type: "course", free: true },
    ],
  },
  "tableau": {
    skill: "Tableau",
    category: "Data & Analytics",
    priority: "preferred",
    weekEstimate: 2,
    why: "Leading BI tool for self-serve data exploration and executive dashboards.",
    resources: [
      { title: "Tableau Public (free practice)", provider: "Tableau", url: "https://public.tableau.com", duration: "Self-paced", type: "practice", free: true },
      { title: "Tableau Desktop Specialist", provider: "Tableau", url: "https://tableau.com/learn/certification", duration: "8 hrs study", type: "certification", free: false },
    ],
  },
  "go-to-market": {
    skill: "Go-to-Market",
    category: "Product & Strategy",
    priority: "required",
    weekEstimate: 2,
    why: "PMs own the GTM plan for new features — pricing, positioning, launch sequencing.",
    resources: [
      { title: "The Launch Path", provider: "Product Marketing Alliance", url: "https://productmarketingalliance.com", duration: "Self-paced", type: "course", free: false },
      { title: "Obviously Awesome", provider: "April Dunford", url: "https://aprildunford.com/obviously-awesome/", duration: "Book", type: "book", free: false },
    ],
  },
  "jira": {
    skill: "Jira",
    category: "Tools & Platforms",
    priority: "preferred",
    weekEstimate: 1,
    why: "Industry-standard issue tracker — used by most Agile engineering teams.",
    resources: [
      { title: "Jira Fundamentals Badge", provider: "Atlassian University", url: "https://university.atlassian.com", duration: "2 hrs", type: "certification", free: true },
    ],
  },
  "competitive analysis": {
    skill: "Competitive Analysis",
    category: "Product & Strategy",
    priority: "preferred",
    weekEstimate: 1,
    why: "Informs positioning and helps identify white-space opportunities.",
    resources: [
      { title: "Competitive Intelligence Bootcamp", provider: "Crayon", url: "https://crayon.co/resources", duration: "Free guides", type: "course", free: true },
      { title: "Good Strategy Bad Strategy", provider: "Richard Rumelt", url: "https://richardrumelt.com", duration: "Book", type: "book", free: false },
    ],
  },
};

// Fallback module for skills without a specific entry
function buildFallbackModule(gap: SkillGap): LearningModule {
  return {
    skill: gap.skill.charAt(0).toUpperCase() + gap.skill.slice(1),
    category: gap.category,
    priority: gap.priority,
    weekEstimate: gap.priority === "required" ? 2 : 1,
    why: `Mentioned ${gap.priority === "required" ? "as a requirement" : "as preferred"} in the job description.`,
    resources: [
      {
        title: `Learn ${gap.skill}`,
        provider: "Coursera",
        url: "https://coursera.org/search?query=" + encodeURIComponent(gap.skill),
        duration: "Self-paced",
        type: "course",
        free: false,
      },
      {
        title: `${gap.skill} tutorials`,
        provider: "YouTube",
        url: "https://youtube.com/results?search_query=" + encodeURIComponent(gap.skill + " tutorial"),
        duration: "Self-paced",
        type: "practice",
        free: true,
      },
    ],
  };
}

export function buildLearningPlan(skillGaps: SkillGap[]): LearningPlan {
  const required = skillGaps.filter((g) => g.priority === "required");
  const preferred = skillGaps.filter((g) => g.priority === "preferred");
  const ordered = [...required, ...preferred].slice(0, 8);

  const modules: LearningModule[] = ordered.map((gap) => {
    const key = gap.skill.toLowerCase();
    const template = RESOURCE_MAP[key];
    if (template) {
      return { ...template, priority: gap.priority };
    }
    return buildFallbackModule(gap);
  });

  const totalWeeks = modules.reduce((sum, m) => sum + m.weekEstimate, 0);

  // Build 3-phase plan
  const req = modules.filter((m) => m.priority === "required");
  const pref = modules.filter((m) => m.priority === "preferred");

  let weekCursor = 1;
  const phase1Weeks = req.slice(0, Math.ceil(req.length / 2)).reduce((s, m) => s + m.weekEstimate, 0) || 2;
  const phase2Weeks = req.slice(Math.ceil(req.length / 2)).reduce((s, m) => s + m.weekEstimate, 0) || 2;
  const phase3Weeks = pref.reduce((s, m) => s + m.weekEstimate, 0) || 2;

  const phases: LearningPhase[] = [
    {
      name: "Foundation",
      weeks: `Weeks ${weekCursor}–${weekCursor + phase1Weeks - 1}`,
      focus: req.slice(0, Math.ceil(req.length / 2)).map((m) => m.skill),
      goal: "Close the highest-priority skill gaps that directly block your application.",
    },
    {
      name: "Core Skills",
      weeks: `Weeks ${weekCursor + phase1Weeks}–${weekCursor + phase1Weeks + phase2Weeks - 1}`,
      focus: req.slice(Math.ceil(req.length / 2)).map((m) => m.skill),
      goal: "Build depth in remaining required skills and start portfolio projects.",
    },
    {
      name: "Polish & Preferred",
      weeks: `Weeks ${weekCursor + phase1Weeks + phase2Weeks}–${totalWeeks}`,
      focus: pref.map((m) => m.skill),
      goal: "Add preferred skills to differentiate your candidacy and strengthen your story.",
    },
  ].filter((p) => p.focus.length > 0);

  return { totalWeeks, modules, phases };
}
