export type TopicMaturity = "unknown" | "interesting" | "emerging" | "promoted";
export type TopicOrigin = "manual" | "analysis";
export type TopicReviewStatus = "draft" | "active" | "dismissed";
export type WaveStage = "early" | "accelerating" | "crowded" | "uncertain" | "restructuring";
export type DocumentStatus =
  | "inbox"
  | "skimmed"
  | "highlighted"
  | "extracted"
  | "linked"
  | "archived";
export type DocumentIntakeMethod = "paste" | "file_stub";
export type DocumentAnalysisState = "not_run" | "running" | "completed" | "failed";
export type EvidenceWhyTag =
  | "bottleneck"
  | "new demand"
  | "value chain shift"
  | "overlooked detail"
  | "tone change"
  | "structure hint";
export type EvidenceReviewStatus = "pending" | "approved" | "rejected";
export type AnalysisRunStatus = "running" | "completed" | "failed";

export type Company = {
  id: string;
  name: string;
  ticker: string;
  roleDescription: string;
};

export type Document = {
  id: string;
  title: string;
  source: string;
  documentType: string;
  status: DocumentStatus;
  publishedAt: string;
  summaryLine: string;
  rawText: string;
  topicId: string;
  waveId: string;
  fileName?: string;
  intakeMethod: DocumentIntakeMethod;
  analysisState: DocumentAnalysisState;
  lastAnalysisRunId: string;
  createdAt: string;
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  analysisRunId: string;
  order: number;
  text: string;
  charStart: number;
  charEnd: number;
  tokenEstimate: number;
};

export type EmergingTopic = {
  id: string;
  slug: string;
  name: string;
  oneLiner: string;
  whyNow: string;
  whyItMatters: string;
  parentWaveId: string;
  maturityStatus: TopicMaturity;
  reviewStatus: TopicReviewStatus;
  origin: TopicOrigin;
  recentMentions: number;
  linkedDocumentsCount: number;
  evidenceIds: string[];
  companyIds: string[];
  questionIds: string[];
  openQuestions: string[];
  sourceConcepts: string[];
  parentWaveHint: string;
  lastAnalysisRunId: string;
  createdAt: string;
};

export type Wave = {
  id: string;
  slug: string;
  title: string;
  thesis: string;
  stage: WaveStage;
  keyBottlenecks: string[];
  valueCaptureLayers: string[];
  latestInterpretation: string;
  companyIds: string[];
  evidenceIds: string[];
  priority?: number;
};

export type Question = {
  id: string;
  title: string;
  description: string;
  waveId: string;
  supportingEvidence: string[];
  opposingEvidence: string[];
  linkedEvidence: {
    evidenceId: string;
    stance: "supporting" | "opposing";
  }[];
  confidence: number;
  lastUpdated: string;
};

export type EvidenceItem = {
  id: string;
  documentId: string;
  chunkId: string;
  analysisRunId: string;
  title: string;
  snippet: string;
  itemType: "snippet" | "note" | "image_placeholder";
  whyTag: EvidenceWhyTag;
  note?: string;
  reviewStatus: EvidenceReviewStatus;
  confidence: number;
  companyMentions: string[];
  candidateTopicNames: string[];
  parentWaveHint: string;
  createdAt: string;
  approvedAt?: string;
};

export type AnalysisRun = {
  id: string;
  documentId: string;
  createdAt: string;
  status: AnalysisRunStatus;
  engineVersion: string;
  chunkCount: number;
  evidenceCandidateCount: number;
  topicDraftCount: number;
  repeatedConcepts: string[];
  notes: string;
};

export type MissedReview = {
  id: string;
  themeName: string;
  winnerNames: string[];
  earlyClues: string;
  whyMissed: string;
  watchNextTime: string;
};

export type QueueColumn = {
  label: DocumentStatus;
  documents: Document[];
};

export type DashboardData = {
  companies: Company[];
  documents: Document[];
  documentChunks: DocumentChunk[];
  topics: EmergingTopic[];
  waves: Wave[];
  questions: Question[];
  evidenceItems: EvidenceItem[];
  analysisRuns: AnalysisRun[];
  missedReviews: MissedReview[];
  queueColumns: QueueColumn[];
};
