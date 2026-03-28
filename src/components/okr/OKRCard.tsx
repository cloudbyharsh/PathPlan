"use client";

import { useState } from "react";
import { Objective } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import KeyResultRow from "./KeyResultRow";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/Badge";

interface OKRCardProps {
  objective: Objective;
  readonly?: boolean;
  showOwner?: boolean;
}

export default function OKRCard({
  objective,
  readonly = false,
  showOwner = false,
}: OKRCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteObjective } = useApp();

  const handleDelete = () => {
    if (confirm("Delete this objective and all its key results?")) {
      setIsDeleting(true);
      deleteObjective(objective.id);
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      {/* Card Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <StatusBadge status={objective.status} />
              <Badge variant="gray">
                {objective.quarter} {objective.year}
              </Badge>
              {showOwner && (
                <Badge variant="indigo">{objective.owner_name}</Badge>
              )}
            </div>
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              {objective.title}
            </h3>
            {objective.description && (
              <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                {objective.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!readonly && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete objective"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Key Results */}
      {isExpanded && objective.key_results.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Key Results ({objective.key_results.length})
          </p>
          {objective.key_results.map((kr, idx) => (
            <div key={kr.id}>
              <KeyResultRow
                keyResult={kr}
                objective={objective}
                readonly={readonly}
              />
              {idx < objective.key_results.length - 1 && (
                <div className="border-t border-gray-50 mt-4" />
              )}
            </div>
          ))}
        </div>
      )}

      {isExpanded && objective.key_results.length === 0 && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-sm text-gray-400 italic">No key results added yet.</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
        <p className="text-xs text-gray-400">
          Last updated {formatDate(objective.updated_at)}
        </p>
      </div>
    </div>
  );
}
