"use client";

import { useState } from "react";
import { KeyResult, Objective } from "@/types";
import { getProgressPercent, calculateStatus } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";
import ProgressUpdateModal from "./ProgressUpdateModal";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyResultRowProps {
  keyResult: KeyResult;
  objective: Objective;
  readonly?: boolean;
}

export default function KeyResultRow({
  keyResult,
  objective,
  readonly = false,
}: KeyResultRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const percent = getProgressPercent(keyResult);
  const status = calculateStatus(keyResult, objective.quarter, objective.year);

  return (
    <>
      <div className="flex items-start gap-3 group">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 font-medium leading-snug mb-2">
            {keyResult.title}
          </p>
          <ProgressBar percent={percent} status={status} showLabel size="sm" />
          <p className="text-xs text-gray-400 mt-1.5">
            {keyResult.current_value} / {keyResult.target_value} {keyResult.unit}
          </p>
        </div>
        {!readonly && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md transition-all",
              "text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Update
          </button>
        )}
      </div>

      <ProgressUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        keyResult={keyResult}
        objective={objective}
      />
    </>
  );
}
