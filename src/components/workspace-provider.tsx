"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { runDocumentAnalysis } from "@/lib/analysis/engine";
import { buildQueueColumns, sampleDashboard } from "@/lib/sample-data";
import type {
  DashboardData,
  DocumentStatus,
  EvidenceReviewStatus,
  EvidenceWhyTag,
  TopicMaturity,
  TopicReviewStatus,
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
  updateTopic: (
    topicId: string,
    input: {
      name: string;
      oneLiner: string;
      whyNow: string;
      whyItMatters: string;
      parentWaveId?: string;
      openQuestions?: string[];
    },
  ) => void;
  updateQuestion: (
    questionId: string,
    input: {
      title: string;
      description: string;
      waveId?: string;
      confidence: number;
    },
  ) => void;
  addTopic: (input: {
    name: string;
    oneLiner: string;
    whyNow: string;
    whyItMatters: string;
    parentWaveId?: string;
    openQuestions?: string[];
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
  setTopicReviewStatus: (topicId: string, status: TopicReviewStatus) => void;
  promoteTopicToWave: (topicId: string) => void;
  detachTopicFromWave: (topicId: string) => void;
  updateWaveStage: (waveId: string, stage: WaveStage) => void;
  moveDocumentStatus: (documentId: string, status: DocumentStatus) => void;
  updateDocumentLinks: (
    documentId: string,
    input: {
      topicId?: string;
      waveId?: string;
    },
  ) => void;
  addDocument: (input: {
    title: string;
    source: string;
    documentType: string;
    summaryLine: string;
    rawText: string;
    publishedAt?: string;
    topicId?: string;
    waveId?: string;
    fileName?: string;
    intakeMethod?: "paste" | "file_stub";
  }) => void;
  addEvidenceItem: (input: {
    documentId: string;
    title: string;
    snippet: string;
    whyTag: EvidenceWhyTag;
    note?: string;
  }) => void;
  runAnalysisForDocument: (documentId: string) => void;
  approveEvidenceItem: (evidenceId: string) => void;
  updateEvidenceReviewStatus: (evidenceId: string, status: EvidenceReviewStatus) => void;
  resetWorkspace: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const storageKey = "research-cartographer.workspace";

function cloneDashboard(): DashboardData {
  return JSON.parse(JSON.stringify(sampleDashboard)) as DashboardData;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

const documentStatusOrder: DocumentStatus[] = [
  "inbox",
  "skimmed",
  "highlighted",
  "extracted",
  "linked",
  "archived",
];

function ensureLinkedStatus(currentStatus: DocumentStatus, hasLinks: boolean): DocumentStatus {
  if (!hasLinks || currentStatus === "archived") {
    return currentStatus;
  }

  return documentStatusOrder.indexOf(currentStatus) < documentStatusOrder.indexOf("linked")
    ? "linked"
    : currentStatus;
}

function ensureExtractedStatus(currentStatus: DocumentStatus): DocumentStatus {
  if (currentStatus === "archived") {
    return currentStatus;
  }

  return documentStatusOrder.indexOf(currentStatus) < documentStatusOrder.indexOf("extracted")
    ? "extracted"
    : currentStatus;
}

function normalizeDashboard(data: DashboardData): DashboardData {
  const normalizedQuestions = data.questions.map((question) => ({
    ...question,
    linkedEvidence: question.linkedEvidence ?? [],
  }));

  const normalizedDocuments = data.documents.map((document) => ({
    ...document,
    topicId: document.topicId ?? "",
    waveId: document.waveId ?? "",
    fileName: document.fileName ?? "",
    intakeMethod: document.intakeMethod ?? "paste",
    analysisState: document.analysisState ?? "not_run",
    lastAnalysisRunId: document.lastAnalysisRunId ?? "",
    createdAt: document.createdAt ?? document.publishedAt ?? new Date().toISOString(),
  }));

  const normalizedTopics = data.topics.map((topic) => ({
    ...topic,
    parentWaveId: topic.parentWaveId ?? "",
    reviewStatus: topic.reviewStatus ?? "active",
    origin: topic.origin ?? "manual",
    openQuestions: topic.openQuestions ?? [],
    sourceConcepts: topic.sourceConcepts ?? [],
    parentWaveHint: topic.parentWaveHint ?? "",
    lastAnalysisRunId: topic.lastAnalysisRunId ?? "",
    createdAt: topic.createdAt ?? new Date().toISOString(),
  }));

  const normalizedEvidence = data.evidenceItems.map((item) => ({
    ...item,
    chunkId: item.chunkId ?? "",
    analysisRunId: item.analysisRunId ?? "",
    reviewStatus: item.reviewStatus ?? "approved",
    confidence: item.confidence ?? 80,
    companyMentions: item.companyMentions ?? [],
    candidateTopicNames: item.candidateTopicNames ?? [],
    parentWaveHint: item.parentWaveHint ?? "",
    createdAt: item.createdAt ?? new Date().toISOString(),
  }));

  return {
    companies: data.companies ?? [],
    documents: normalizedDocuments,
    documentChunks: data.documentChunks ?? [],
    topics: normalizedTopics,
    waves: data.waves ?? [],
    questions: normalizedQuestions,
    evidenceItems: normalizedEvidence,
    analysisRuns: data.analysisRuns ?? [],
    missedReviews: data.missedReviews ?? [],
    queueColumns: buildQueueColumns(normalizedDocuments),
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

function createTopicWaveFallback(topicName: string) {
  return {
    keyBottlenecks: ["근거가 더 필요한 병목 정의"],
    valueCaptureLayers: ["핵심 레이어 확인 필요"],
    latestInterpretation: `${topicName}는 아직 초안 단계이며 추가 evidence 검토가 필요합니다.`,
  };
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
            documents: current.documents.map((document) =>
              document.topicId === topicId ? { ...document, topicId: "" } : document,
            ),
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
          const removedRunIds = current.analysisRuns
            .filter((run) => run.documentId === documentId)
            .map((run) => run.id);

          return normalizeDashboard({
            ...current,
            documents: current.documents.filter((document) => document.id !== documentId),
            documentChunks: current.documentChunks.filter((chunk) => chunk.documentId !== documentId),
            analysisRuns: current.analysisRuns.filter((run) => run.documentId !== documentId),
            evidenceItems: current.evidenceItems.filter((item) => item.documentId !== documentId),
            topics: current.topics
              .filter(
                (topic) =>
                  !(
                    topic.origin === "analysis" &&
                    topic.reviewStatus === "draft" &&
                    removedRunIds.includes(topic.lastAnalysisRunId)
                  ),
              )
              .map((topic) => ({
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
            documents: current.documents.map((document) =>
              document.waveId === waveId ? { ...document, waveId: "" } : document,
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
                    openQuestions: input.openQuestions ?? topic.openQuestions,
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
                reviewStatus: "active",
                origin: "manual",
                recentMentions: 1,
                linkedDocumentsCount: 0,
                evidenceIds: [],
                companyIds: [],
                questionIds: [],
                openQuestions: input.openQuestions ?? [],
                sourceConcepts: [input.name],
                parentWaveHint: "",
                lastAnalysisRunId: "",
                createdAt: new Date().toISOString(),
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
      setTopicReviewStatus(topicId, status) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            topics: current.topics.map((topic) =>
              topic.id === topicId ? { ...topic, reviewStatus: status } : topic,
            ),
          }),
        );
      },
      promoteTopicToWave(topicId) {
        setDashboard((current) => {
          const topic = current.topics.find((item) => item.id === topicId);
          if (!topic) return current;

          const existingWave = current.waves.find((wave) => wave.slug === topic.slug);
          if (existingWave) {
            return normalizeDashboard({
              ...current,
              topics: current.topics.map((item) =>
                item.id === topicId
                  ? {
                      ...item,
                      maturityStatus: "promoted",
                      reviewStatus: "active",
                      parentWaveId: existingWave.id,
                    }
                  : item,
              ),
            });
          }

          const fallback = createTopicWaveFallback(topic.name);
          const newWave: Wave = {
            id: `wave-${crypto.randomUUID()}`,
            slug: topic.slug,
            title: topic.name,
            thesis: topic.oneLiner,
            stage: "early",
            keyBottlenecks: fallback.keyBottlenecks,
            valueCaptureLayers: fallback.valueCaptureLayers,
            latestInterpretation: fallback.latestInterpretation,
            companyIds: topic.companyIds,
            evidenceIds: topic.evidenceIds,
            priority: topic.reviewStatus === "draft" ? 2 : undefined,
          };

          return normalizeDashboard({
            ...current,
            waves: [newWave, ...current.waves],
            topics: current.topics.map((item) =>
              item.id === topicId
                ? {
                    ...item,
                    maturityStatus: "promoted",
                    reviewStatus: "active",
                    parentWaveId: newWave.id,
                  }
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
            waves: current.waves.map((wave) => (wave.id === waveId ? { ...wave, stage } : wave)),
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
      updateDocumentLinks(documentId, input) {
        setDashboard((current) => {
          const resolvedTopicId = input.topicId;
          const derivedWaveId =
            resolvedTopicId && input.waveId === undefined
              ? current.topics.find((topic) => topic.id === resolvedTopicId)?.parentWaveId ?? ""
              : input.waveId;

          return normalizeDashboard({
            ...current,
            documents: current.documents.map((document) => {
              if (document.id !== documentId) return document;

              const nextTopicId = resolvedTopicId ?? document.topicId;
              const nextWaveId = derivedWaveId ?? document.waveId;

              return {
                ...document,
                topicId: nextTopicId,
                waveId: nextWaveId,
                status: ensureLinkedStatus(document.status, Boolean(nextTopicId || nextWaveId)),
              };
            }),
          });
        });
      },
      addDocument(input) {
        setDashboard((current) => {
          const derivedWaveId =
            !input.waveId && input.topicId
              ? current.topics.find((topic) => topic.id === input.topicId)?.parentWaveId ?? ""
              : input.waveId || "";

          const topicId = input.topicId || "";
          const waveId = derivedWaveId || "";

          return normalizeDashboard({
            ...current,
            documents: [
              {
                id: `doc-${crypto.randomUUID()}`,
                title: input.title,
                source: input.source || "직접 입력",
                documentType: input.documentType || "note",
                status: ensureLinkedStatus("inbox", Boolean(topicId || waveId)),
                publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
                summaryLine: input.summaryLine,
                rawText: input.rawText,
                topicId,
                waveId,
                fileName: input.fileName || "",
                intakeMethod: input.intakeMethod || "paste",
                analysisState: "not_run",
                lastAnalysisRunId: "",
                createdAt: new Date().toISOString(),
              },
              ...current.documents,
            ],
          });
        });
      },
      addEvidenceItem(input) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            documents: current.documents.map((document) =>
              document.id === input.documentId
                ? { ...document, status: ensureExtractedStatus(document.status) }
                : document,
            ),
            evidenceItems: [
              {
                id: `evidence-${crypto.randomUUID()}`,
                documentId: input.documentId,
                chunkId: "",
                analysisRunId: "",
                title: input.title,
                snippet: input.snippet,
                itemType: "note",
                whyTag: input.whyTag,
                note: input.note,
                reviewStatus: "approved",
                confidence: 100,
                companyMentions: [],
                candidateTopicNames: [],
                parentWaveHint: "",
                createdAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
              },
              ...current.evidenceItems,
            ],
          }),
        );
      },
      runAnalysisForDocument(documentId) {
        setDashboard((current) => {
          const document = current.documents.find((item) => item.id === documentId);
          if (!document || !document.rawText.trim()) {
            return current;
          }

          const previousRunId = document.lastAnalysisRunId;
          const output = runDocumentAnalysis({
            document,
            existingCompanies: current.companies,
            existingTopics: current.topics,
          });

          const previousDraftIds = current.topics
            .filter(
              (topic) =>
                topic.origin === "analysis" &&
                topic.reviewStatus === "draft" &&
                topic.lastAnalysisRunId === previousRunId,
            )
            .map((topic) => topic.id);

          const preservedTopics = current.topics.filter((topic) => !previousDraftIds.includes(topic.id));
          const mergedTopics = [...preservedTopics];

          for (const draft of output.topicDrafts) {
            const existingIndex = mergedTopics.findIndex((topic) => topic.slug === draft.slug);
            if (existingIndex >= 0) {
              mergedTopics[existingIndex] = draft;
            } else {
              mergedTopics.unshift(draft);
            }
          }

          const retainedEvidence = current.evidenceItems.filter((item) => {
            if (item.documentId !== documentId) return true;
            return item.reviewStatus === "approved";
          });

          return normalizeDashboard({
            ...current,
            companies: output.companies,
            analysisRuns: [output.run, ...current.analysisRuns],
            documentChunks: [
              ...current.documentChunks.filter((chunk) => chunk.documentId !== documentId),
              ...output.chunks,
            ],
            evidenceItems: [...output.evidenceItems, ...retainedEvidence],
            topics: mergedTopics,
            documents: current.documents.map((item) =>
              item.id === documentId
                ? {
                    ...item,
                    analysisState: "completed",
                    lastAnalysisRunId: output.run.id,
                    status:
                      output.evidenceItems.length > 0
                        ? ensureExtractedStatus(item.status)
                        : item.status,
                  }
                : item,
            ),
          });
        });
      },
      approveEvidenceItem(evidenceId) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            documents: current.documents.map((document) =>
              document.id === current.evidenceItems.find((item) => item.id === evidenceId)?.documentId
                ? { ...document, status: ensureExtractedStatus(document.status) }
                : document,
            ),
            evidenceItems: current.evidenceItems.map((item) =>
              item.id === evidenceId
                ? {
                    ...item,
                    reviewStatus: "approved",
                    approvedAt: new Date().toISOString(),
                  }
                : item,
            ),
          }),
        );
      },
      updateEvidenceReviewStatus(evidenceId, status) {
        setDashboard((current) =>
          normalizeDashboard({
            ...current,
            evidenceItems: current.evidenceItems.map((item) =>
              item.id === evidenceId
                ? {
                    ...item,
                    reviewStatus: status,
                    approvedAt: status === "approved" ? new Date().toISOString() : item.approvedAt,
                  }
                : item,
            ),
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
