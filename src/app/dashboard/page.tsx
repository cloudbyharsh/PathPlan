"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import OKRCard from "@/components/okr/OKRCard";
import Button from "@/components/ui/Button";
import { PlusCircle, Target, TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import { CURRENT_QUARTER, CURRENT_YEAR } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isLoading, getObjectivesForUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const objectives = getObjectivesForUser(user.id);
  const currentObjectives = objectives.filter(
    (o) => o.quarter === CURRENT_QUARTER && o.year === CURRENT_YEAR
  );

  const stats = {
    total: currentObjectives.length,
    on_track: currentObjectives.filter((o) => o.status === "on_track").length,
    at_risk: currentObjectives.filter((o) => o.status === "at_risk").length,
    off_track: currentObjectives.filter((o) => o.status === "off_track").length,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My OKRs
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {CURRENT_QUARTER} {CURRENT_YEAR} · {user.full_name}
              </p>
            </div>
            <Link href="/objectives/new">
              <Button>
                <PlusCircle className="w-4 h-4" />
                New Objective
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {currentObjectives.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total"
                value={stats.total}
                icon={<Target className="w-5 h-5 text-indigo-600" />}
                bg="bg-indigo-50"
              />
              <StatCard
                label="On Track"
                value={stats.on_track}
                icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                bg="bg-emerald-50"
              />
              <StatCard
                label="At Risk"
                value={stats.at_risk}
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                bg="bg-amber-50"
              />
              <StatCard
                label="Off Track"
                value={stats.off_track}
                icon={<XCircle className="w-5 h-5 text-red-500" />}
                bg="bg-red-50"
              />
            </div>
          )}

          {/* OKR Cards */}
          {currentObjectives.length > 0 ? (
            <div className="space-y-4">
              {currentObjectives.map((obj) => (
                <OKRCard key={obj.id} objective={obj} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
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

function EmptyState() {
  return (
    <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No objectives yet</h3>
      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
        Set your first objective for {CURRENT_QUARTER} {CURRENT_YEAR} to start tracking your progress.
      </p>
      <Link href="/objectives/new">
        <Button>
          <PlusCircle className="w-4 h-4" />
          Create your first objective
        </Button>
      </Link>
    </div>
  );
}
