"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { KeyResult, Objective, ProgressUpdate } from "@/types";
import { getProgressPercent, calculateStatus, formatDate } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { TrendingUp, Clock } from "lucide-react";

interface ProgressUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyResult: KeyResult;
  objective: Objective;
}

export default function ProgressUpdateModal({
  isOpen,
  onClose,
  keyResult,
  objective,
}: ProgressUpdateModalProps) {
  const { addProgressUpdate, getUpdatesForKR } = useApp();
  const [value, setValue] = useState<string>(String(keyResult.current_value));
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updates = getUpdatesForKR(keyResult.id);
  const previewPercent = getProgressPercent({
    ...keyResult,
    current_value: parseFloat(value) || keyResult.current_value,
  });
  const currentStatus = calculateStatus(
    { ...keyResult, current_value: parseFloat(value) || keyResult.current_value },
    objective.quarter,
    objective.year
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError("Please enter a valid number.");
      return;
    }
    if (numValue < 0) {
      setError("Value cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addProgressUpdate(keyResult.id, objective.id, {
        value: numValue,
        note,
      });
      setNote("");
      onClose();
    } catch (_) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Progress" size="lg">
      <div className="space-y-5">
        {/* KR Header */}
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Key Result
          </p>
          <p className="text-sm font-semibold text-gray-900">{keyResult.title}</p>
          <div className="mt-2.5">
            <ProgressBar
              percent={previewPercent}
              status={currentStatus}
              showLabel
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {keyResult.current_value} → {keyResult.target_value} {keyResult.unit}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New value ({keyResult.unit})
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={`Current: ${keyResult.current_value}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="What drove this progress? Any blockers?"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <TrendingUp className="w-4 h-4" />
              Save Update
            </Button>
          </div>
        </form>

        {/* History */}
        {updates.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Update History
              </p>
            </div>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {updates.map((update: ProgressUpdate) => (
                <div
                  key={update.id}
                  className="border border-gray-100 rounded-lg px-3 py-2.5 bg-white"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {update.value} {keyResult.unit}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(update.created_at)}
                    </span>
                  </div>
                  {update.note && (
                    <p className="text-xs text-gray-600 leading-relaxed">{update.note}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">by {update.submitted_by_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
