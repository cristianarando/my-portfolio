import { fluenttube } from "./fluenttube.ts";
import type { ProjectCopy } from "../../../data/projects";

export const projectCopy = {
  "onelink-saas": {
    title: "OneLink SaaS - Plataforma Link-in-Bio & Telemetría",
    description:
      "Plataforma Link-in-Bio de alto rendimiento y arquitectura limpia construida con Next.js 16, NestJS 12, PostgreSQL, TimescaleDB, Redis, BullMQ y Docker.",
  },
  "kerr-spacetime-workstation": {
    title: "Kerr Spacetime Workstation - Relatividad Numérica & WebGL",
    description:
      "Estación de trabajo interactiva de relatividad general y transferencia radiativa en agujeros negros en rotación con WebGL 2.0, Three.js y shaders GLSL.",
  },
  "crowdsafe-physics": {
    title: "CrowdSafe-Physics - Dinámica Peatonal y Evacuación",
    description:
      "Estudio de investigación para modelado de dinámica de multitudes y evacuaciones de emergencia mediante el modelo de fuerzas sociales HFV en Python y FastAPI.",
  },
  fluenttube: { title: fluenttube.title, description: fluenttube.description },
  "reservation-microsystem": {
    title:
      "Reservas App - Microsistema de Citas y Agendamiento Multi-Profesional",
    description:
      "Plataforma modular marca blanca de agendamiento de citas y reservas en línea construida con Next.js 16, TypeScript, Prisma, sincronización SSE en vivo, Web Push nativo RFC 8292/8291, PWA y Docker.",
  },
  "inside-link": {
    title: "InsideLink v2 - Enlaces Cortos Inteligentes, HUBs y Analítica",
    description:
      "Motor autoalojado de enlaces cortos para propietario único, micro-landings polimórficos (HUB), estudio de temas, generador QR y analítica sin PII construido con Next.js 16, Turso, Drizzle ORM y Better-Auth.",
  },
  "explora-bolivia": {
    title: "Explora Bolivia - Travel Guide App",
    description:
      "Una aplicación web de guía de viajes para Bolivia, construida con Next.js y NestJS, que proporciona información sobre atracciones turísticas, alojamientos y cultura local.",
  },
  "maxi-basquet": {
    title: "Maxi Basquet - Basketball Team Management",
    description:
      "Una aplicación web para la gestión de equipos de baloncesto, que incluye estadísticas de jugadores, calendarios de partidos y clasificaciones de equipos, construida con Django y Bootstrap.",
  },
  "long-old-live": {
    title: "Long Old Live+",
    description:
      "Un sitio web dedicado al bienestar de los adultos mayores, que proporciona ejercicios musculares útiles y actividades mentales para fortalecer la mente. Desarrollado con JavaScript, HTML y CSS.",
  },
} satisfies ProjectCopy;
