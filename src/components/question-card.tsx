"use client";

import { EvidenceCard } from "@/components/evidence-card";
import { QuestionEditForm } from "@/components/question-edit-form";
import { QuestionEvidenceLinker } from "@/components/question-evidence-linker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/components/workspace-provider";
import type { Question } from "@/lib/types";

export function QuestionCard({
  question,
  expanded = false,
}: {
  question: Question;
  expanded?: boolean;
}) {
  const { dashboard, deleteQuestion } = useWorkspace();
  const linkedEvidence = question.linkedEvidence ?? [];
  const linkedEvidenceItems = linkedEvidence
    .map((link) => ({
      link,
      evidence: dashboard.evidenceItems.find((item) => item.id === link.evidenceId),
    }))
    .filter((item) => item.evidence);

  return (
    <Card className="border-border bg-panel">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">{question.title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground">
              신뢰도 {question.confidence}%
            </span>
            <Button variant="secondary" size="sm" onClick={() => deleteQuestion(question.id)}>
              삭제
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-muted-foreground">{question.description}</p>
        {expanded ? (
          <div className="space-y-4">
            <QuestionEditForm question={question} />
            <QuestionEvidenceLinker
              questionId={question.id}
              linkedEvidenceIds={linkedEvidence.map((item) => item.evidenceId)}
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-sm font-medium text-foreground">Supporting evidence</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {question.supportingEvidence.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-sm font-medium text-foreground">Opposing evidence</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {question.opposingEvidence.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {linkedEvidenceItems.length ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">연결된 evidence</p>
                {linkedEvidenceItems.map(({ link, evidence }) =>
                  evidence ? (
                    <div key={evidence.id} className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {link.stance}
                      </p>
                      <EvidenceCard item={evidence} />
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">최근 업데이트 {question.lastUpdated}</p>
      </CardContent>
    </Card>
  );
}
