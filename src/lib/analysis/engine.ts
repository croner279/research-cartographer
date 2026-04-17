import type {
  AnalysisRun,
  Company,
  Document,
  DocumentChunk,
  DocumentPage,
  EmergingTopic,
  EvidenceItem,
  EvidenceWhyTag,
} from "@/lib/types";

type AnalysisInput = {
  document: Document;
  documentPages: DocumentPage[];
  existingCompanies: Company[];
  existingTopics: EmergingTopic[];
};

type AnalysisOutput = {
  run: AnalysisRun;
  chunks: DocumentChunk[];
  evidenceItems: EvidenceItem[];
  topicDrafts: EmergingTopic[];
  companies: Company[];
};

const engineVersion = "analysis-engine-v1";
const maxChunkLength = 1000;
const overlapLength = 180;

const whyTagRules: Array<{ tag: EvidenceWhyTag; keywords: string[] }> = [
  {
    tag: "bottleneck",
    keywords: ["constraint", "shortage", "bottleneck", "limited", "capacity", "delay", "backlog"],
  },
  {
    tag: "new demand",
    keywords: ["demand", "orders", "pipeline", "adoption", "ramp", "spending", "pull-forward"],
  },
  {
    tag: "value chain shift",
    keywords: ["shift", "moving to", "winner", "supplier", "capture", "mix", "stack", "attach rate"],
  },
  {
    tag: "overlooked detail",
    keywords: ["underappreciated", "overlooked", "detail", "hidden", "less discussed", "non-obvious"],
  },
  {
    tag: "tone change",
    keywords: ["improved", "worsened", "tone", "confident", "cautious", "visibility", "inflection"],
  },
  {
    tag: "structure hint",
    keywords: ["platform", "ecosystem", "architecture", "workflow", "transition", "structure", "interconnect"],
  },
];

const waveHintRules = [
  {
    wave: "AI Infrastructure",
    keywords: ["gpu", "ai", "inference", "training", "rack", "datacenter", "interconnect", "hbm", "networking"],
  },
  {
    wave: "Power and Grid Upgrade",
    keywords: ["power", "grid", "utility", "load", "substation", "transmission", "generation"],
  },
  {
    wave: "Semiconductor Supply Chain",
    keywords: ["foundry", "packaging", "wafer", "substrate", "memory", "semiconductor", "fab"],
  },
  {
    wave: "Industrial Automation",
    keywords: ["robot", "automation", "factory", "warehouse", "autonomy", "industrial"],
  },
];

const whyTagLabels: Record<EvidenceWhyTag, string> = {
  bottleneck: "병목",
  "new demand": "새 수요",
  "value chain shift": "밸류체인 이동",
  "overlooked detail": "간과된 디테일",
  "tone change": "톤 변화",
  "structure hint": "구조 힌트",
};

const whyTagImplications: Record<EvidenceWhyTag, string> = {
  bottleneck: "공급 제약이나 실행 병목이 구조적으로 중요해질 가능성",
  "new demand": "기존 가정에 없던 신규 수요 축이 커질 가능성",
  "value chain shift": "누가 더 많은 가치를 가져갈지 재편될 가능성",
  "overlooked detail": "시장 해석에서 덜 반영된 포인트일 가능성",
  "tone change": "업계 체감이 바뀌는 초기 신호일 가능성",
  "structure hint": "개별 뉴스보다 상위 구조 변화로 읽어야 할 가능성",
};

const stopConcepts = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "those",
  "these",
  "quarter",
  "annual",
  "management",
  "company",
  "market",
  "research",
  "report",
  "earnings",
  "call",
  "business",
  "growth",
]);

const companyBlacklist = new Set(["The", "This", "That", "Management", "Research", "Wave"]);

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-");
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function buildChunksFromPages(document: Document, analysisRunId: string, pages: DocumentPage[]) {
  if (!pages.length) {
    return [];
  }

  const chunks: DocumentChunk[] = [];
  let buffer = "";
  let bufferPages: number[] = [];
  let bufferStart = pages[0].charStart;
  let bufferEnd = pages[0].charEnd;

  function flushChunk() {
    if (!buffer.trim()) return;
    const sourcePages = [...new Set(bufferPages)].sort((a, b) => a - b);
    chunks.push({
      id: createId("chunk"),
      documentId: document.id,
      analysisRunId,
      order: chunks.length,
      text: buffer.trim(),
      charStart: bufferStart,
      charEnd: bufferEnd,
      tokenEstimate: Math.ceil(buffer.length / 4),
      pageStart: sourcePages[0],
      pageEnd: sourcePages[sourcePages.length - 1],
      sourcePages,
    });
  }

  for (const page of pages) {
    const paragraphs = page.text.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    const units = paragraphs.length ? paragraphs : [page.text.trim()].filter(Boolean);

    for (const unit of units) {
      const candidate = buffer ? `${buffer}\n\n${unit}` : unit;
      if (candidate.length <= maxChunkLength) {
        if (!buffer) {
          bufferStart = page.charStart;
        }
        buffer = candidate;
        bufferEnd = page.charEnd;
        bufferPages.push(page.pageNumber);
        continue;
      }

      flushChunk();
      const overlap = buffer.slice(Math.max(0, buffer.length - overlapLength)).trim();
      buffer = overlap ? `${overlap}\n\n${unit}` : unit;
      bufferPages = [page.pageNumber];
      bufferStart = page.charStart;
      bufferEnd = page.charEnd;
    }
  }

  flushChunk();
  return chunks;
}

function extractCompanyNames(text: string, existingCompanies: Company[]) {
  const found = new Set<string>();

  for (const company of existingCompanies) {
    if (new RegExp(`\\b${company.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
      found.add(company.name);
    }
  }

  const matches = text.match(/\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[A-Z]{2,})\b/g) ?? [];
  for (const match of matches) {
    if (companyBlacklist.has(match) || match.length < 2) continue;
    found.add(match);
  }

  return [...found].slice(0, 4);
}

function extractConcepts(text: string) {
  const concepts = new Set<string>();
  const phraseMatches =
    text.match(
      /\b(?:[A-Z]{2,}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[a-z]{4,}\s+(?:power|grid|cooling|memory|packaging|networking|inference|interconnect|automation|supply|rack|cluster|stack|fabric|load|storage|demand|module|equipment|service))\b/g,
    ) ?? [];

  for (const raw of phraseMatches) {
    const concept = raw.trim();
    const normalized = concept.toLowerCase();
    if (stopConcepts.has(normalized) || normalized.length < 4) continue;
    concepts.add(concept);
  }

  return [...concepts];
}

function inferWaveHint(text: string) {
  const normalized = text.toLowerCase();
  const scored = waveHintRules
    .map((rule) => ({
      wave: rule.wave,
      score: rule.keywords.reduce(
        (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score ? scored[0].wave : "미지정";
}

function shortenQuote(text: string) {
  const cleaned = cleanText(text);
  return cleaned.length > 160 ? `${cleaned.slice(0, 157)}...` : cleaned;
}

function buildEvidenceTitle(tag: EvidenceWhyTag, concepts: string[], companyMentions: string[]) {
  if (concepts[0] && companyMentions[0]) {
    return `${concepts[0]}에서 ${companyMentions[0]} 신호 포착`;
  }
  if (concepts[0]) {
    return `${concepts[0]} 관련 ${whyTagLabels[tag]} 신호`;
  }
  if (companyMentions[0]) {
    return `${companyMentions[0]} 관련 ${whyTagLabels[tag]} 신호`;
  }
  return `${whyTagLabels[tag]} 후보`;
}

function buildEvidenceNote(
  tag: EvidenceWhyTag,
  concepts: string[],
  companyMentions: string[],
  parentWaveHint: string,
) {
  const conceptPart = concepts[0] ? `${concepts[0]} 중심으로 읽히며` : "직접적인 수치보다 맥락상";
  const companyPart = companyMentions[0] ? ` ${companyMentions[0]} 등 관련 기업과 연결될 수 있고,` : "";
  const wavePart = parentWaveHint !== "미지정" ? ` 상위로는 ${parentWaveHint} wave와 이어질 가능성이 있습니다.` : "";
  return `${conceptPart}${companyPart} ${whyTagImplications[tag]}.${wavePart}`.replace(/\s+/g, " ").trim();
}

function extractEvidenceFromChunk(
  chunk: DocumentChunk,
  input: AnalysisInput,
  createdAt: string,
) {
  const sentences = splitSentences(chunk.text);
  const candidates: EvidenceItem[] = [];

  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase();
    for (const rule of whyTagRules) {
      if (!rule.keywords.some((keyword) => normalized.includes(keyword))) continue;

      const concepts = extractConcepts(sentence);
      const companyMentions = extractCompanyNames(sentence, input.existingCompanies);
      const parentWaveHint = inferWaveHint(sentence);

      candidates.push({
        id: createId("evidence"),
        documentId: input.document.id,
        chunkId: chunk.id,
        analysisRunId: chunk.analysisRunId,
        title: buildEvidenceTitle(rule.tag, concepts, companyMentions),
        snippet: shortenQuote(sentence),
        itemType: "snippet",
        whyTag: rule.tag,
        note: buildEvidenceNote(rule.tag, concepts, companyMentions, parentWaveHint),
        reviewStatus: "pending",
        confidence: Math.min(92, 52 + rule.keywords.filter((keyword) => normalized.includes(keyword)).length * 10),
        companyMentions,
        candidateTopicNames: concepts.slice(0, 3),
        parentWaveHint,
        sourcePages: chunk.sourcePages,
        createdAt,
      });
      break;
    }
  }

  return candidates.slice(0, 6);
}

function mergeCompanyRecords(existingCompanies: Company[], evidenceItems: EvidenceItem[]) {
  const companyMap = new Map(existingCompanies.map((company) => [company.name.toLowerCase(), company]));

  for (const companyName of evidenceItems.flatMap((item) => item.companyMentions)) {
    const key = companyName.toLowerCase();
    if (companyMap.has(key)) continue;
    companyMap.set(key, {
      id: createId("company"),
      name: companyName,
      ticker: "",
      roleDescription: "analysis candidate",
    });
  }

  return [...companyMap.values()];
}

function buildTopicDrafts(
  evidenceItems: EvidenceItem[],
  companies: Company[],
  input: AnalysisInput,
  analysisRunId: string,
  createdAt: string,
) {
  const conceptCounts = new Map<string, number>();

  for (const item of evidenceItems) {
    for (const concept of item.candidateTopicNames) {
      conceptCounts.set(concept, (conceptCounts.get(concept) ?? 0) + 1);
    }
  }

  const repeatedConcepts = [...conceptCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  const drafts: EmergingTopic[] = repeatedConcepts.slice(0, 6).map(([concept, count]) => {
    const relatedEvidence = evidenceItems.filter((item) => item.candidateTopicNames.includes(concept));
    const relatedCompanyNames = new Set(relatedEvidence.flatMap((item) => item.companyMentions));
    const companyIds = companies
      .filter((company) => relatedCompanyNames.has(company.name))
      .map((company) => company.id);
    const parentWaveHint =
      relatedEvidence.find((item) => item.parentWaveHint !== "미지정")?.parentWaveHint ?? "미지정";
    const whyTags = [...new Set(relatedEvidence.map((item) => item.whyTag))];
    const sourcePages = [...new Set(relatedEvidence.flatMap((item) => item.sourcePages))].sort((a, b) => a - b);
    const leadEvidence = relatedEvidence[0];

    return {
      id: createId("topic"),
      slug: slugify(concept),
      name: concept,
      oneLiner: `${concept}가 반복적으로 등장하며 별도 구조로 추적할 가치가 보입니다.`,
      whyNow: leadEvidence
        ? `${leadEvidence.note} 특히 ${shortenQuote(leadEvidence.snippet)}`
        : `${concept} 관련 신호가 최근 문서에서 반복 등장했습니다.`,
      whyItMatters: `${count}개의 evidence 후보가 ${concept}를 가리키고 있으며, ${whyTags.map((tag) => whyTagLabels[tag]).join(", ")} 맥락에서 구조 변화 가능성을 시사합니다.`,
      parentWaveId: "",
      maturityStatus: "unknown",
      reviewStatus: "draft",
      origin: "analysis",
      recentMentions: count,
      linkedDocumentsCount: 1,
      evidenceIds: relatedEvidence.map((item) => item.id),
      companyIds,
      questionIds: [],
      openQuestions: [
        `${concept}가 일시적 수요인지 구조적 전환인지 확인 필요`,
        `${parentWaveHint}와 실제로 연결되는 기업/레이어가 어디인지 확인 필요`,
      ],
      sourceConcepts: [concept],
      parentWaveHint,
      sourcePages,
      lastAnalysisRunId: analysisRunId,
      createdAt,
    };
  });

  const mergedDrafts = drafts.map((draft) => {
    const existing = input.existingTopics.find((topic) => topic.slug === draft.slug);
    if (!existing) return draft;

    return {
      ...existing,
      oneLiner: draft.oneLiner,
      whyNow: draft.whyNow,
      whyItMatters: draft.whyItMatters,
      reviewStatus: existing.reviewStatus === "dismissed" ? "dismissed" : existing.reviewStatus,
      recentMentions: existing.recentMentions + draft.recentMentions,
      linkedDocumentsCount: existing.linkedDocumentsCount + 1,
      evidenceIds: [...new Set([...existing.evidenceIds, ...draft.evidenceIds])],
      companyIds: [...new Set([...existing.companyIds, ...draft.companyIds])],
      openQuestions: [...new Set([...existing.openQuestions, ...draft.openQuestions])],
      sourceConcepts: [...new Set([...existing.sourceConcepts, ...draft.sourceConcepts])],
      parentWaveHint: draft.parentWaveHint,
      sourcePages: [...new Set([...(existing.sourcePages ?? []), ...draft.sourcePages])].sort((a, b) => a - b),
      lastAnalysisRunId: analysisRunId,
    };
  });

  return {
    topicDrafts: mergedDrafts,
    repeatedConcepts: repeatedConcepts.map(([concept]) => concept),
  };
}

export function runDocumentAnalysis(input: AnalysisInput): AnalysisOutput {
  const createdAt = new Date().toISOString();
  const analysisRunId = createId("analysis");

  const pages =
    input.documentPages.length > 0
      ? input.documentPages
      : [
          {
            id: createId("page"),
            documentId: input.document.id,
            pageNumber: 1,
            text: input.document.rawText,
            charStart: 0,
            charEnd: input.document.rawText.length,
            assetPlaceholders: [],
          },
        ];

  const chunks = buildChunksFromPages(input.document, analysisRunId, pages);
  const evidenceItems = chunks.flatMap((chunk) => extractEvidenceFromChunk(chunk, input, createdAt));
  const companies = mergeCompanyRecords(input.existingCompanies, evidenceItems);
  const { topicDrafts, repeatedConcepts } = buildTopicDrafts(
    evidenceItems,
    companies,
    input,
    analysisRunId,
    createdAt,
  );

  return {
    run: {
      id: analysisRunId,
      documentId: input.document.id,
      createdAt,
      status: "completed",
      engineVersion,
      chunkCount: chunks.length,
      evidenceCandidateCount: evidenceItems.length,
      topicDraftCount: topicDrafts.length,
      repeatedConcepts,
      notes: "Rule-based candidate extraction with page-aware traceability.",
    },
    chunks,
    evidenceItems,
    topicDrafts,
    companies,
  };
}
