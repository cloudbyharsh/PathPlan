export interface SkillMatch {
  skill: string;
  inCV: boolean;
  inJD: boolean;
  priority: "required" | "preferred" | "bonus";
}

export interface AnalysisResult {
  matchScore: number;               // 0–100
  strongMatches: string[];          // skills in both CV and JD
  skillGaps: SkillGap[];            // skills in JD but not CV
  extraSkills: string[];            // skills in CV but not JD (bonuses)
  cvSummary: CVSummary;
  jdSummary: JDSummary;
}

export interface SkillGap {
  skill: string;
  priority: "required" | "preferred";
  category: SkillCategory;
}

export interface CVSummary {
  detectedSkills: string[];
  yearsOfExperience: number | null;
  educationLevel: string | null;
}

export interface JDSummary {
  role: string;
  company: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: "junior" | "mid" | "senior" | "lead" | "unknown";
}

export type SkillCategory =
  | "Technical"
  | "Data & Analytics"
  | "Product & Strategy"
  | "Leadership & Management"
  | "Communication"
  | "Domain Knowledge"
  | "Tools & Platforms";

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
  duration: string;
  type: "course" | "book" | "practice" | "certification" | "project";
  free: boolean;
}

export interface LearningModule {
  skill: string;
  category: SkillCategory;
  priority: "required" | "preferred";
  weekEstimate: number;
  resources: LearningResource[];
  why: string;
}

export interface LearningPlan {
  totalWeeks: number;
  modules: LearningModule[];
  phases: LearningPhase[];
}

export interface LearningPhase {
  name: string;
  weeks: string;
  focus: string[];
  goal: string;
}
