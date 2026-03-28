export type Role = "employee" | "manager" | "admin";

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export type OKRStatus = "on_track" | "at_risk" | "off_track" | "completed";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  team_id: string;
  avatar_initials: string;
}

export interface Team {
  id: string;
  name: string;
  manager_id: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  start_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressUpdate {
  id: string;
  key_result_id: string;
  submitted_by: string;
  submitted_by_name: string;
  value: number;
  note: string;
  created_at: string;
}

export interface Objective {
  id: string;
  owner_id: string;
  owner_name: string;
  team_id: string;
  title: string;
  description: string;
  quarter: Quarter;
  year: number;
  status: OKRStatus;
  key_results: KeyResult[];
  created_at: string;
  updated_at: string;
}

export interface TeamEmployee {
  user: User;
  objectives: Objective[];
}

export interface CreateObjectivePayload {
  title: string;
  description: string;
  quarter: Quarter;
  year: number;
  key_results: {
    title: string;
    start_value: number;
    target_value: number;
    unit: string;
  }[];
}

export interface ProgressUpdatePayload {
  value: number;
  note: string;
}
