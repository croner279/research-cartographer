"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-provider";

export function QuestionEvidenceLinker({
  questionId,
  linkedEvidenceIds,
}: {
  questionId: string;
  linkedEvidenceIds: string[];
}) {
  const { dashboard, attachEvidenceToQuestion } = useWorkspace();
  const availableEvidence = useMemo(
    () => dashboard.evidenceItems.filter((item) => !linkedEvidenceIds.includes(item.id)),
    [dashboard.evidenceItems, linkedEvidenceIds],
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("");
  const [stance, setStance] = useState<"supporting" | "opposing">("supporting");

  function handleAttach() {
    if (!selectedEvidenceId) return;
    attachEvidenceToQuestion(questionId, selectedEvidenceId, stance);
    setSelectedEvidenceId("");
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-sm font-medium text-foreground">질문에 evidence 연결</p>
      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_140px_90px]">
        <select
          value={selectedEvidenceId}
          onChange={(event) => setSelectedEvidenceId(event.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none"
        >
          <option value="">연결할 evidence 선택</option>
          {availableEvidence.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <select
          value={stance}
          onChange={(event) => setStance(event.target.value as "supporting" | "opposing")}
          className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none"
        >
          <option value="supporting">supporting</option>
          <option value="opposing">opposing</option>
        </select>
        <Button variant="secondary" onClick={handleAttach} disabled={!selectedEvidenceId}>
          연결
        </Button>
      </div>
    </div>
  );
}
