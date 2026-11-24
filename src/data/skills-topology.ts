import type { Lang } from "../i18n/utils";
import type { Project, SkillCategory } from "../types";
import type { ProjectId } from "./projects";

export type SkillDomainId =
  | "languages"
  | "frontend"
  | "backend"
  | "databases"
  | "devops"
  | "security"
  | "ai"
  | "soft-skills";

export interface TopologyProjectEvidence {
  id: ProjectId;
  title: string;
  category: string;
  url: string;
  matchedSkills: string[];
}

export interface TopologyNode {
  id: SkillDomainId;
  name: string;
  description: string;
  constellation: string;
  alpha: string;
  roleNote: string;
  x: number;
  y: number;
  items: string[];
  connections: SkillDomainId[];
  projects: TopologyProjectEvidence[];
}

export interface TopologyEdge {
  from: SkillDomainId;
  to: SkillDomainId;
}

export interface SkillsTopology {
  lang: Lang;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

const NODE_META: Record<
  SkillDomainId,
  {
    x: number;
    y: number;
    constellation: string;
    alpha: string;
  }
> = {
  languages: { x: 135, y: 115, constellation: "CYGNUS", alpha: "Deneb" },
  frontend: { x: 320, y: 95, constellation: "LYRA", alpha: "Vega" },
  databases: { x: 505, y: 115, constellation: "CASSIOPEIA", alpha: "Schedar" },
  ai: { x: 115, y: 300, constellation: "PEGASUS", alpha: "51 Pegasi" },
  backend: { x: 320, y: 290, constellation: "URSA MAJOR", alpha: "Dubhe" },
  security: { x: 525, y: 300, constellation: "DRACO", alpha: "Eltanin" },
  "soft-skills": { x: 185, y: 475, constellation: "AQUILA", alpha: "Altair" },
  devops: { x: 455, y: 475, constellation: "ORION", alpha: "Alnilam" },
};

export const TOPOLOGY_EDGES: readonly TopologyEdge[] = [
  { from: "languages", to: "frontend" },
  { from: "languages", to: "backend" },
  { from: "languages", to: "ai" },
  { from: "frontend", to: "backend" },
  { from: "backend", to: "databases" },
  { from: "backend", to: "security" },
  { from: "backend", to: "devops" },
  { from: "databases", to: "devops" },
  { from: "ai", to: "backend" },
  { from: "security", to: "devops" },
  { from: "soft-skills", to: "languages" },
  { from: "soft-skills", to: "ai" },
  { from: "soft-skills", to: "security" },
];

const ROLE_NOTES: Record<Lang, Record<SkillDomainId, string>> = {
  en: {
    languages:
      "Core strongly typed and scripting foundations powering frontend interfaces, hexagonal backends, numerical engines, and AI pipelines.",
    frontend:
      "Component architectures, static SSR optimization, and fluid client telemetry backed by backend APIs and strict typing.",
    backend:
      "Decoupled application cores exposing typed REST/WebSocket boundaries, orchestrating databases, security gates, and AI workers.",
    databases:
      "Transactional relational schemas, time-series hypertables, cache-aside stores, and local WAL persistence supporting runtime services.",
    devops:
      "Containerized build pipelines, automated quality checks, and Linux runtime environments ensuring deterministic delivery.",
    security:
      "OWASP threat defense, hierarchical RBAC enforcement, API contract validation, and perimeter verification across services.",
    ai: "Local inference workflows, lexical threat inspection, and agentic orchestration structured around clean tool protocols.",
    "soft-skills":
      "Architectural communication, iterative problem decomposition, and cross-functional leadership aligning technical decisions with outcomes.",
  },
  es: {
    languages:
      "Base tipada y de scripting que sostiene interfaces frontend, backends hexagonales, simuladores numéricos y flujos de IA.",
    frontend:
      "Arquitecturas de componentes, renderizado estático SSR y telemetría fluida conectadas con APIs tipadas de backend.",
    backend:
      "Núcleos de aplicación desacoplados con fronteras REST y WebSocket que orquestan bases de datos, seguridad y workers de IA.",
    databases:
      "Esquemas relacionales ACID, hypertables temporales, caché en memoria y SQLite WAL al servicio de la capa de dominio.",
    devops:
      "Entornos reproducibles en contenedores, pipelines de verificación automatizada y despliegue determinista sobre Linux.",
    security:
      "Defensa preventiva OWASP, control RBAC jerárquico, validación de contratos API y auditoría continua de bordes.",
    ai: "Inferencia local en dispositivo, escaneo léxico de amenazas y flujos agénticos estructurados con protocolos claros.",
    "soft-skills":
      "Comunicación arquitectónica clara, descomposición rigurosa de complejidad y liderazgo colaborativo orientado a calidad.",
  },
  de: {
    languages:
      "Stark typisierte und skriptbasierte Fundamente für Frontend-Oberflächen, hexagonale Backends, Physik-Engines und KI-Pipelines.",
    frontend:
      "Komponentenarchitekturen, statische SSR-Optimierung und reaktive Oberflächen gekoppelt an typisierte Backend-Schnittstellen.",
    backend:
      "Entkoppelte Anwendungskerne mit REST- und WebSocket-Verträgen zur Orchestrierung von Datenbanken, Sicherheit und KI-Workern.",
    databases:
      "Relationale ACID-Schemas, Zeitreihen-Hypertables, Cache-Aside-Speicher und lokale WAL-Persistenz.",
    devops:
      "Containerisierte Builds, automatisierte Qualitätsprüfungen und Linux-Laufzeitumgebungen für reproduzierbare Releases.",
    security:
      "OWASP-Schutzmechanismen, hierarchisches RBAC, API-Vertragsvalidierung und Perimetersicherheit über Service-Grenzen hinweg.",
    ai: "Lokale KI-Inferenz, lexikalische Bedrohungsanalyse und strukturierte Agenten-Workflows.",
    "soft-skills":
      "Präzise Architekturkommunikation, analytische Problemzerlegung und zielgerichtete Zusammenarbeit im Team.",
  },
  ru: {
    languages:
      "Строго типизированные и скриптовые языки, объединяющие фронтенд, гексагональные бэкенды, численные симуляции и ИИ-пайплайны.",
    frontend:
      "Компонентные архитектуры, SSR-оптимизация и плавная визуализация, опирающиеся на контракты бэкенда.",
    backend:
      "Изолированное ядро бизнес-логики с границами REST и WebSocket, связывающее базы данных, контуры защиты и воркеры ИИ.",
    databases:
      "Реляционные транзакционные схемы, гипертаблицы временных рядов, кэш Redis и локальное хранилище SQLite WAL.",
    devops:
      "Контейнеризация Docker, автоматизация проверок CI/CD и воспроизводимые среды выполнения Linux.",
    security:
      "Практики OWASP, иерархический контроль доступа RBAC, валидация API и проактивная защита периметра.",
    ai: "Локальный инференс, лексический анализ угроз и оркестрация агентных рабочих процессов.",
    "soft-skills":
      "Ясная архитектурная коммуникация, системная декомпозиция сложных задач и эффективное техническое лидерство.",
  },
  ja: {
    languages:
      "フロントエンドUI、ヘキサゴナル・バックエンド、数値シミュレーション、AIパイプラインを支える型安全かつ柔軟な基盤言語群。",
    frontend:
      "型付きバックエンドAPIと連携するコンポーネント設計、静的SSR最適化、滑らかなクライアント描画。",
    backend:
      "REST・WebSocket境界を通じてデータベース、セキュリティ制御、AIワーカーを統括する疎結合アプリケーションコア。",
    databases:
      "ACID準拠のリレーショナルDB、時系列ハイパーテーブル、インメモリキャッシュ、ローカルSQLite WALによる永続化基盤。",
    devops:
      "Dockerコンテナ化、CI/CD自動検証、再現性の高いLinuxランタイム環境による堅牢なデリバリー。",
    security:
      "OWASP対策、階層的RBAC権限管理、API契約検証、および境界防御による継続的な安全性確保。",
    ai: "ローカル音声・言語推論、字句脅威スキャン、明確なプロトコルに基づくエージェントワークフロー。",
    "soft-skills":
      "設計意図を明確に伝えるコミュニケーション、複雑な課題の構造的分解、およびチーム協働の推進力。",
  },
};

function normalizeToken(value: string): string {
  return value.toLowerCase().trim();
}

function projectMatchesSkill(
  skill: string,
  techList: string[],
  projectId: ProjectId,
): boolean {
  const normalizedSkill = normalizeToken(skill);
  const techSet = new Set(techList.map(normalizeToken));

  if (techSet.has(normalizedSkill)) {
    return true;
  }

  // Handle exact non-ambiguous associations verified in project catalog & case studies
  if (normalizedSkill === "javascript") {
    return techSet.has("javascript") || techSet.has("javascript vanilla");
  }
  if (normalizedSkill === "java") {
    return techSet.has("java");
  }
  if (normalizedSkill === "css") {
    return techSet.has("css") || techSet.has("tailwind css");
  }
  if (normalizedSkill === "node.js") {
    return (
      techSet.has("node.js") || techSet.has("nestjs") || techSet.has("next.js")
    );
  }
  if (normalizedSkill === "ci/cd") {
    return techSet.has("ci/cd") || techSet.has("gitlab");
  }
  if (normalizedSkill === "owasp" || normalizedSkill === "api security") {
    return projectId === "onelink-saas";
  }
  if (
    normalizedSkill.includes("agent") ||
    normalizedSkill.includes("agéntic") ||
    normalizedSkill.includes("prompt") ||
    normalizedSkill.includes("агент") ||
    normalizedSkill.includes("промпт") ||
    normalizedSkill.includes("エージェント") ||
    normalizedSkill.includes("プロンプト")
  ) {
    return projectId === "fluenttube" || projectId === "onelink-saas";
  }

  return false;
}

export function buildSkillsTopology(
  lang: Lang,
  categories: readonly SkillCategory[],
  projects: readonly Project[],
): SkillsTopology {
  const notes = ROLE_NOTES[lang] ?? ROLE_NOTES.en;

  const nodes: TopologyNode[] = categories.map((cat) => {
    const id = cat.id as SkillDomainId;
    const meta = NODE_META[id];

    const connections = TOPOLOGY_EDGES.flatMap((edge) => {
      if (edge.from === id) return [edge.to];
      if (edge.to === id) return [edge.from];
      return [];
    });

    const evidence: TopologyProjectEvidence[] = [];
    for (const project of projects) {
      const pid = project.id as ProjectId;
      const matchedSkills = cat.items.filter((item) =>
        projectMatchesSkill(item, project.tech, pid),
      );
      if (matchedSkills.length > 0) {
        evidence.push({
          id: pid,
          title: project.title,
          category: project.category,
          url: `/${lang}/projects/${pid}/`,
          matchedSkills,
        });
      }
    }

    return {
      id,
      name: cat.name,
      description: cat.description ?? "",
      constellation: meta.constellation,
      alpha: meta.alpha,
      roleNote: notes[id],
      x: meta.x,
      y: meta.y,
      items: cat.items,
      connections,
      projects: evidence,
    };
  });

  return {
    lang,
    nodes,
    edges: [...TOPOLOGY_EDGES],
  };
}
