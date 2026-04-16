export type TopicMaturity = "unknown" | "interesting" | "emerging" | "promoted";
export type WaveStage = "early" | "accelerating" | "crowded" | "uncertain" | "restructuring";
export type DocumentStatus =
  | "inbox"
  | "skimmed"
  | "highlighted"
  | "extracted"
  | "linked"
  | "archived";
export type EvidenceWhyTag =
  | "bottleneck"
  | "new demand"
  | "value chain shift"
  | "overlooked detail"
  | "tone change"
  | "structure hint";

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
  recentMentions: number;
  linkedDocumentsCount: number;
  evidenceIds: string[];
  companyIds: string[];
  questionIds: string[];
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
  title: string;
  snippet: string;
  itemType: "snippet" | "note" | "image_placeholder";
  whyTag: EvidenceWhyTag;
  note?: string;
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
  label: string;
  documents: Document[];
};

export type DashboardData = {
  companies: Company[];
  documents: Document[];
  topics: EmergingTopic[];
  waves: Wave[];
  questions: Question[];
  evidenceItems: EvidenceItem[];
  missedReviews: MissedReview[];
  queueColumns: QueueColumn[];
};
