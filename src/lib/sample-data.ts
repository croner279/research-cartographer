import type { DashboardData, DocumentStatus } from "@/lib/types";

export const queueStatusLabels: Record<DocumentStatus, string> = {
  inbox: "inbox",
  skimmed: "skimmed",
  highlighted: "highlighted",
  extracted: "extracted",
  linked: "linked",
  archived: "archived",
};

export const sampleDashboard: DashboardData = {
  companies: [
    {
      id: "company-1",
      name: "Coherent",
      ticker: "COHR",
      roleDescription: "광통신 부품과 high-speed optical module ecosystem의 핵심 플레이어.",
    },
    {
      id: "company-2",
      name: "Marvell",
      ticker: "MRVL",
      roleDescription: "AI infra 네트워크, custom silicon, optical interconnect adjacent layer 노출.",
    },
    {
      id: "company-3",
      name: "SK hynix",
      ticker: "000660.KS",
      roleDescription: "HBM과 memory pricing recovery의 핵심 수혜층.",
    },
    {
      id: "company-4",
      name: "Twist Bioscience",
      ticker: "TWST",
      roleDescription: "합성생물학 설계·제작 workflow에서 foundry형 역할 가능성.",
    },
  ],
  documents: [
    {
      id: "doc-1",
      title: "Optical Interconnect Vendor Notes",
      source: "Broker note",
      documentType: "note",
      status: "highlighted",
      publishedAt: "2026-04-12",
      summaryLine: "GPU scale-up 이후 rack-level optical shift 가능성을 반복 언급.",
      rawText:
        "Multiple vendors are now discussing optical interconnect not as a distant architecture idea, but as a practical path for rack-scale bandwidth and power constraints. Several references compare copper limits against future AI cluster density requirements. Mentions are still scattered, but the tone has shifted from optional to increasingly necessary in certain deployments.",
    },
    {
      id: "doc-2",
      title: "Memory Recovery Channel Check",
      source: "Channel check",
      documentType: "report",
      status: "linked",
      publishedAt: "2026-04-10",
      summaryLine: "HBM 중심 수급 타이트닝이 broader memory recovery로 번질 수 있다는 시그널.",
      rawText:
        "The latest checks suggest pricing firmness is no longer isolated to one pocket of HBM. Allocation behavior and customer conversations imply improving discipline across adjacent memory categories. If AI demand remains strong, the recovery could broaden earlier than consensus expects.",
    },
    {
      id: "doc-3",
      title: "Synthetic Biology Foundry Landscape",
      source: "Industry deck",
      documentType: "deck",
      status: "extracted",
      publishedAt: "2026-04-09",
      summaryLine: "Foundry, automation, and design software가 별도 layer로 부상하는 초기 징후.",
      rawText:
        "Foundry capabilities in synthetic biology are being framed less as a service wrapper and more as a scalable infrastructure layer. The combination of automation, design tools, and workflow standardization may create a distinct value capture point before downstream applications fully mature.",
    },
    {
      id: "doc-4",
      title: "Grid Upgrade and AI Power Demand",
      source: "Consulting memo",
      documentType: "memo",
      status: "inbox",
      publishedAt: "2026-04-15",
      summaryLine: "AI data center buildout과 송배전 업그레이드가 같은 문맥에서 등장.",
      rawText:
        "Transmission bottlenecks, transformer constraints, and interconnection queues are increasingly mentioned alongside AI data center expansion. The investment implication may not be just generation, but the enabling grid layer that determines deployment speed.",
    },
    {
      id: "doc-5",
      title: "Optics Supply Chain Follow-up",
      source: "Expert call",
      documentType: "transcript",
      status: "skimmed",
      publishedAt: "2026-04-13",
      summaryLine: "optics capex cycle이 component, DSP, module supplier 전체로 번질 수 있다는 코멘트.",
      rawText:
        "The expert highlighted that once optical adoption crosses a threshold, the discussion shifts from one hero product to a layered supply chain. DSP, packaging, photonics, and testing could all participate depending on where the bottleneck sits.",
    },
  ],
  topics: [
    {
      id: "topic-1",
      slug: "optical-interconnect",
      name: "Optical Interconnect",
      oneLiner: "AI cluster bandwidth와 전력 병목을 동시에 푸는 다음 연결 레이어 후보.",
      whyNow:
        "GPU density와 rack-scale traffic이 커지면서 copper 기반 연결의 power / reach 한계가 실제 운영 이슈로 언급되기 시작했습니다.",
      whyItMatters:
        "단순 부품이 아니라, AI infrastructure의 다음 layer shift일 수 있어 value chain 재편 가능성이 있습니다.",
      parentWaveId: "wave-1",
      maturityStatus: "emerging",
      recentMentions: 7,
      linkedDocumentsCount: 3,
      evidenceIds: ["evidence-1", "evidence-2", "evidence-5"],
      companyIds: ["company-1", "company-2"],
      questionIds: ["question-1", "question-2"],
    },
    {
      id: "topic-2",
      slug: "memory-recovery",
      name: "Memory Recovery",
      oneLiner: "HBM에서 시작된 타이트닝이 broader memory pricing cycle로 번지는지 보는 구조.",
      whyNow:
        "HBM 이후 adjacent category까지 pricing discipline 언급이 늘고 있으며 inventory narrative도 바뀌고 있습니다.",
      whyItMatters:
        "AI beneficiary 한정이 아니라, broader cyclical recovery로 확산되면 winner set이 달라질 수 있습니다.",
      parentWaveId: "wave-2",
      maturityStatus: "interesting",
      recentMentions: 5,
      linkedDocumentsCount: 2,
      evidenceIds: ["evidence-3"],
      companyIds: ["company-3"],
      questionIds: ["question-3"],
    },
    {
      id: "topic-3",
      slug: "synthetic-biology-foundry",
      name: "Synthetic Biology Foundry",
      oneLiner: "합성생물학에서 design-build-test를 묶는 foundry layer가 독립 가치층으로 부상하는지 관찰.",
      whyNow:
        "응용 사례보다 먼저 tooling, automation, workflow layer가 반복적으로 언급되고 있습니다.",
      whyItMatters:
        "application winner보다 먼저 infrastructure winner가 나올 수 있다는 뜻입니다.",
      parentWaveId: "wave-3",
      maturityStatus: "unknown",
      recentMentions: 4,
      linkedDocumentsCount: 1,
      evidenceIds: ["evidence-4"],
      companyIds: ["company-4"],
      questionIds: ["question-4"],
    },
  ],
  waves: [
    {
      id: "wave-1",
      slug: "ai-infrastructure-expansion",
      title: "AI Infrastructure Expansion",
      thesis:
        "AI capex가 compute만이 아니라 network, optics, power, packaging으로 퍼지면서 multi-layered infrastructure wave가 형성되고 있다.",
      stage: "accelerating",
      keyBottlenecks: [
        "rack-level bandwidth scaling",
        "power density and cooling constraints",
        "optical module supply chain ramp",
      ],
      valueCaptureLayers: ["optical modules", "DSP / networking", "advanced packaging"],
      latestInterpretation:
        "이 wave의 핵심은 단일 GPU vendor story가 아니라, 병목이 어디로 이동하는지에 따라 다음 value capture layer가 바뀐다는 점입니다.",
      companyIds: ["company-1", "company-2"],
      evidenceIds: ["evidence-1", "evidence-2", "evidence-5"],
    },
    {
      id: "wave-2",
      slug: "memory-recovery",
      title: "Memory Recovery",
      thesis:
        "HBM의 tightness가 broader memory discipline으로 확산되면 반도체 cycle 해석 자체가 바뀔 수 있다.",
      stage: "early",
      keyBottlenecks: [
        "supply discipline durability",
        "AI demand concentration",
        "legacy inventory normalization",
      ],
      valueCaptureLayers: ["HBM leaders", "DRAM recovery", "equipment follow-through"],
      latestInterpretation:
        "현재는 HBM만 강하다는 프레임이 지배적이지만, adjacent category로 tone change가 이어지는지 봐야 합니다.",
      companyIds: ["company-3"],
      evidenceIds: ["evidence-3"],
    },
    {
      id: "wave-3",
      slug: "synthetic-biology-commercialization",
      title: "Synthetic Biology Commercialization",
      thesis:
        "장기 application story보다 먼저 foundry, automation, design tooling layer가 상업화의 진입점을 만들 수 있다.",
      stage: "uncertain",
      keyBottlenecks: ["unit economics proof", "repeatable workflows", "commercial adoption timing"],
      valueCaptureLayers: ["foundry services", "automation", "design software"],
      latestInterpretation:
        "platform promise는 오래됐지만, 최근에는 infrastructure-like language가 늘고 있어 layer 분리가 필요한 시점입니다.",
      companyIds: ["company-4"],
      evidenceIds: ["evidence-4"],
    },
  ],
  questions: [
    {
      id: "question-1",
      title: "Optical interconnect는 일시적 병목인가, multi-year wave인가?",
      description:
        "현재 언급이 특정 AI cluster 세대에 한정된 이슈인지, 더 넓은 infra layer shift인지 구분해야 합니다.",
      waveId: "wave-1",
      supportingEvidence: [
        "여러 vendor note에서 power/bandwidth를 동시에 언급",
        "optics가 optional에서 necessary로 tone change",
      ],
      opposingEvidence: [
        "deployment timing이 생각보다 늦어질 수 있음",
        "copper 개선이 당분간 버틸 수 있다는 시각 존재",
      ],
      linkedEvidence: [
        { evidenceId: "evidence-1", stance: "supporting" },
        { evidenceId: "evidence-5", stance: "supporting" },
      ],
      confidence: 68,
      lastUpdated: "2026-04-15",
    },
    {
      id: "question-2",
      title: "현재 AI leader가 다음 optical layer winner도 될까?",
      description:
        "compute winner와 network / optics winner가 다를 가능성을 열어둬야 합니다.",
      waveId: "wave-1",
      supportingEvidence: ["supply chain가 multi-layer 구조라는 expert call 코멘트"],
      opposingEvidence: ["기존 leader가 번들링으로 이익을 가져갈 가능성"],
      linkedEvidence: [{ evidenceId: "evidence-2", stance: "supporting" }],
      confidence: 54,
      lastUpdated: "2026-04-14",
    },
    {
      id: "question-3",
      title: "Memory recovery는 AI 특수인가, broader cycle 전환인가?",
      description: "HBM 외 카테고리로 pricing discipline이 확산되는지 확인해야 합니다.",
      waveId: "wave-2",
      supportingEvidence: ["adjacent category commentary 증가"],
      opposingEvidence: ["AI 외 수요 회복은 아직 약함"],
      linkedEvidence: [{ evidenceId: "evidence-3", stance: "supporting" }],
      confidence: 61,
      lastUpdated: "2026-04-12",
    },
    {
      id: "question-4",
      title: "Synthetic biology에서 value capture는 어디로 이동할까?",
      description:
        "downstream application보다 먼저 tooling/foundry가 독립 층이 될 수 있는지 봅니다.",
      waveId: "wave-3",
      supportingEvidence: ["foundry layer 반복 언급", "workflow standardization narrative 증가"],
      opposingEvidence: ["상업화 timing 불확실"],
      linkedEvidence: [{ evidenceId: "evidence-4", stance: "supporting" }],
      confidence: 48,
      lastUpdated: "2026-04-11",
    },
  ],
  evidenceItems: [
    {
      id: "evidence-1",
      documentId: "doc-1",
      title: "Copper limits are now framed as operational",
      snippet:
        "Several references compare copper limits against future AI cluster density requirements and treat them as a practical issue rather than a distant architecture discussion.",
      itemType: "snippet",
      whyTag: "structure hint",
      note: "tone change가 핵심",
    },
    {
      id: "evidence-2",
      documentId: "doc-5",
      title: "Optics adoption creates a layered supply chain",
      snippet:
        "Once optical adoption crosses a threshold, DSP, packaging, photonics, and testing could all participate depending on where the bottleneck sits.",
      itemType: "snippet",
      whyTag: "value chain shift",
      note: "winner set이 분화될 가능성",
    },
    {
      id: "evidence-3",
      documentId: "doc-2",
      title: "Pricing firmness may broaden beyond HBM",
      snippet:
        "Allocation behavior and customer conversations imply improving discipline across adjacent memory categories.",
      itemType: "snippet",
      whyTag: "new demand",
      note: "cycle broadening 가능성",
    },
    {
      id: "evidence-4",
      documentId: "doc-3",
      title: "Foundry framed as infrastructure layer",
      snippet:
        "Foundry capabilities are being framed less as a service wrapper and more as a scalable infrastructure layer.",
      itemType: "snippet",
      whyTag: "structure hint",
      note: "application 이전에 infra winner 가능",
    },
    {
      id: "evidence-5",
      documentId: "doc-1",
      title: "Power and bandwidth mentioned together",
      snippet:
        "The tone shifted from optional to increasingly necessary in deployments where both power and throughput constraints bite at the same time.",
      itemType: "note",
      whyTag: "bottleneck",
      note: "병목의 다중화",
    },
  ],
  missedReviews: [
    {
      id: "missed-1",
      themeName: "AI Networking Upgrade",
      winnerNames: ["Arista", "Broadcom"],
      earlyClues:
        "cluster scale-out과 network spend 확대가 여러 note에 반복 등장했지만 compute headline에 가려짐.",
      whyMissed:
        "GPU 공급만 핵심이라고 생각했고, adjacent layer의 value capture를 과소평가함.",
      watchNextTime: "반복 언급되는 enabling layer를 별도 wave로 분리해서 추적할 것.",
    },
    {
      id: "missed-2",
      themeName: "Obesity Platform Expansion",
      winnerNames: ["Eli Lilly", "Novo Nordisk"],
      earlyClues:
        "treatment efficacy뿐 아니라 supply chain, manufacturing expansion 단서가 이미 존재했음.",
      whyMissed:
        "clinical novelty만 보고 commercial system build-out을 구조로 보지 못함.",
      watchNextTime:
        "수요 폭증이 upstream capacity와 ecosystem build-out을 만들 때 구조로 인식할 것.",
    },
  ],
  queueColumns: [],
};

export function buildQueueColumns(documents: DashboardData["documents"]) {
  return [
    { label: "inbox", documents: documents.filter((item) => item.status === "inbox") },
    { label: "skimmed", documents: documents.filter((item) => item.status === "skimmed") },
    { label: "highlighted", documents: documents.filter((item) => item.status === "highlighted") },
    { label: "extracted", documents: documents.filter((item) => item.status === "extracted") },
    { label: "linked", documents: documents.filter((item) => item.status === "linked") },
    { label: "archived", documents: documents.filter((item) => item.status === "archived") },
  ];
}

sampleDashboard.queueColumns = buildQueueColumns(sampleDashboard.documents);
