import { type ClassValue, clsx } from "clsx";
import { KeyResult, OKRStatus, Objective, Quarter } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getProgressPercent(kr: KeyResult): number {
  const range = kr.target_value - kr.start_value;
  if (range === 0) return 100;
  const progress = kr.current_value - kr.start_value;
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
}

export function getQuarterDateRange(quarter: Quarter, year: number): { start: Date; end: Date } {
  const ranges: Record<Quarter, { start: [number, number]; end: [number, number] }> = {
    Q1: { start: [0, 1], end: [2, 31] },
    Q2: { start: [3, 1], end: [5, 30] },
    Q3: { start: [6, 1], end: [8, 30] },
    Q4: { start: [9, 1], end: [11, 31] },
  };
  const r = ranges[quarter];
  return {
    start: new Date(year, r.start[0], r.start[1]),
    end: new Date(year, r.end[0], r.end[1]),
  };
}

export function getExpectedProgress(quarter: Quarter, year: number): number {
  const now = new Date();
  const { start, end } = getQuarterDateRange(quarter, year);

  if (now < start) return 0;
  if (now > end) return 100;

  const totalDays = end.getTime() - start.getTime();
  const elapsedDays = now.getTime() - start.getTime();
  return Math.round((elapsedDays / totalDays) * 100);
}

export function calculateStatus(
  kr: KeyResult,
  quarter: Quarter,
  year: number
): OKRStatus {
  const progressPct = getProgressPercent(kr);
  if (progressPct >= 100) return "completed";

  const expectedPct = getExpectedProgress(quarter, year);

  if (progressPct >= expectedPct - 10) return "on_track";
  if (progressPct >= expectedPct - 25) return "at_risk";
  return "off_track";
}

export function deriveObjectiveStatus(objective: Objective): OKRStatus {
  if (!objective.key_results || objective.key_results.length === 0) return "on_track";

  const statuses = objective.key_results.map((kr) =>
    calculateStatus(kr, objective.quarter, objective.year)
  );

  if (statuses.includes("off_track")) return "off_track";
  if (statuses.includes("at_risk")) return "at_risk";
  if (statuses.every((s) => s === "completed")) return "completed";
  return "on_track";
}

export function getStatusLabel(status: OKRStatus): string {
  const labels: Record<OKRStatus, string> = {
    on_track: "On Track",
    at_risk: "At Risk",
    off_track: "Off Track",
    completed: "Completed",
  };
  return labels[status];
}

export function getStatusColors(status: OKRStatus) {
  const colors: Record<OKRStatus, { bg: string; text: string; dot: string; bar: string }> = {
    on_track: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
    },
    at_risk: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
    },
    off_track: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
      bar: "bg-red-500",
    },
    completed: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
      bar: "bg-indigo-500",
    },
  };
  return colors[status];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const CURRENT_QUARTER: Quarter = "Q2";
export const CURRENT_YEAR = 2026;
