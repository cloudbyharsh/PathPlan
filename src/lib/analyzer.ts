import { AnalysisResult, CVSummary, JDSummary, SkillGap, SkillCategory } from "@/types";

// ─── Skill taxonomy ────────────────────────────────────────────────────────

const SKILL_TAXONOMY: Record<SkillCategory, string[]> = {
  Technical: [
    "python", "javascript", "typescript", "java", "sql", "r", "go", "scala",
    "react", "node.js", "django", "flask", "aws", "azure", "gcp", "docker",
    "kubernetes", "terraform", "git", "rest api", "graphql", "html", "css",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "spark", "hadoop", "kafka", "redis", "postgresql", "mongodb",
  ],
  "Data & Analytics": [
    "data analysis", "data visualization", "tableau", "power bi", "looker",
    "excel", "google analytics", "mixpanel", "amplitude", "a/b testing",
    "statistical analysis", "regression", "forecasting", "bi", "dashboards",
    "etl", "data modeling", "dbt", "airflow", "snowflake", "bigquery",
  ],
  "Product & Strategy": [
    "product management", "product strategy", "product roadmap", "okrs",
    "user stories", "acceptance criteria", "agile", "scrum", "kanban",
    "sprint planning", "backlog grooming", "product discovery", "mvp",
    "go-to-market", "market research", "competitive analysis", "pricing",
    "feature prioritization", "rice", "kano", "jobs to be done",
    "product led growth", "plg",
  ],
  "Leadership & Management": [
    "team leadership", "stakeholder management", "cross-functional",
    "people management", "mentoring", "coaching", "hiring", "performance review",
    "budget management", "project management", "program management", "pmp",
    "change management", "strategic planning", "executive communication",
  ],
  Communication: [
    "communication", "presentation", "public speaking", "writing",
    "technical writing", "documentation", "storytelling", "negotiation",
    "customer communication", "reporting",
  ],
  "Domain Knowledge": [
    "fintech", "healthtech", "edtech", "saas", "b2b", "b2c", "ecommerce",
    "marketplace", "enterprise", "startup", "customer success", "sales",
    "marketing", "growth", "retention", "churn", "nps", "customer journey",
    "ux", "design thinking", "user research", "usability testing",
    "compliance", "gdpr", "security", "ai", "llm", "generative ai",
  ],
  "Tools & Platforms": [
    "jira", "confluence", "notion", "asana", "linear", "figma", "miro",
    "slack", "salesforce", "hubspot", "zendesk", "intercom", "segment",
    "stripe", "shopify", "zapier", "airtable", "google workspace",
    "microsoft office", "excel", "powerpoint",
  ],
};

const ALL_SKILLS = Object.entries(SKILL_TAXONOMY).flatMap(([cat, skills]) =>
  skills.map((s) => ({ skill: s, category: cat as SkillCategory }))
);

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 /+#.]/g, " ").replace(/\s+/g, " ").trim();
}

function extractSkills(text: string): string[] {
  const norm = normalise(text);
  return ALL_SKILLS
    .filter(({ skill }) => norm.includes(skill))
    .map(({ skill }) => skill)
    .filter((s, i, arr) => arr.indexOf(s) === i);
}

function getCategory(skill: string): SkillCategory {
  return (
    ALL_SKILLS.find((e) => e.skill === skill)?.category ?? "Technical"
  );
}

// ─── Seniority detection ───────────────────────────────────────────────────

function detectSeniority(text: string): JDSummary["seniority"] {
  const t = text.toLowerCase();
  if (/\b(vp|director|head of|principal|staff)\b/.test(t)) return "lead";
  if (/\bsenior\b/.test(t)) return "senior";
  if (/\b(mid[- ]?level|3\+|4\+|5\+ years)\b/.test(t)) return "mid";
  if (/\b(junior|entry[- ]?level|1\+|0–2|0-2 years|new grad)\b/.test(t)) return "junior";
  return "unknown";
}

// ─── Experience extraction ─────────────────────────────────────────────────

function extractYearsOfExperience(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  return match ? parseInt(match[1]) : null;
}

// ─── Education extraction ──────────────────────────────────────────────────

function extractEducation(text: string): string | null {
  const t = text.toLowerCase();
  if (/\bphd\b|doctorate/.test(t)) return "PhD";
  if (/\bmba\b/.test(t)) return "MBA";
  if (/master'?s?|m\.sc|msc|m\.eng/.test(t)) return "Master's";
  if (/bachelor'?s?|b\.sc|bsc|b\.eng|b\.a\b/.test(t)) return "Bachelor's";
  if (/\bdiploma\b/.test(t)) return "Diploma";
  return null;
}

// ─── Role extraction ───────────────────────────────────────────────────────

function extractRole(jdText: string): string {
  const firstLine = jdText.split("\n").find((l) => l.trim().length > 3)?.trim() ?? "";
  if (firstLine.length < 80) return firstLine;
  const match = jdText.match(
    /(?:role|position|title|job title)[:\s]+([^\n,]{5,60})/i
  );
  return match?.[1]?.trim() ?? "the role";
}

function extractCompany(jdText: string): string | null {
  const match = jdText.match(/(?:at|@|company[:\s]+)\s*([A-Z][a-zA-Z\s&.,-]{2,40})/);
  return match?.[1]?.trim() ?? null;
}

// ─── Required vs preferred split ──────────────────────────────────────────

function splitRequiredPreferred(
  jdText: string,
  skills: string[]
): { required: string[]; preferred: string[] } {
  const norm = normalise(jdText);
  const preferredSection = norm.match(
    /(?:preferred|nice[- ]to[- ]have|bonus|plus|desired|ideally)[\s\S]{0,600}/
  )?.[0] ?? "";

  const preferred = skills.filter((s) => preferredSection.includes(s));
  const required = skills.filter((s) => !preferred.includes(s));
  return { required, preferred };
}

// ─── Main analyser ────────────────────────────────────────────────────────

export function analyzeMatch(cvText: string, jdText: string): AnalysisResult {
  const cvSkills = extractSkills(cvText);
  const jdSkills = extractSkills(jdText);

  const { required: jdRequired, preferred: jdPreferred } = splitRequiredPreferred(jdText, jdSkills);

  const strongMatches = cvSkills.filter((s) => jdSkills.includes(s));
  const missingRequired = jdRequired.filter((s) => !cvSkills.includes(s));
  const missingPreferred = jdPreferred.filter((s) => !cvSkills.includes(s));
  const extraSkills = cvSkills.filter((s) => !jdSkills.includes(s)).slice(0, 8);

  // Score: weight required skills 2x over preferred
  const totalWeight = jdRequired.length * 2 + jdPreferred.length;
  const earnedWeight =
    strongMatches.filter((s) => jdRequired.includes(s)).length * 2 +
    strongMatches.filter((s) => jdPreferred.includes(s)).length;
  const rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 50;
  const matchScore = Math.min(98, Math.max(12, Math.round(rawScore)));

  const skillGaps: SkillGap[] = [
    ...missingRequired.map((skill) => ({
      skill,
      priority: "required" as const,
      category: getCategory(skill),
    })),
    ...missingPreferred.map((skill) => ({
      skill,
      priority: "preferred" as const,
      category: getCategory(skill),
    })),
  ];

  const cvSummary: CVSummary = {
    detectedSkills: cvSkills,
    yearsOfExperience: extractYearsOfExperience(cvText),
    educationLevel: extractEducation(cvText),
  };

  const jdSummary: JDSummary = {
    role: extractRole(jdText),
    company: extractCompany(jdText),
    requiredSkills: jdRequired,
    preferredSkills: jdPreferred,
    seniority: detectSeniority(jdText),
  };

  return {
    matchScore,
    strongMatches,
    skillGaps,
    extraSkills,
    cvSummary,
    jdSummary,
  };
}
