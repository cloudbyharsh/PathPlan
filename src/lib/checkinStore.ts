import { CheckInEntry } from "@/types";

const storageKey = (planId: string) => `pp_checkins_${planId}`;

export function getCheckins(planId: string): CheckInEntry[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(planId)) ?? "[]");
  } catch {
    return [];
  }
}

export function markDayComplete(entry: CheckInEntry): void {
  const all = getCheckins(entry.planId);
  const idx = all.findIndex((c) => c.day === entry.day);
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  localStorage.setItem(storageKey(entry.planId), JSON.stringify(all));
}

export function isDayComplete(planId: string, day: number): boolean {
  return getCheckins(planId).some((c) => c.day === day);
}

export function getCheckinForDay(planId: string, day: number): CheckInEntry | undefined {
  return getCheckins(planId).find((c) => c.day === day);
}

export function getStreak(planId: string): number {
  const days = getCheckins(planId)
    .map((c) => c.day)
    .sort((a, b) => a - b);
  if (!days.length) return 0;
  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    if (days[i] - days[i - 1] === 1) streak++;
    else break;
  }
  return streak;
}

/** Returns 1-based day number relative to the plan start date */
export function getCurrentDayNumber(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function getCompletionPercent(planId: string, totalDays: number): number {
  return Math.round((getCheckins(planId).length / totalDays) * 100);
}
