"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  User,
  Objective,
  ProgressUpdate,
  CreateObjectivePayload,
  ProgressUpdatePayload,
  OKRStatus,
} from "@/types";
import {
  MOCK_USERS,
  MOCK_OBJECTIVES,
  MOCK_PROGRESS_UPDATES,
} from "@/lib/mockData";
import {
  generateId,
  deriveObjectiveStatus,
  getProgressPercent,
} from "@/lib/utils";

interface AppContextValue {
  user: User | null;
  objectives: Objective[];
  progressUpdates: ProgressUpdate[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createObjective: (payload: CreateObjectivePayload) => Promise<Objective>;
  updateObjectiveStatus: (id: string, status: OKRStatus) => void;
  deleteObjective: (id: string) => void;
  addProgressUpdate: (
    keyResultId: string,
    objectiveId: string,
    payload: ProgressUpdatePayload
  ) => Promise<void>;
  getUpdatesForKR: (keyResultId: string) => ProgressUpdate[];
  getObjectivesForUser: (userId: string) => Objective[];
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "okr_tracker_state";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>(MOCK_OBJECTIVES);
  const [progressUpdates, setProgressUpdates] =
    useState<ProgressUpdate[]>(MOCK_PROGRESS_UPDATES);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { userId, objectives: storedObjectives, progressUpdates: storedUpdates } = JSON.parse(stored);
        const foundUser = MOCK_USERS.find((u) => u.id === userId);
        if (foundUser) setUser(foundUser);
        if (storedObjectives) setObjectives(storedObjectives);
        if (storedUpdates) setProgressUpdates(storedUpdates);
      }
    } catch (_) {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ userId: user?.id, objectives, progressUpdates })
      );
    }
  }, [user, objectives, progressUpdates, isLoading]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Demo mode: accept any of the mock users with password "demo123"
    if (password !== "demo123") return false;
    const found = MOCK_USERS.find((u) => u.email === email);
    if (!found) return false;
    setUser(found);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setObjectives(MOCK_OBJECTIVES);
    setProgressUpdates(MOCK_PROGRESS_UPDATES);
  }, []);

  const createObjective = useCallback(
    async (payload: CreateObjectivePayload): Promise<Objective> => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date().toISOString();
      const objectiveId = generateId();

      const newObjective: Objective = {
        id: objectiveId,
        owner_id: user.id,
        owner_name: user.full_name,
        team_id: user.team_id,
        title: payload.title,
        description: payload.description,
        quarter: payload.quarter,
        year: payload.year,
        status: "on_track",
        key_results: payload.key_results.map((kr) => ({
          id: generateId(),
          objective_id: objectiveId,
          title: kr.title,
          start_value: kr.start_value,
          target_value: kr.target_value,
          current_value: kr.start_value,
          unit: kr.unit,
          created_at: now,
          updated_at: now,
        })),
        created_at: now,
        updated_at: now,
      };

      setObjectives((prev) => [newObjective, ...prev]);
      return newObjective;
    },
    [user]
  );

  const updateObjectiveStatus = useCallback((id: string, status: OKRStatus) => {
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o
      )
    );
  }, []);

  const deleteObjective = useCallback((id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const addProgressUpdate = useCallback(
    async (
      keyResultId: string,
      objectiveId: string,
      payload: ProgressUpdatePayload
    ) => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date().toISOString();
      const newUpdate: ProgressUpdate = {
        id: generateId(),
        key_result_id: keyResultId,
        submitted_by: user.id,
        submitted_by_name: user.full_name,
        value: payload.value,
        note: payload.note,
        created_at: now,
      };

      setProgressUpdates((prev) => [newUpdate, ...prev]);

      // Update key result current_value and recalculate objective status
      setObjectives((prev) =>
        prev.map((obj) => {
          if (obj.id !== objectiveId) return obj;

          const updatedKRs = obj.key_results.map((kr) => {
            if (kr.id !== keyResultId) return kr;
            return { ...kr, current_value: payload.value, updated_at: now };
          });

          const updatedObj = { ...obj, key_results: updatedKRs, updated_at: now };
          updatedObj.status = deriveObjectiveStatus(updatedObj);
          return updatedObj;
        })
      );
    },
    [user]
  );

  const getUpdatesForKR = useCallback(
    (keyResultId: string) =>
      progressUpdates
        .filter((u) => u.key_result_id === keyResultId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [progressUpdates]
  );

  const getObjectivesForUser = useCallback(
    (userId: string) => objectives.filter((o) => o.owner_id === userId),
    [objectives]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        objectives,
        progressUpdates,
        isLoading,
        login,
        logout,
        createObjective,
        updateObjectiveStatus,
        deleteObjective,
        addProgressUpdate,
        getUpdatesForKR,
        getObjectivesForUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
