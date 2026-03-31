import { DayTask, LearningModule, PlanConfig, SkillGap } from "@/types";

/** Micro-task generator based on resource type */
function microTaskFor(resourceType: LearningModule["resources"][0]["type"], skill: string): string {
  const tasks: Record<string, string> = {
    course: `Complete today's module section and write 3 key takeaways about ${skill}.`,
    book: `Read the assigned chapter and summarise the main concept in your own words.`,
    practice: `Complete the practice exercises and note any questions that came up.`,
    certification: `Study the exam objective for today and complete 10 practice questions.`,
    project: `Build or extend the project feature — commit your work to GitHub.`,
  };
  return tasks[resourceType] ?? `Study ${skill} and document one new thing you learned.`;
}

/**
 * Distributes learning modules across the chosen number of days.
 * - Required skills fill days first, preferred after.
 * - Each resource within a module = 1 day slot.
 * - If modules exceed totalDays, extra modules are trimmed (lowest priority last).
 */
export function buildDayPlan(
  _skillGaps: SkillGap[],
  modules: LearningModule[],
  config: PlanConfig
): DayTask[] {
  const { totalDays } = config;

  // Order: required first, preferred after
  const ordered = [
    ...modules.filter((m) => m.priority === "required"),
    ...modules.filter((m) => m.priority === "preferred"),
  ];

  const tasks: DayTask[] = [];
  let day = 1;

  for (const module of ordered) {
    if (day > totalDays) break;
    for (const resource of module.resources) {
      if (day > totalDays) break;
      tasks.push({
        day,
        skillName: module.skill,
        skillCategory: module.category,
        priority: module.priority,
        why: module.why,
        resource,
        microTask: microTaskFor(resource.type, module.skill),
      });
      day++;
    }

    // If a skill has fewer resources than its weekEstimate*2 suggests,
    // pad with a review/practice day so the plan feels substantial
    const targetDays = Math.min(Math.round(module.weekEstimate * 2), 4);
    const resourcesUsed = module.resources.length;
    if (resourcesUsed < targetDays && day <= totalDays) {
      tasks.push({
        day,
        skillName: module.skill,
        skillCategory: module.category,
        priority: module.priority,
        why: module.why,
        resource: {
          title: `${module.skill} — practice & review`,
          provider: "Self-directed",
          url: `https://www.google.com/search?q=${encodeURIComponent(module.skill + " practice exercises")}`,
          duration: "1–2 hrs",
          type: "practice",
          free: true,
        },
        microTask: `Apply what you've learned: build a small project or solve 5 practice problems using ${module.skill}.`,
      });
      day++;
    }
  }

  // If we have empty days left, fill with review tasks
  const coveredSkills = [...new Set(tasks.map((t) => t.skillName))];
  let fillIdx = 0;
  while (day <= totalDays && coveredSkills.length > 0) {
    const skill = coveredSkills[fillIdx % coveredSkills.length];
    const mod = ordered.find((m) => m.skill === skill);
    if (mod) {
      tasks.push({
        day,
        skillName: skill,
        skillCategory: mod.category,
        priority: mod.priority,
        why: mod.why,
        resource: {
          title: `${skill} — deep dive & consolidation`,
          provider: "Self-directed",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " advanced tutorial")}`,
          duration: "1 hr",
          type: "practice",
          free: true,
        },
        microTask: `Review your notes from earlier ${skill} sessions and identify your weakest area. Spend today filling that gap.`,
      });
    }
    day++;
    fillIdx++;
  }

  return tasks.slice(0, totalDays);
}
