"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import OKRCard from "@/components/okr/OKRCard";
import { StatusBadge } from "@/components/ui/Badge";
import { Users, TrendingUp, AlertTriangle, XCircle, Target } from "lucide-react";
import { MOCK_USERS } from "@/lib/mockData";
import { CURRENT_QUARTER, CURRENT_YEAR } from "@/lib/utils";
import { OKRStatus } from "@/types";

export default function ManagerPage() {
  const { user, isLoading, objectives } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace("/login");
      else if (user.role === "employee") router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Team members (all users in same team, excluding the manager themselves for display)
  const teamMembers = MOCK_USERS.filter(
    (u) => u.team_id === user.team_id && u.id !== user.id && u.role === "employee"
  );

  // All current-quarter objectives per employee
  const currentObjectives = objectives.filter(
    (o) => o.quarter === CURRENT_QUARTER && o.year === CURRENT_YEAR
  );

  const teamObjectives = currentObjectives.filter(
    (o) => MOCK_USERS.find((u) => u.id === o.owner_id && u.team_id === user.team_id)
  );

  const stats: Record<OKRStatus, number> = {
    on_track: teamObjectives.filter((o) => o.status === "on_track").length,
    at_risk: teamObjectives.filter((o) => o.status === "at_risk").length,
    off_track: teamObjectives.filter((o) => o.status === "off_track").length,
    completed: teamObjectives.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Team OKRs</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {CURRENT_QUARTER} {CURRENT_YEAR} · Customer Success · {teamMembers.length} team member{teamMembers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Team Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <SummaryCard
              label="Total Objectives"
              value={teamObjectives.length}
              icon={<Target className="w-5 h-5 text-indigo-600" />}
              bg="bg-indigo-50"
            />
            <SummaryCard
              label="On Track"
              value={stats.on_track}
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              bg="bg-emerald-50"
            />
            <SummaryCard
              label="At Risk"
              value={stats.at_risk}
              icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
              bg="bg-amber-50"
            />
            <SummaryCard
              label="Off Track"
              value={stats.off_track}
              icon={<XCircle className="w-5 h-5 text-red-500" />}
              bg="bg-red-50"
            />
          </div>

          {/* Employee Groups */}
          {teamMembers.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No team members found.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {teamMembers.map((member) => {
                const memberObjectives = currentObjectives.filter(
                  (o) => o.owner_id === member.id
                );
                return (
                  <EmployeeGroup
                    key={member.id}
                    name={member.full_name}
                    initials={member.avatar_initials}
                    email={member.email}
                    objectives={memberObjectives}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 shadow-sm">
      <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

function EmployeeGroup({
  name,
  initials,
  email,
  objectives,
}: {
  name: string;
  initials: string;
  email: string;
  objectives: ReturnType<typeof useApp>["objectives"];
}) {
  const statusCounts = {
    on_track: objectives.filter((o) => o.status === "on_track").length,
    at_risk: objectives.filter((o) => o.status === "at_risk").length,
    off_track: objectives.filter((o) => o.status === "off_track").length,
  };

  return (
    <div>
      {/* Employee Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-indigo-700 text-xs font-bold">{initials}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-gray-900">{name}</h2>
            {objectives.length > 0 && (
              <div className="flex items-center gap-1.5">
                {statusCounts.on_track > 0 && (
                  <StatusBadge status="on_track" />
                )}
                {statusCounts.at_risk > 0 && (
                  <StatusBadge status="at_risk" />
                )}
                {statusCounts.off_track > 0 && (
                  <StatusBadge status="off_track" />
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">{email}</p>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {objectives.length} objective{objectives.length !== 1 ? "s" : ""}
        </span>
      </div>

      {objectives.length > 0 ? (
        <div className="space-y-3 pl-12">
          {objectives.map((obj) => (
            <OKRCard key={obj.id} objective={obj} readonly showOwner={false} />
          ))}
        </div>
      ) : (
        <div className="pl-12">
          <div className="border border-dashed border-gray-200 rounded-xl py-6 text-center">
            <p className="text-sm text-gray-400">No objectives set for this quarter.</p>
          </div>
        </div>
      )}
    </div>
  );
}
