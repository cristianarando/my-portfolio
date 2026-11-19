import type { Lang } from "../i18n/utils";

export const readingPaths = [
  {
    id: "building-web-systems",
    title: "Building thoughtful web systems",
    description:
      "Start with foundational motivation, adopt strategic pessimism in architecture, and examine real-world security boundaries.",
    prerequisites:
      "Basic familiarity with systems thinking and HTTP. No specific framework is required.",
    i18n: {
      en: {
        title: "Building thoughtful web systems",
        description:
          "Start with foundational motivation, adopt strategic pessimism in architecture, and examine real-world security boundaries.",
        prerequisites:
          "Basic familiarity with systems thinking and HTTP. No specific framework is required.",
      },
      es: {
        title: "Construyendo sistemas web bien pensados",
        description:
          "Comienza con la motivación fundamental, adopta el pesimismo estratégico en la arquitectura y examina fronteras reales de seguridad.",
        prerequisites:
          "Familiaridad básica con el pensamiento sistémico y HTTP. No se requiere ningún framework específico.",
      },
      de: {
        title: "Durchdachte Web-Systeme entwickeln",
        description:
          "Beginnen Sie mit den Grundlagen, nutzen Sie strategischen Pessimismus in der Architektur und analysieren Sie reale Sicherheitsgrenzen.",
        prerequisites:
          "Grundlegende Kenntnisse in Systemdenken und HTTP. Ein bestimmtes Framework ist nicht erforderlich.",
      },
      ru: {
        title: "Проектирование продуманных веб-систем",
        description:
          "Начните с фундаментальной мотивации, примените стратегический пессимизм в архитектуре и изучите реальные границы безопасности.",
        prerequisites:
          "Базовое понимание системного мышления и HTTP. Конкретный фреймворк не требуется.",
      },
      ja: {
        title: "思慮深いWebシステムの構築",
        description:
          "根源的な動機から出発し、アーキテクチャにおける戦略的ペシミズムを取り入れ、実践的なセキュリティ境界を検証します。",
        prerequisites:
          "システム思考とHTTPの基礎知識。特定のフレームワークの知識は不要です。",
      },
    },
    slugs: ["hello-world", "strategic-pessimism", "my-final-project"],
  },
  {
    id: "reading-and-reflection",
    title: "Reading and reflection",
    description:
      "Explore the personal bookshelf, trace literature tier lists, and confront the existential weight of hyper-consciousness.",
    prerequisites: "Curiosity and a place to keep your own reading notes.",
    i18n: {
      en: {
        title: "Reading and reflection",
        description:
          "Explore the personal bookshelf, trace literature tier lists, and confront the existential weight of hyper-consciousness.",
        prerequisites: "Curiosity and a place to keep your own reading notes.",
      },
      es: {
        title: "Lectura y reflexión",
        description:
          "Explora la biblioteca personal, recorre las clasificaciones literarias y confronta el peso existencial de la hiperconciencia.",
        prerequisites:
          "Curiosidad y un lugar donde guardar tus propias notas de lectura.",
      },
      de: {
        title: "Lesen und Reflexion",
        description:
          "Erkunden Sie das persönliche Bücherregal, literarische Einordnungen und die existenzielle Schwere des Hyperbewusstseins.",
        prerequisites: "Neugier und ein Ort für eigene Lesenotizen.",
      },
      ru: {
        title: "Чтение и рефлексия",
        description:
          "Исследуйте личную книжную полку, литературные подборки и экзистенциальную тяжесть гиперсознания.",
        prerequisites:
          "Любознательность и место для собственных читательских заметок.",
      },
      ja: {
        title: "読書と内省",
        description:
          "個人の本棚や文学ティアリストをたどり、過剰な自意識がもたらす実存的な重みと向き合います。",
        prerequisites: "好奇心と、自分の読書ノートを書き留める場所。",
      },
    },
    slugs: ["my-bookshelf", "my-most-notable-reads", "notes-from-underground"],
  },
  {
    id: "cognitive-architecture",
    title: "Cognitive Architecture & Mental Models",
    description:
      "From dissecting formal fallacies and climbing levels of logical abstraction to engineering resilience against catastrophic failure.",
    prerequisites:
      "An analytical mindset and an interest in epistemological rigor.",
    i18n: {
      en: {
        title: "Cognitive Architecture & Mental Models",
        description:
          "From dissecting formal fallacies and climbing levels of logical abstraction to engineering resilience against catastrophic failure.",
        prerequisites:
          "An analytical mindset and an interest in epistemological rigor.",
      },
      es: {
        title: "Arquitectura cognitiva y modelos mentales",
        description:
          "Desde diseccionar falacias formales y escalar niveles de abstracción lógica hasta diseñar resiliencia frente a fallos catastróficos.",
        prerequisites:
          "Mentalidad analítica e interés por el rigor epistemológico.",
      },
      de: {
        title: "Kognitive Architektur & Mentale Modelle",
        description:
          "Von der Analyse formaler Fehlschlüsse über logische Abstraktionsebenen bis zur Entwicklung von Resilienz gegen Systemausfälle.",
        prerequisites:
          "Analytisches Denken und Interesse an erkenntnistheoretischer Strenge.",
      },
      ru: {
        title: "Когнитивная архитектура и ментальные модели",
        description:
          "От разбора формальных логических ошибок и уровней абстракции до проектирования устойчивости к катастрофическим сбоям.",
        prerequisites:
          "Аналитический склад ума и интерес к эпистемологической строгости.",
      },
      ja: {
        title: "認知アーキテクチャとメンタルモデル",
        description:
          "形式的誤謬の解剖や論理的抽象化の階層から、壊滅的な障害に対するレジリエンス設計までを探求します。",
        prerequisites: "分析的な思考姿勢と認識論的厳密さへの関心。",
      },
    },
    slugs: [
      "logical-fallacies",
      "seven-levels-of-logical-thinking",
      "strategic-pessimism",
    ],
  },
] as const;

export function getReadingPaths(lang: Lang) {
  return readingPaths.map((path) => {
    const localized = path.i18n[lang] || path.i18n.en;
    return {
      id: path.id,
      title: localized.title,
      description: localized.description,
      prerequisites: localized.prerequisites,
      slugs: path.slugs,
    };
  });
}
