import { fluenttube } from "./fluenttube.ts";
import type { ProjectCopy } from "../../../data/projects";

export const projectCopy = {
  "onelink-saas": {
    title: "OneLink SaaS - Link-in-Bio & Creator Telemetry Platform",
    description:
      "High-performance, mobile-first Link-in-Bio platform engineered with Next.js 16, NestJS 12, PostgreSQL, TimescaleDB, Redis, BullMQ, and Docker.",
  },
  "kerr-spacetime-workstation": {
    title: "Kerr Spacetime Workstation - Numerical Relativity & WebGL",
    description:
      "Interactive General Relativistic Kerr spacetime solver and radiative accretion workstation in WebGL 2.0, Three.js, and custom GLSL shaders.",
  },
  "crowdsafe-physics": {
    title: "CrowdSafe-Physics - Pedestrian Dynamics & Evacuation Studio",
    description:
      "Research studio for pedestrian dynamics, evacuation experiments, and Helbing-Farkas-Vicsek social force simulations built with Python and FastAPI.",
  },
  fluenttube: { title: fluenttube.title, description: fluenttube.description },
  "reservation-microsystem": {
    title: "Reservas App - Multi-Staff Appointment Scheduling Platform",
    description:
      "Modular white-label appointment scheduling and online booking platform built with Next.js 16, TypeScript, Prisma, SSE live sync, native RFC 8292/8291 Web Push, PWA, and Docker.",
  },
  "inside-link": {
    title: "InsideLink v2 - Smart Shortlinks, Rich HUBs & Analytics",
    description:
      "Self-hosted, single-owner shortlink engine, polymorphic project micro-landing HUBs, theme studio, QR generator, and zero-PII Analytics 3.0 built with Next.js 16, Turso, Drizzle ORM, and Better-Auth.",
  },
  "explora-bolivia": {
    title: "Explora Bolivia - Travel Guide App",
    description:
      "A travel guide web application for Bolivia built with Next.js and NestJS, providing information on tourist attractions, accommodations, and local culture.",
  },
  "maxi-basquet": {
    title: "Maxi Basquet - Basketball Team Management",
    description:
      "A web application for basketball team management, including player statistics, match schedules, and team standings, built with Django and Bootstrap.",
  },
  "long-old-live": {
    title: "Long Old Live+",
    description:
      "A wellbeing website for older adults, providing useful muscle exercises and mental activities to strengthen the mind. Developed with JavaScript, HTML, and CSS.",
  },
} satisfies ProjectCopy;
