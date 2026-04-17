import type {
  DashboardData,
  DocumentStatus,
  EvidenceReviewStatus,
  EvidenceWhyTag,
  TopicMaturity,
  TopicReviewStatus,
} from "@/lib/types";

export const queueStatusLabels: Record<DocumentStatus, string> = {
  inbox: "검토 전",
  skimmed: "1차 검토",
  highlighted: "핵심 표시",
  extracted: "증거 추출",
  linked: "구조 연결",
  archived: "보관",
};

export const evidenceWhyTagLabels: Record<EvidenceWhyTag, string> = {
  bottleneck: "병목",
  "new demand": "새 수요",
  "value chain shift": "밸류체인 이동",
  "overlooked detail": "간과된 디테일",
  "tone change": "톤 변화",
  "structure hint": "구조 힌트",
};

export const evidenceReviewLabels: Record<EvidenceReviewStatus, string> = {
  pending: "검토 대기",
  approved: "승인됨",
  rejected: "제외됨",
};

export const topicStatusLabels: Record<TopicMaturity, string> = {
  unknown: "초기 신호",
  interesting: "흥미 단계",
  emerging: "떠오르는 구조",
  promoted: "Wave 승격",
};

export const topicReviewLabels: Record<TopicReviewStatus, string> = {
  draft: "초안",
  active: "활성",
  dismissed: "보류",
};

export const sampleDashboard: DashboardData = {
  companies: [],
  documents: [],
  documentPages: [],
  documentChunks: [],
  topics: [],
  waves: [],
  questions: [],
  evidenceItems: [],
  analysisRuns: [],
  missedReviews: [],
  queueColumns: [],
};

export function buildQueueColumns(documents: DashboardData["documents"]) {
  return [
    { label: "inbox" as const, documents: documents.filter((item) => item.status === "inbox") },
    { label: "skimmed" as const, documents: documents.filter((item) => item.status === "skimmed") },
    {
      label: "highlighted" as const,
      documents: documents.filter((item) => item.status === "highlighted"),
    },
    {
      label: "extracted" as const,
      documents: documents.filter((item) => item.status === "extracted"),
    },
    { label: "linked" as const, documents: documents.filter((item) => item.status === "linked") },
    {
      label: "archived" as const,
      documents: documents.filter((item) => item.status === "archived"),
    },
  ];
}

sampleDashboard.queueColumns = buildQueueColumns(sampleDashboard.documents);
