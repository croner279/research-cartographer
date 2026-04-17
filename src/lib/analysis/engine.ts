import type {
  AnalysisRun,
  Company,
  Document,
  DocumentChunk,
  EmergingTopic,
  EvidenceItem,
  EvidenceWhyTag,
} from "@/lib/types";

type AnalysisInput = {
  document: Document;
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
const overlapLength = 160;

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

function chunkText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const chunks: Array<{ text: string; charStart: number; charEnd: number }> = [];
  let cursor = 0;
  let buffer = "";
  let bufferStart = 0;

  for (const paragraph of paragraphs.length ? paragraphs : [normalized]) {
    const next = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (next.length <= maxChunkLength) {
      if (!buffer) bufferStart = cursor;
      buffer = next;
      cursor += paragraph.length + 2;
      continue;
    }

    if (buffer) {
      chunks.push({
        text: buffer,
        charStart: bufferStart,
        charEnd: bufferStart + buffer.length,
      });
      const overlap = buffer.slice(Math.max(0, buffer.length - overlapLength));
      buffer = overlap ? `${overlap}\n\n${paragraph}` : paragraph;
      bufferStart = Math.max(0, cursor - overlap.length);
    } else {
      const sentences = splitSentences(paragraph);
      let sentenceBuffer = "";
      let sentenceStart = cursor;
      for (const sentence of sentences) {
        const candidate = sentenceBuffer ? `${sentenceBuffer} ${sentence}` : sentence;
        if (candidate.length <= maxChunkLength) {
          sentenceBuffer = candidate;
          continue;
        }
        if (sentenceBuffer) {
          chunks.push({
            text: sentenceBuffer,
            charStart: sentenceStart,
            charEnd: sentenceStart + sentenceBuffer.length,
          });
          sentenceStart += sentenceBuffer.length + 1;
        }
        sentenceBuffer = sentence;
      }
      if (sentenceBuffer) {
        chunks.push({
          text: sentenceBuffer,
          charStart: sentenceStart,
          charEnd: sentenceStart + sentenceBuffer.length,
        });
      }
      buffer = "";
      bufferStart = cursor + paragraph.length + 2;
    }

    cursor += paragraph.length + 2;
  }

  if (buffer) {
    chunks.push({
      text: buffer,
      charStart: bufferStart,
      charEnd: bufferStart + buffer.length,
    });
  }

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
      /\b(?:[A-Z]{2,}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[a-z]{4,}\s+(?:power|grid|cooling|memory|packaging|networking|inference|interconnect|automation|supply|rack|cluster|stack|fabric|load))\b/g,
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

function buildEvidenceTitle(tag: EvidenceWhyTag, snippet: string, concepts: string[]) {
  if (concepts[0]) {
    return `${concepts[0]} / ${tag}`;
  }
  const shortened = snippet.replace(/\s+/g, " ").trim().slice(0, 42);
  return `${tag} / ${shortened}`;
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
      candidates.push({
        id: createId("evidence"),
        documentId: input.document.id,
        chunkId: chunk.id,
        analysisRunId: chunk.analysisRunId,
        title: buildEvidenceTitle(rule.tag, sentence, concepts),
        snippet: sentence,
        itemType: "snippet",
        whyTag: rule.tag,
        note: "자동 추출 후보",
        reviewStatus: "pending",
        confidence: Math.min(92, 52 + rule.keywords.filter((keyword) => normalized.includes(keyword)).length * 10),
        companyMentions,
        candidateTopicNames: concepts.slice(0, 3),
        parentWaveHint: inferWaveHint(sentence),
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
    const whyTags = new Set(relatedEvidence.map((item) => item.whyTag));

    return {
      id: createId("topic"),
      slug: slugify(concept),
      name: concept,
      oneLiner: `${concept} 관련 신호가 여러 문서 조각에서 반복적으로 등장하고 있습니다.`,
      whyNow: relatedEvidence
        .slice(0, 2)
        .map((item) => item.snippet)
        .join(" "),
      whyItMatters: `${count}개의 후보 증거가 ${concept}를 가리키고 있으며, ${[...whyTags].join(", ")} 맥락에서 구조 변화 가능성을 보여줍니다.`,
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

  const chunks = chunkText(input.document.rawText).map((chunk, index) => ({
    id: createId("chunk"),
    documentId: input.document.id,
    analysisRunId,
    order: index,
    text: chunk.text,
    charStart: chunk.charStart,
    charEnd: chunk.charEnd,
    tokenEstimate: Math.ceil(chunk.text.length / 4),
  }));

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
      notes: "Rule-based candidate extraction. 승인 전까지 초안으로 유지됩니다.",
    },
    chunks,
    evidenceItems,
    topicDrafts,
    companies,
  };
}
