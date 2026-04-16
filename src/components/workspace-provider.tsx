"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { buildQueueColumns, sampleDashboard } from "@/lib/sample-data";
import type {
  DashboardData,
  DocumentStatus,
  EvidenceWhyTag,
  TopicMaturity,
  Wave,
  WaveStage,
} from "@/lib/types";

type WorkspaceContextValue = {
  dashboard: DashboardData;
  exportWorkspace: () => void;
  importWorkspace: (file: File) => Promise<{ ok: boolean; message: string }>;
  deleteTopic: (topicId: string) => void;
  deleteQuestion: (questionId: string) => void;
  deleteDocument: (documentId: string) => void;
  deleteWave: (waveId: string) => void;
  deleteEvidence: (evidenceId: string) => void;
  updateTopic: (topicId: string, input: {
    name: string;
    oneLiner: string;
    whyNow: string;
    whyItMatters: string;
    parentWaveId?: string;
  }) => void;
  updateQuestion: (questionId: string, input: {
    title: string;
    description: string;
    waveId?: string;
    confidence: number;
  }) => void;
  addTopic: (input: {
    name: string;
    oneLiner: string;
    whyNow: string;
    whyItMatters: string;
    parentWaveId?: string;
  }) => void;
  addQuestion: (input: {
    title: string;
    description: string;
    waveId?: string;
    confidence?: number;
  }) => void;
  attachEvidenceToTopic: (topicId: string, evidenceId: string) => void;
  attachEvidenceToQuestion: (
    questionId: string,
    evidenceId: string,
    stance: "supporting" | "opposing",
  ) => void;
  setTopicStatus: (topicId: string, status: TopicMaturity) => void;
  promoteTopicToWave: (topicId: string) => void;
  detachTopicFromWave: (topicId: string) => void;
  updateWaveStage: (waveId: string, stage: WaveStage) => void;
  moveDocumentStatus: (documentId: string, status: DocumentStatus) => void;
  addDocument: (input: {
    title: string;
    source: string;
    documentType: string;
    summaryLine: string;
    rawText: string;
    publishedAt?: string;
  }) => void;
  addEvidenceItem: (input: {
    documentId: string;
    title: string;
    snippet: string;
    whyTag: EvidenceWhyTag;
    note?: string;
  }) => void;
  resetWorkspace: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const storageKey = "research-cartographer.workspace";

function cloneDashboard(): DashboardData {
  return JSON.parse(JSON.stringify(sampleDashboard)) as DashboardData;
}

function normalizeDashboard(data: DashboardData): DashboardData {
  const normalizedQuestions = data.questions.map((question) => ({
    ...question,
    linkedEvidence: question.linkedEvidence ?? [],
  }));

  return {
    ...data,
    questions: normalizedQuestions,
    queueColumns: buildQueueColumns(data.documents),
  };
}

function getInitialDashboard() {
  if (typeof window === "undefined") {
    return normalizeDashboard(cloneDashboard());
  }

  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    return normalizeDashboard(cloneDashboard());
  }

  try {
    return normalizeDashboard(JSON.parse(saved) as DashboardData);
  } catch {
    return normalizeDashboard(cloneDashboard());
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardData>(getInitialDashboard);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(dashboard));
  }, [dashboard]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      dashboard,
      exportWorkspace() {
        const blob = new Blob([JSON.stringify(dashboard, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `research-cartographer-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      async importWorkspace(file) {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text) as DashboardData;
          setDashboard(normalizeDashboard(parsed));
          return { ok: true, message: "워크스페이스를 불러왔습니다." };
        } catch {
          return { ok: false, message: "올바른 워크스페이스 JSON 파일이 아닙니다." };
        }
      },
      deleteTopic(topicId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: current.topics.filter((topic) => topic.id !== topicId),
          }),
        );
      },
      deleteQuestion(questionId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            questions: current.questions.filter((question) => question.id !== questionId),
          }),
        );
      },
      deleteDocument(documentId) {
        setDashboard((current) => {
          const removedEvidenceIds = current.evidenceItems
            .filter((item) => item.documentId === documentId)
            .map((item) => item.id);

          return normalizeDashboard({
            ...current,
            documents: current.documents.filter((document) => document.id !== documentId),
            evidenceItems: current.evidenceItems.filter((item) => item.documentId !== documentId),
            topics: current.topics.map((topic) => ({
              ...topic,
              evidenceIds: topic.evidenceIds.filter((id) => !removedEvidenceIds.includes(id)),
            })),
            waves: current.waves.map((wave) => ({
              ...wave,
              evidenceIds: wave.evidenceIds.filter((id) => !removedEvidenceIds.includes(id)),
            })),
            questions: current.questions.map((question) => ({
              ...question,
              linkedEvidence: question.linkedEvidence.filter(
                (link) => !removedEvidenceIds.includes(link.evidenceId),
              ),
            })),
          });
        });
      },
      deleteWave(waveId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            waves: current.waves.filter((wave) => wave.id !== waveId),
            topics: current.topics.map((topic) =>
              topic.parentWaveId === waveId ? { ...topic, parentWaveId: "" } : topic,
            ),
            questions: current.questions.map((question) =>
              question.waveId === waveId ? { ...question, waveId: "" } : question,
            ),
          }),
        );
      },
      deleteEvidence(evidenceId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            evidenceItems: current.evidenceItems.filter((item) => item.id !== evidenceId),
            topics: current.topics.map((topic) => ({
              ...topic,
              evidenceIds: topic.evidenceIds.filter((id) => id !== evidenceId),
            })),
            waves: current.waves.map((wave) => ({
              ...wave,
              evidenceIds: wave.evidenceIds.filter((id) => id !== evidenceId),
            })),
            questions: current.questions.map((question) => ({
              ...question,
              linkedEvidence: question.linkedEvidence.filter((item) => item.evidenceId !== evidenceId),
            })),
          }),
        );
      },
      updateTopic(topicId, input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId
                ? {
                    ...topic,
                    name: input.name,
                    slug: slugify(input.name),
                    oneLiner: input.oneLiner,
                    whyNow: input.whyNow,
                    whyItMatters: input.whyItMatters,
                    parentWaveId: input.parentWaveId || "",
                  }
                : topic,
            ),
          }),
        );
      },
      updateQuestion(questionId, input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            questions: current.questions.map((question) =>
              question.id === questionId
                ? {
                    ...question,
                    title: input.title,
                    description: input.description,
                    waveId: input.waveId || "",
                    confidence: input.confidence,
                    lastUpdated: new Date().toISOString().slice(0, 10),
                  }
                : question,
            ),
          }),
        );
      },
      addTopic(input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: [
              {
                id: `topic-${crypto.randomUUID()}`,
                slug: slugify(input.name),
                name: input.name,
                oneLiner: input.oneLiner,
                whyNow: input.whyNow,
                whyItMatters: input.whyItMatters,
                parentWaveId: input.parentWaveId || "",
                maturityStatus: "unknown",
                recentMentions: 1,
                linkedDocumentsCount: 0,
                evidenceIds: [],
                companyIds: [],
                questionIds: [],
              },
              ...current.topics,
            ],
          }),
        );
      },
      addQuestion(input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            questions: [
              {
                id: `question-${crypto.randomUUID()}`,
                title: input.title,
                description: input.description,
                waveId: input.waveId || "",
                supportingEvidence: [],
                opposingEvidence: [],
                linkedEvidence: [],
                confidence: input.confidence ?? 50,
                lastUpdated: new Date().toISOString().slice(0, 10),
              },
              ...current.questions,
            ],
          }),
        );
      },
      attachEvidenceToTopic(topicId, evidenceId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId && !topic.evidenceIds.includes(evidenceId)
                ? {
                    ...topic,
                    evidenceIds: [evidenceId, ...topic.evidenceIds],
                    linkedDocumentsCount: topic.linkedDocumentsCount + 1,
                  }
                : topic,
            ),
          }),
        );
      },
      attachEvidenceToQuestion(questionId, evidenceId, stance) {
        setDashboard((current) => {
          const evidence = current.evidenceItems.find((item) => item.id === evidenceId);
          if (!evidence) return current;

          return normalizeDashboard({
            ...current,
            questions: current.questions.map((question) => {
              if (question.id !== questionId) return question;
              if (question.linkedEvidence.some((item) => item.evidenceId === evidenceId)) {
                return question;
              }

              return {
                ...question,
                linkedEvidence: [{ evidenceId, stance }, ...question.linkedEvidence],
                supportingEvidence:
                  stance === "supporting"
                    ? [evidence.title, ...question.supportingEvidence]
                    : question.supportingEvidence,
                opposingEvidence:
                  stance === "opposing"
                    ? [evidence.title, ...question.opposingEvidence]
                    : question.opposingEvidence,
                lastUpdated: new Date().toISOString().slice(0, 10),
              };
            }),
          });
        });
      },
      setTopicStatus(topicId, status) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId ? { ...topic, maturityStatus: status } : topic,
            ),
          }),
        );
      },
      promoteTopicToWave(topicId) {
        setDashboard((current) => {
          const topic = current.topics.find((item) => item.id === topicId);
          if (!topic) return current;

          if (current.waves.some((wave) => wave.slug === topic.slug)) {
            return normalizeDashboard({
              ...current,
              topics: current.topics.map((item) =>
                item.id === topicId ? { ...item, maturityStatus: "promoted" } : item,
              ),
            });
          }

          const newWave: Wave = {
            id: `wave-${crypto.randomUUID()}`,
            slug: topic.slug,
            title: topic.name,
            thesis: topic.oneLiner,
            stage: "early",
            keyBottlenecks: ["아직 병목 정의 필요", "추가 evidence 수집 필요"],
            valueCaptureLayers: ["미정"],
            latestInterpretation: `${topic.name}은 아직 draft 단계이지만 별도 wave로 추적할 가치가 있습니다.`,
            companyIds: topic.companyIds,
            evidenceIds: topic.evidenceIds,
          };

          return normalizeDashboard({
            ...current,
            waves: [newWave, ...current.waves],
            topics: current.topics.map((item) =>
              item.id === topicId
                ? { ...item, maturityStatus: "promoted", parentWaveId: newWave.id }
                : item,
            ),
          });
        });
      },
      detachTopicFromWave(topicId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId
                ? {
                    ...topic,
                    parentWaveId: "",
                    maturityStatus:
                      topic.maturityStatus === "promoted" ? "emerging" : topic.maturityStatus,
                  }
                : topic,
            ),
          }),
        );
      },
      updateWaveStage(waveId, stage) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            waves: current.waves.map((wave) =>
              wave.id === waveId ? { ...wave, stage } : wave,
            ),
          }),
        );
      },
      moveDocumentStatus(documentId, status) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            documents: current.documents.map((document) =>
              document.id === documentId ? { ...document, status } : document,
            ),
          }),
        );
      },
      addDocument(input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            documents: [
              {
                id: `doc-${crypto.randomUUID()}`,
                title: input.title,
                source: input.source || "Manual input",
                documentType: input.documentType || "note",
                status: "inbox",
                publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
                summaryLine: input.summaryLine,
                rawText: input.rawText,
              },
              ...current.documents,
            ],
          }),
        );
      },
      addEvidenceItem(input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            evidenceItems: [
              {
                id: `evidence-${crypto.randomUUID()}`,
                documentId: input.documentId,
                title: input.title,
                snippet: input.snippet,
                itemType: "note",
                whyTag: input.whyTag,
                note: input.note,
              },
              ...current.evidenceItems,
            ],
          }),
        );
      },
      resetWorkspace() {
        setDashboard(normalizeDashboard(cloneDashboard()));
      },
    }),
    [dashboard],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
