import { fluenttube } from "./fluenttube.ts";
import type { ProjectCopy } from "../../../data/projects";

export const projectCopy = {
  "onelink-saas": {
    title: "OneLink SaaS - リンクインバイオ＆クリエイター分析基盤",
    description:
      "Next.js 16、NestJS 12、PostgreSQL、TimescaleDB、Redis、BullMQ、Dockerを採用した高性能・高可用性リンクインバイオSaaSプラットフォーム。",
  },
  "kerr-spacetime-workstation": {
    title: "Kerr Spacetime Workstation - 数値相対論＆WebGL",
    description:
      "WebGL 2.0、Three.js、GLSLシェーダーによる回転ブラックホール（カー時空）と降着円盤のリアルタイム数値相対論ワークステーション。",
  },
  "crowdsafe-physics": {
    title: "CrowdSafe-Physics - 歩行者力学・避難シミュレーション",
    description:
      "PythonとFastAPIで構築された、HFV社会力モデルに基づく群衆力学・避難実験のための対話型研究スタジオ。",
  },
  fluenttube: { title: fluenttube.title, description: fluenttube.description },
  "reservation-microsystem": {
    title: "Reservas App - マルチスタッフ予約管理・オンラインブッキング基盤",
    description:
      "Next.js 16、TypeScript、Prisma、SSEリアルタイム同期、RFC 8292/8291ネイティブWeb Push、PWA、Dockerで構築したモジュラー型予約管理プラットフォーム。",
  },
  "inside-link": {
    title: "InsideLink v2 - スマート短縮URL・プロジェクトHUB＆分析基盤",
    description:
      "Next.js 16、Turso、Drizzle ORM、Better-Authで構築したセルフホスト型短縮リンクエンジン、ポリモーフィックHUBページ、テーマスタジオ、ゼロPII分析プラットフォーム。",
  },
  "explora-bolivia": {
    title: "Explora Bolivia - Travel Guide App",
    description:
      "ボリビアの観光地、宿泊施設、地元文化に関する情報を提供するNext.jsとNestJSで構築された旅行ガイドWebアプリケーション。",
  },
  "maxi-basquet": {
    title: "Maxi Basquet - Basketball Team Management",
    description:
      "DjangoとBootstrapで構築された、選手統計、試合日程、チーム順位を含むバスケットボールチーム管理用Webアプリケーション。",
  },
  "long-old-live": {
    title: "Long Old Live+",
    description:
      "高齢者の健康維持を目的とし、筋肉トレーニングや頭脳活動を提供するWebサイト。JavaScript、HTML、CSSで開発。",
  },
} satisfies ProjectCopy;
