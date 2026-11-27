import { fluenttubeByLang } from "../i18n/fluenttube";
import type { ProjectId } from "./projects";
import type { Lang } from "../i18n/utils";

export type { ProjectId };

export interface CaseStudyData {
  problem: string;
  architecture: string[];
  tradeoff: string;
  lesson: string;
}

export const caseStudiesByLang: Record<
  Lang,
  Record<ProjectId, CaseStudyData>
> = {
  en: {
    "onelink-saas": {
      problem:
        "A high-concurrency Link-in-Bio platform requiring sub-millisecond vanity profile delivery, real-time click telemetry with time-series partitioning, multi-tenant creator dashboard controls, and automated lexical threat interception (Sentinel AI).",
      architecture: [
        "Turborepo monorepo orchestrating Next.js 16 (React 19 App Router) with Server Components and ISR for vanity profiles.",
        "NestJS 12 backend with SWC compilation (~70ms) structured via Hexagonal/Clean Architecture and OpenAPI 3.0.",
        "Dual-database persistence: PostgreSQL 16 with Prisma 6 for relational core schemas, combined with TimescaleDB hypertables for telemetry.",
        "Redis 7 Stack for cache-aside profile delivery, backed by BullMQ for asynchronous click beacon and audit log ingestion.",
        "Enterprise RBAC (Owner > Admin > Safety > Editor > Viewer) with Sentinel AI lexical threat detection in <25ms.",
      ],
      tradeoff:
        "Using TimescaleDB Hypertables provides automatic chunk partitioning and rapid aggregate rollups for analytics, but requires dedicated schema management alongside standard Prisma migrations. Cache-aside Redis guarantees fast lookups while requiring strict invalidation on profile updates.",
      lesson:
        "Decouple hot-path profile read operations from analytical write tracking using message queues. In high-traffic public profiles, no analytics logging should ever block page response latency.",
    },
    "kerr-spacetime-workstation": {
      problem:
        "High-fidelity, real-time visualization of General Relativistic effects around a rotating black hole (Kerr metric) in the browser, requiring real-time tensor computation, numerical geodesic integration, and physical radiative transfer without server dependencies.",
      architecture: [
        "WebGL 2.0 and Three.js r160 pipeline running custom GLSL shaders for real-time relativistic ray-marching and accretion disk emission.",
        "Exact Boyer-Lindquist metric tensor evaluation g_mu_nu(r, theta) computed in real-time geometric units (G = c = 1).",
        "4th-order Runge-Kutta (RK4) numerical integrator for timelike and null geodesics, handling zoom-whirl orbits, apsidal precession, and ISCO circularization.",
        "Novikov-Thorne relativistic thin-disk radiative transfer model with Liouville's theorem (I_obs = g^4 * I_em) for Doppler beaming and gravitational redshift.",
        "Interactive diagnostic oscilloscopes for effective potential V_eff(r) and symplectic phase-space portraits.",
      ],
      tradeoff:
        "Executing the entire numerical relativity pipeline inside WebGL shaders and browser JavaScript maximizes accessibility and portability (zero backend requirements), but limits the integration precision compared to heavy distributed relativistic GRMHD codes.",
      lesson:
        "Mathematical invariants (like Kretschmann scalar, conserved energy E, and angular momentum L_z) must serve as continuous unit tests and numerical stability checks in real-time physics simulations.",
    },
    "crowdsafe-physics": {
      problem:
        "A research studio for pedestrian dynamics and evacuation simulation, providing reproducible simulations of human contact mechanics, escape panic dynamics, and architectural exit bottlenecks.",
      architecture: [
        "Physics engine implementing the Helbing-Farkas-Vicsek (HFV) model with social, elastic, and frictional forces.",
        "FastAPI backend with WebSockets for real-time frame streaming, telemetry inspection, and simulation orchestration.",
        "Interactive scenario editor allowing real-time geometric authoring of walls, pillars, exits, and agent spawn zones.",
        "A/B scenario comparison engine supporting common-seed experimentation, parameter sweeps, and sensitivity analysis.",
        "Rigorous validation module evaluating empirical benchmarks against the HERMES dataset with reproducible CLI tools.",
      ],
      tradeoff:
        "Microscopic social-force agent models capture panic clustering and arching bottlenecks at exits that macroscopic fluid models miss, but computational complexity scales quadratically O(N^2) with crowd density without spatial partitioning.",
      lesson:
        "Separate scenario authoring, physical numerical integration, and telemetry recording into decoupled pipelines so that experiment configurations remain completely deterministic and reproducible.",
    },
    fluenttube: fluenttubeByLang.en.study,
    "reservation-microsystem": {
      problem:
        "Multi-professional service businesses (clinics, salons, studios) need a white-label online booking and staff scheduling platform with real-time slot availability, role-scoped operations (ADMIN and PROVIDER), atomic conflict prevention, and reliable reminders on low-memory single-node infrastructure.",
      architecture: [
        "Next.js 16 App Router and React 19 powering a 4-step customer booking wizard (with OAuth draft persistence, load-balanced auto-assignment, ISO/IEC 18004 SVG QR pass, and .ics/Google Calendar export) alongside a role-protected /admin portal.",
        "Modular service layer (booking-service, schedule-service, staff-service, reminder-service) over Prisma 6 and SQLite WAL wrapped in BEGIN IMMEDIATE write locks with IANA timezone arithmetic.",
        "Server-side filtered SSE (/api/events) preventing cross-role PII leaks, paired with zero-dependency RFC 8292 VAPID ES256 and RFC 8291 aes128gcm Web Push over node:crypto backed by a persistent PushDelivery outbox with automated 24h/2h reminders.",
        "Hardened HMAC-SHA256 HttpOnly sessions with sessionVersion revocation, Google OAuth CSRF state nonces, SSRF guards, proxy-aware rate limiting, anti-hoarding booking caps, and 2-strike no-show protection.",
        "Low-memory node:24-alpine Docker deployment (650m limit, 127.0.0.1:3000) with rotating preventive SQLite backups and prisma migrate deploy startup recovery.",
      ],
      tradeoff:
        "Running SQLite WAL with BEGIN IMMEDIATE locks and zero-dependency native Web Push keeps infrastructure self-contained and predictable on 1 GB RAM VMs without external brokers, at the cost of single-node write concurrency unless switched to PostgreSQL via Prisma.",
      lesson:
        "Enforce availability invariants, role-scoped SSE filtering, and push delivery idempotency (eventKey outbox) inside transactional server boundaries rather than relying on client refreshes or optimistic UI state.",
    },
    "inside-link": {
      problem:
        "Creators and engineers often rely on bloated third-party link shorteners filled with tracking pixels and subscription limits; InsideLink v2 provides a self-hosted, single-owner shortlink engine, polymorphic micro-landing HUB platform, Bento directory, and privacy-first Analytics 3.0 on a custom domain (links.cristianarando.dev).",
      architecture: [
        "Next.js 16 (src/proxy.ts + App Router + after() non-blocking telemetry) and React 19 serving the public Bento/Grid/List directory (/), slug resolver (/[slug]), and private /admin workspace.",
        "Turso (@libsql/client) and Drizzle ORM storing site_settings, links, click_events, and pin_attempts with O(1) keyset cursor pagination and single-roundtrip db.batch(...) Analytics 3.0 queries (90-day heatmap, 24h UTC distribution, top cities, HUB block CTR, and CSV export).",
        "Polymorphic Rich HUB pages (type = 'HUB') supporting 6 block kinds (button, cached github-repo, click-to-play youtube/spotify facades, code, callout), plus 6 dark presets, custom HEX theme overrides, and branded SVG/PNG QR generation.",
        "Smart conditional routing (country, Accept-Language, device, os), scheduled launch countdowns (starts_at), expiration fallbacks (307 or HTTP 410 Gone), fullscreen cloaking, and SSRF-safe metadata/frame/health scanners.",
        "Single-owner Better-Auth GitHub OAuth locked via fail-closed ALLOWED_GITHUB_ID database hooks, zero external API keys, scrypt + timingSafeEqual PIN hashing, HMAC-SHA256 unlock cookies, and atomic SQLite rate limiting (5 attempts / 60s), backed by 106 Vitest tests across 27 suites.",
      ],
      tradeoff:
        "Locking authentication to a single owner and keeping all telemetry inside SQLite/Turso via after() and db.batch() eliminates multi-tenant complexity, external analytics scripts, and recurring SaaS dependencies, at the expense of being purpose-built for single-owner personal infrastructure rather than multi-tenant resale.",
      lesson:
        "Decoupling redirect resolution from telemetry via non-blocking after() hooks and enforcing fail-closed ownership checks and SSRF guards at the server boundary keeps a personal link platform fast, auditable, and resilient.",
    },
    "explora-bolivia": {
      problem:
        "A Bolivia-focused exploration application needs a clear way to present destinations and organize the data behind that experience.",
      architecture: [
        "Next.js and Shadcn are the catalogued presentation stack.",
        "NestJS defines a separate backend boundary, with TypeORM and PostgreSQL for structured persistence.",
        "Docker and GitLab are listed among the project tools. Reproducible environments and automated validation are useful considerations for this combination.",
      ],
      tradeoff:
        "A structured frontend/backend split provides room for independent evolution, with the cost of more contracts and services to maintain. Relational modelling makes consistency explicit but requires deliberate schema migrations.",
      lesson:
        "Explain the data model and API contract together: how a destination is represented, how it is fetched, and which layer owns validation.",
    },
    "maxi-basquet": {
      problem:
        "An international basketball tournament involves related information such as teams and competition records. A clear administrative workflow matters as much as the public presentation.",
      architecture: [
        "The catalog lists Django and Python for the application.",
        "PostgreSQL supplies relational persistence; Bootstrap supplies the interface styling.",
        "A useful design review follows a record from form validation through application rules to database constraints.",
      ],
      tradeoff:
        "An integrated framework can keep the deployment and development workflow compact. Rich live interactions may require additional client behavior as requirements grow.",
      lesson:
        "Put competition rules in a clear application layer and use database constraints for invariants. A successful form submission should represent a valid domain operation.",
    },
    "long-old-live": {
      problem:
        "A wellbeing website for older adults presents muscle exercises and mental activities. Clear instructions and approachable navigation are central design concerns.",
      architecture: [
        "The catalog lists vanilla JavaScript, HTML, CSS and Bootstrap.",
        "Firebase is the listed backend platform.",
        "A useful boundary separates rendering, user interactions, and calls to backend services rather than mixing them in each event handler.",
      ],
      tradeoff:
        "Direct use of browser primitives keeps the interface approachable and avoids a framework runtime. As complexity increases, consistent state handling and reusable modules require deliberate discipline.",
      lesson:
        "Start with semantic HTML, then add behavior through small modules. For any client-accessible backend, review access rules independently of interface controls.",
    },
  },
  es: {
    "onelink-saas": {
      problem:
        "Plataforma Link-in-Bio de alta concurrencia diseñada para entregar perfiles en submilisegundos, registrar telemetría de clics en tiempo real con particionado temporal, panel de control multi-inquilino y mitigación léxica automatizada de amenazas (Sentinel AI).",
      architecture: [
        "Monorepositorio Turborepo con Next.js 16 (React 19 App Router), Server Components y regeneración estática incremental (ISR).",
        "Backend en NestJS 12 compilado con SWC (~70ms) bajo Arquitectura Limpia/Hexagonal y contratos OpenAPI 3.0.",
        "Persistencia dual: PostgreSQL 16 con Prisma 6 para modelos relacionales junto a hypertables de TimescaleDB para series temporales.",
        "Redis 7 Stack bajo patrón cache-aside para lectura veloz de perfiles, respaldado por colas asíncronas BullMQ para analítica y auditoría.",
        "Control de acceso basado en roles empresarial (RBAC) con detección léxica preventiva en Sentinel AI en menos de 25 ms.",
      ],
      tradeoff:
        "TimescaleDB Hypertables brinda particionado automático de chunks y agregaciones ultra rápidas, pero exige migraciones dedicadas junto a Prisma. Redis como cache-aside acelera lecturas pero requiere invalidación rigurosa al actualizar perfiles.",
      lesson:
        "Desacopla las lecturas críticas de perfiles del registro analítico de escritura mediante colas de mensajes. En servicios públicos de alto tráfico, la analítica nunca debe penalizar la latencia de respuesta.",
    },
    "kerr-spacetime-workstation": {
      problem:
        "Visualización interactiva y físicamente rigurosa de efectos de Relatividad General alrededor de un agujero negro en rotación (métrica de Kerr) directamente en el navegador, calculando tensores, trayectorias geodésicas y radiación en tiempo real sin servidor.",
      architecture: [
        "Pipeline WebGL 2.0 y Three.js r160 con shaders GLSL personalizados para ray-marching relativista y emisión del disco de acreción.",
        "Evaluación exacta del tensor métrico de Boyer-Lindquist g_mu_nu(r, theta) calculada en tiempo real en unidades geométricas (G = c = 1).",
        "Integrador numérico Runge-Kutta de 4º orden (RK4) para geodésicas temporales y nulas, procesando órbitas zoom-whirl, precesión absidal y circularización ISCO.",
        "Modelo de transporte radiativo de disco delgado de Novikov-Thorne con teorema de Liouville (I_obs = g^4 * I_em) para beaming Doppler y corrimiento al rojo gravitacional.",
        "Osciloscopios de diagnóstico interactivo para el potencial efectivo V_eff(r) y retratos de fase simplécticos.",
      ],
      tradeoff:
        "Ejecutar el pipeline completo de relatividad numérica en shaders WebGL y JavaScript maximiza la portabilidad y accesibilidad (cero infraestructura de servidor), sacrificando la altísima precisión de simulaciones masivas distribuidas de magnetohidrodinámica relativista (GRMHD).",
      lesson:
        "Los invariantes matemáticos (como el escalar de Kretschmann, la energía conservada E y el momento angular L_z) deben actuar como pruebas unitarias continuas y salvaguardas de estabilidad numérica en simulaciones físicas en tiempo real.",
    },
    "crowdsafe-physics": {
      problem:
        "Estudio de investigación en dinámica de peatones y simulaciones de evacuación, proporcionando experimentos reproducibles sobre mecánica de contacto humano, dinámicas de pánico y cuellos de botella arquitectónicos en salidas.",
      architecture: [
        "Motor físico que implementa el modelo de fuerzas sociales Helbing-Farkas-Vicsek (HFV) con fuerzas elásticas, friccionales y socio-psicológicas.",
        "Backend en FastAPI con WebSockets para transmisión de frames en tiempo real, telemetría e inspección de estados de simulación.",
        "Editor de escenarios interactivo que permite diseñar muros, columnas, salidas y zonas de generación de agentes en tiempo real.",
        "Motor de comparación A/B con semillas idénticas para experimentación controlada, barrido de parámetros y análisis de sensibilidad.",
        "Módulo de validación empírica contra el benchmark de datos HERMES con herramientas CLI reproducibles.",
      ],
      tradeoff:
        "Los modelos microscópicos de fuerzas sociales capturan con realismo el agrupamiento por pánico y los arcos de bloqueo en salidas, pero su coste computacional escala de forma cuadrática O(N^2) con la densidad sin particionado espacial.",
      lesson:
        "Separa la edición de escenarios, la integración física numérica y la telemetría en pipelines desacoplados para que la configuración experimental sea totalmente determinista y reproducible.",
    },
    fluenttube: fluenttubeByLang.es.study,
    "reservation-microsystem": {
      problem:
        "Los negocios de servicios con múltiples profesionales (clínicas, salones, estudios) necesitan una plataforma marca blanca de reservas en línea y gestión de agenda con disponibilidad en tiempo real, operaciones aisladas por rol (ADMIN y PROVIDER), prevención atómica de conflictos y recordatorios confiables sobre infraestructura de baja memoria.",
      architecture: [
        "Next.js 16 App Router y React 19 impulsan un asistente de reserva en 4 pasos (con persistencia de borrador tras OAuth, autoasignación balanceada, pase QR SVG ISO/IEC 18004 y exportación .ics/Google Calendar) junto a un portal /admin protegido por rol.",
        "Capa de servicios modular (booking-service, schedule-service, staff-service, reminder-service) sobre Prisma 6 y SQLite WAL protegida con bloqueos de escritura BEGIN IMMEDIATE y aritmética de zonas horarias IANA.",
        "Eventos SSE filtrados en servidor (/api/events) para evitar filtraciones de PII entre roles, junto con Web Push nativo sin dependencias (RFC 8292 VAPID ES256 y RFC 8291 aes128gcm sobre node:crypto) respaldado por una bandeja persistente PushDelivery con recordatorios automáticos de 24h y 2h.",
        "Sesiones HttpOnly HMAC-SHA256 con revocación por sessionVersion, nonces CSRF en Google OAuth, protección SSRF, limitación de tasa consciente de proxies, tope de reservas activas y bloqueo automático tras 2 inasistencias.",
        "Despliegue Docker ligero sobre node:24-alpine (límite de 650m en 127.0.0.1:3000) con respaldos rotativos preventivos de SQLite y recuperación automática con prisma migrate deploy al iniciar.",
      ],
      tradeoff:
        "Ejecutar SQLite WAL con bloqueos BEGIN IMMEDIATE y Web Push nativo sin dependencias mantiene la infraestructura autocontenida y predecible en VMs de 1 GB de RAM sin brókers externos, a cambio de limitar las escrituras concurrentes a un solo nodo salvo que se cambie el proveedor de Prisma a PostgreSQL.",
      lesson:
        "Garantizar los invariantes de disponibilidad, el filtrado SSE por rol y la idempotencia de notificaciones (outbox con eventKey) dentro de fronteras transaccionales en servidor evita depender de recargas en el cliente o estados optimistas.",
    },
    "inside-link": {
      problem:
        "Creadores e ingenieros suelen depender de acortadores de enlaces de terceros cargados de píxeles de rastreo y límites de suscripción; InsideLink v2 ofrece un motor autoalojado de enlaces cortos para propietario único, plataforma de micro-landings polimórficos (HUB), directorio Bento y analítica 3.0 sin PII bajo dominio propio (links.cristianarando.dev).",
      architecture: [
        "Next.js 16 (src/proxy.ts + App Router + telemetría no bloqueante en after()) y React 19 sirviendo el directorio público Bento/Grid/List (/), el resolvedor de slugs (/[slug]) y el panel privado /admin.",
        "Turso (@libsql/client) y Drizzle ORM almacenando site_settings, links, click_events y pin_attempts con paginación por cursor O(1) y consultas de analítica 3.0 en un único viaje db.batch(...) (mapa de calor de 90 días, distribución horaria UTC de 24h, ciudades, CTR por bloque HUB y exportación CSV).",
        "Páginas Rich HUB polimórficas (type = 'HUB') con 6 tipos de bloques (button, github-repo con caché, fachadas click-to-play de youtube/spotify, code y callout), además de 6 presets oscuros, overrides de tema HEX y generación de QR en SVG/PNG.",
        "Enrutamiento condicional inteligente (país, Accept-Language, dispositivo, sistema operativo), cuentas regresivas de lanzamiento programado (starts_at), respaldos de expiración (307 o HTTP 410 Gone), cloaking a pantalla completa y escáneres de metadatos/marcos/salud con defensa SSRF.",
        "Autenticación GitHub OAuth para propietario único bloqueada en base de datos mediante hooks fail-closed con ALLOWED_GITHUB_ID, cero claves API externas, PINs con scrypt + timingSafeEqual, cookies HMAC-SHA256 y limitación atómica en SQLite (5 intentos / 60s), respaldado por 106 pruebas en Vitest.",
      ],
      tradeoff:
        "Restringir la autenticación a un único propietario y mantener toda la telemetría en SQLite/Turso mediante after() y db.batch() elimina la complejidad multi-inquilino, los scripts externos y las dependencias SaaS, a costa de estar diseñado específicamente para infraestructura personal y no para reventa multi-inquilino.",
      lesson:
        "Desacoplar la resolución de redirecciones de la telemetría mediante hooks no bloqueantes after() y aplicar comprobaciones de propiedad fail-closed y guardias SSRF en la frontera del servidor mantiene la plataforma rápida, auditable y resiliente.",
    },
    "explora-bolivia": {
      problem:
        "Aplicación web de exploración turística en Bolivia que requiere una presentación intuitiva de atractivos y un esquema relacional estructurado para su catálogo.",
      architecture: [
        "Next.js y componentes Shadcn componen la capa de presentación modular.",
        "NestJS define el límite de backend independiente, con TypeORM y PostgreSQL para persistencia transaccional.",
        "Entornos contenerizados con Docker y automatización con GitLab para validación reproducible.",
      ],
      tradeoff:
        "Separar de forma estricta frontend y backend permite la evolución independiente de servicios, asumiendo el mantenimiento de contratos de API. El modelado relacional garantiza consistencia pero requiere migraciones ordenadas.",
      lesson:
        "Diseña el modelo de datos y el contrato de API en conjunto: cómo se define un destino, cómo se consulta y qué capa es responsable de su validación.",
    },
    "maxi-basquet": {
      problem:
        "Sistema integral para torneos internacionales de baloncesto que gestiona calendarios deportivos, planteles de equipos y tablas de posiciones con flujos administrativos claros.",
      architecture: [
        "Aplicación monolítica modular construida con Django y Python.",
        "Persistencia relacional en PostgreSQL y diseño de interfaz con Bootstrap.",
        "Revisión de flujo de datos completo: desde la validación de formularios hasta las restricciones de integridad en base de datos.",
      ],
      tradeoff:
        "Un framework unificado como Django simplifica los despliegues y acelera el desarrollo, aunque interacciones complejas en vivo pueden demandar código de cliente adicional conforme crece el proyecto.",
      lesson:
        "Centraliza las reglas de competición en la capa de aplicación y delega los invariantes en restricciones de base de datos. Cada envío debe reflejar una operación de dominio válida.",
    },
    "long-old-live": {
      problem:
        "Sitio web enfocado en el bienestar de adultos mayores, con rutinas de acondicionamiento muscular y actividades de estimulación cognitiva guiadas.",
      architecture: [
        "Interfaz desarrollada con JavaScript nativo (vanilla), HTML semántico y estilos CSS/Bootstrap.",
        "Firebase como plataforma de backend y almacenamiento de datos.",
        "Separación nítida entre la renderización del DOM, la interacción del usuario y las llamadas a servicios externos en lugar de mezclar lógica en eventos.",
      ],
      tradeoff:
        "Utilizar primitivas estándar del navegador elimina la sobrecarga de frameworks, pero requiere disciplina rigurosa para mantener el estado y la modularidad a medida que la aplicación crece.",
      lesson:
        "Comienza siempre con HTML semántico accesible y añade interactividad mediante módulos pequeños y testeables. En servicios accesibles desde el cliente, audita las reglas de acceso con independencia de los controles visuales.",
    },
  },
  de: {
    "onelink-saas": {
      problem:
        "Hochperformante Link-in-Bio-Plattform für die Bereitstellung von Profilen im Sub-Millisekundenbereich, Klick-Telemetrie in Echtzeit mit TimescaleDB-Hypertables, Multi-Tenant-Verwaltung und automatisierte Bedrohungserkennung (Sentinel AI).",
      architecture: [
        "Turborepo-Monorepo mit Next.js 16 (React 19 App Router), Server-Komponenten und ISR für personalisierte Profile.",
        "NestJS 12 Backend mit SWC-Kompilierung (~70ms) nach Clean-Architecture-Prinzipien und OpenAPI 3.0.",
        "Duale Datenbankarchitektur: PostgreSQL 16 mit Prisma 6 für relationale Daten und TimescaleDB-Hypertables für Telemetrie.",
        "Redis 7 Stack für Cache-Aside-Leseoperationen und BullMQ für asynchrone Klick- und Audit-Log-Verarbeitung.",
        "Unternehmensweites Rollenkonzept (RBAC) mit Sentinel AI für semantische Bedrohungserkennung in unter 25 ms.",
      ],
      tradeoff:
        "TimescaleDB-Hypertables ermöglichen automatische Partitionierung und schnelle Aggregationen, verlangen aber separates Schema-Management neben Prisma. Cache-Aside mit Redis garantiert minimale Latenz, erfordert aber strikte Invalidierung bei Profilaktualisierungen.",
      lesson:
        "Trennen Sie zeitkritische Profilabfragen durch asynchrone Warteschlangen von analytischen Schreibvorgängen. Bei hohem Nutzeraufkommen darf Telemetrie niemals die Antwortzeit blockieren.",
    },
    "kerr-spacetime-workstation": {
      problem:
        "Physikalisch exakte Echtzeit-Visualisierung allgemeinrelativistischer Effekte um ein rotierendes Schwarzes Loch (Kerr-Metrik) direkt im Browser, ohne externe Serverinfrastruktur.",
      architecture: [
        "WebGL 2.0 und Three.js r160 Pipeline mit maßgeschneiderten GLSL-Shadern für relativistisches Ray-Marching und Akkretionsscheiben-Strahlung.",
        "Exakte Berechnung des Boyer-Lindquist-Metriktensors g_mu_nu(r, theta) in geometrischen Einheiten (G = c = 1).",
        "Numerischer Runge-Kutta-Integrator 4. Ordnung (RK4) für Geodäten zur Abbildung von Zoom-Whirl-Orbits und Präzession.",
        "Novikov-Thorne-Strahlungstransportmodell mit Liouville-Theorem (I_obs = g^4 * I_em) für Doppler-Beaming und Gravitationsrotverschiebung.",
        "Interaktive Oszilloskope für effektives Potential V_eff(r) und Phasenraum-Analysen.",
      ],
      tradeoff:
        "Die Ausführung der gesamten relativistischen Berechnungen in Shadern und WebGL maximiert Barrierefreiheit und Portabilität, limitiert jedoch die Integrationsgenauigkeit im Vergleich zu verteilten GRMHD-Supercomputer-Simulationen.",
      lesson:
        "Mathematische Invarianten wie der Kretschmann-Skalar, Energieerhaltung E und Drehimpuls L_z müssen als fortlaufende Stabilitätsprüfungen in Echtzeitsimulationen dienen.",
    },
    "crowdsafe-physics": {
      problem:
        "Forschungsumgebung für Fußgängerdynamik und Evakuierungssimulationen zur Erforschung menschlicher Kontaktmechanik, Panikdynamiken und architektonischer Engpässe.",
      architecture: [
        "Physik-Engine nach dem Social-Force-Modell von Helbing-Farkas-Vicsek (HFV) mit elastischen, Reibungs- und Sozialkräften.",
        "FastAPI-Backend mit WebSockets für Echtzeit-Streaming von Frames, Telemetrie und Simulationssteuerung.",
        "Interaktiver Szenario-Editor zur geometrischen Erstellung von Wänden, Säulen, Ausgängen und Spawn-Zonen.",
        "A/B-Vergleichs-Engine mit einheitlichem Zufallssamen für Parametersweeps und Sensitivitätsanalysen.",
        "Empirische Validierungsmodule gegen das HERMES-Referenzdataset mit reproduzierbaren CLI-Werkzeugen.",
      ],
      tradeoff:
        "Mikroskopische Partikelmodelle erfassen Panikcluster und Bogenbildung an Ausgängen präzise, skalieren jedoch quadratisch O(N^2) mit der Dichte ohne Raumpartitionierung.",
      lesson:
        "Trennen Sie Szenario-Erstellung, numerische Integration und Telemetrieaufzeichnung in voneinander unabhängige Pipelines für vollständige Reproduzierbarkeit.",
    },
    fluenttube: fluenttubeByLang.de.study,
    "reservation-microsystem": {
      problem:
        "Dienstleistungsunternehmen mit mehreren Fachkräften (Kliniken, Salons, Studios) benötigen eine White-Label-Plattform für Online-Buchungen und Terminplanung mit Echtzeit-Verfügbarkeit, rollenbasierter Trennung (ADMIN und PROVIDER), atomarer Konfliktvermeidung und zuverlässigen Erinnerungen auf speicherarmer Infrastruktur.",
      architecture: [
        "Next.js 16 App Router und React 19 steuern einen 4-stufigen Buchungsassistenten (mit OAuth-Entwurfspersistenz, automatischer Lastverteilung, ISO/IEC-18004-SVG-QR-Pass und .ics-/Google-Calendar-Export) sowie ein rollengeschütztes /admin-Portal.",
        "Modulare Serviceschicht (booking-service, schedule-service, staff-service, reminder-service) über Prisma 6 und SQLite WAL mit BEGIN-IMMEDIATE-Schreibsperren und IANA-Zeitzonenarithmetik.",
        "Serverseitig gefiltertes SSE (/api/events) gegen rollenübergreifende PII-Lecks, kombiniert mit abhängigkeitsfreiem nativem RFC-8292-VAPID-ES256- und RFC-8291-aes128gcm-Web-Push über node:crypto und einer persistenten PushDelivery-Outbox für automatische 24h-/2h-Erinnerungen.",
        "Gehärtete HMAC-SHA256-HttpOnly-Sitzungen mit sessionVersion-Widerruf, Google-OAuth-CSRF-Nonces, SSRF-Schutz, Proxy-bewusstem Rate-Limiting, Anti-Hoarding-Buchungslimits und 2-Strike-No-Show-Sperre.",
        "Speicherschonendes node:24-alpine-Docker-Deployment (650m Limit, 127.0.0.1:3000) mit rotierenden SQLite-Backups und prisma-migrate-deploy-Wiederherstellung beim Start.",
      ],
      tradeoff:
        "SQLite WAL mit BEGIN-IMMEDIATE-Sperren und nativem Web Push ohne externe Broker hält die Infrastruktur auf 1-GB-RAM-VMs vollständig eigenständig und vorhersehbar, begrenzt jedoch die Schreibparallelität auf einen Knoten, solange Prisma nicht auf PostgreSQL umgestellt wird.",
      lesson:
        "Verfügbarkeitsinvarianten, rollenbasierte SSE-Filterung und Push-Idempotenz (eventKey-Outbox) gehören in transaktionale Server-Grenzen statt in optimistische UI-Aktualisierungen.",
    },
    "inside-link": {
      problem:
        "Entwickler und Creator greifen oft auf überladene Drittanbieter-Shortener mit Tracking-Pixeln und Abo-Limits zurück; InsideLink v2 bietet eine selbst gehostete Shortlink-Engine für Einzelbetreiber, polymorphe Micro-Landing-HUBs, ein Bento-Verzeichnis und datenschutzkonforme Analytik 3.0 unter eigener Domain (links.cristianarando.dev).",
      architecture: [
        "Next.js 16 (src/proxy.ts + App Router + nicht-blockierende after()-Telemetrie) und React 19 für das öffentliche Bento/Grid/List-Verzeichnis (/), den Slug-Resolver (/[slug]) und den privaten /admin-Bereich.",
        "Turso (@libsql/client) und Drizzle ORM speichern site_settings, links, click_events und pin_attempts mit O(1)-Keyset-Cursor-Pagination und Single-Roundtrip-db.batch(...)-Analytikabfragen (90-Tage-Heatmap, 24h-UTC-Verteilung, Top-Städte, HUB-Block-CTR und CSV-Export).",
        "Polymorphe Rich-HUB-Seiten (type = 'HUB') mit 6 Blocktypen (button, gecachte github-repo-Karten, Click-to-Play-youtube/spotify-Fassaden, code, callout) sowie 6 Dark-Presets, benutzerdefinierten HEX-Themes und SVG/PNG-QR-Code-Generierung.",
        "Intelligentes bedingtes Routing (Land, Accept-Language, Gerät, OS), geplante Launch-Countdowns (starts_at), Ablauf-Fallbacks (307 oder HTTP 410 Gone), Fullscreen-Cloaking und SSRF-geschützte Metadaten-, Frame- und Health-Scanner.",
        "Single-Owner-GitHub-OAuth via Better-Auth mit Fail-Closed-ALLOWED_GITHUB_ID-Hooks, ohne externe API-Schlüssel, mit scrypt + timingSafeEqual für PINs, HMAC-SHA256-Unlock-Cookies, atomarem SQLite-Rate-Limiting (5 Versuche / 60s) und 106 Vitest-Tests in 27 Suiten.",
      ],
      tradeoff:
        "Die Beschränkung auf einen Einzelbetreiber sowie die vollständige Speicherung der Telemetrie in SQLite/Turso über after() und db.batch() eliminiert Multi-Tenant-Komplexität und externe Skripte, richtet das System jedoch gezielt auf persönliche Infrastruktur statt auf Multi-Tenant-SaaS-Vertrieb aus.",
      lesson:
        "Die Entkopplung der Weiterleitungsauflösung von der Telemetrie über nicht-blockierende after()-Hooks sowie Fail-Closed-Besitzprüfungen und SSRF-Schranken am Serverrand halten eine persönliche Link-Plattform schnell, prüfbar und robust.",
    },
    "explora-bolivia": {
      problem:
        "Webanwendung zur Erkundung von Reisezielen in Bolivien mit übersichtlicher Präsentation und strukturierter Persistenz.",
      architecture: [
        "Next.js und Shadcn-Komponenten für eine modulare Präsentationsschicht.",
        "NestJS als unabhängiger Backend-Dienst mit TypeORM und PostgreSQL für relationale Datenhaltung.",
        "Docker-Container und GitLab-Pipelines für reproduzierbare Entwicklung und automatisierte Tests.",
      ],
      tradeoff:
        "Die klare Trennung zwischen Frontend und Backend ermöglicht unabhängige Skalierung, erfordert jedoch die Pflege getrennter Schnittstellenverträge.",
      lesson:
        "Entwickeln Sie Datenmodell und Schnittstellenvertrag gemeinsam: Wie ein Ziel definiert ist, wie es geladen wird und welche Schicht validiert.",
    },
    "maxi-basquet": {
      problem:
        "Turnierverwaltungssystem für internationalen Basketball zur Organisation von Mannschaften, Spielerstatistiken und Spielplänen.",
      architecture: [
        "Django- und Python-Anwendung mit modularem Aufbau.",
        "PostgreSQL für relationale Speicherung und Bootstrap für das Interface-Design.",
        "Durchgängiger Datenfluss von der Formularvalidierung bis zu Datenbank-Constraints.",
      ],
      tradeoff:
        "Ein monolithisches Framework wie Django vereinfacht Entwicklung und Betrieb, erfordert bei interaktiven Echtzeitfunktionen jedoch zusätzlichen Client-Code.",
      lesson:
        "Verankern Sie Wettbewerbsregeln in einer sauberen Anwendungsschicht und nutzen Sie Datenbankbeschränkungen für fundamentale Invarianten.",
    },
    "long-old-live": {
      problem:
        "Gesundheits- und Bewegungsworkstation für Senioren mit strukturierten Muskel- und Gedächtnisübungen.",
      architecture: [
        "Entwicklung mit nativem JavaScript (Vanilla), semantischem HTML und CSS/Bootstrap.",
        "Firebase als Cloud-Backend für Benutzerdaten.",
        "Saubere Trennung von DOM-Rendering, Nutzerinteraktion und Backend-Diensten.",
      ],
      tradeoff:
        "Der Verzicht auf Frameworks reduziert Ladezeiten und Komplexität, erfordert jedoch disziplinierte Modulstrukturen bei wachsender Funktionsvielfalt.",
      lesson:
        "Beginnen Sie mit barrierefreiem semantischem HTML und ergänzen Sie Funktionalität in kleinen Modulen. Prüfen Sie Zugriffsregeln unabhängig von der UI.",
    },
  },
  ru: {
    "onelink-saas": {
      problem:
        "Высоконагруженная Link-in-Bio платформа с субмиллисекундной отдачей профилей, аналитикой кликов реального времени на гипертаблицах TimescaleDB, многопользовательским кабинетом создателя и автоматическим перехватом угроз (Sentinel AI).",
      architecture: [
        "Монорепозиторий Turborepo на базе Next.js 16 (React 19 App Router) с Server Components и ISR для профилей.",
        "Бэкенд на NestJS 12 с компиляцией SWC (~70ms) по принципам Чистой / Гексагональной архитектуры и OpenAPI 3.0.",
        "Двухуровневая база данных: PostgreSQL 16 с Prisma 6 для бизнес-сущностей и TimescaleDB для временных рядов кликов.",
        "Redis 7 Stack с паттерном cache-aside для чтения профилей и очередями BullMQ для асинхронной аналитики и аудита.",
        "Корпоративная ролевая модель (RBAC) с лексическим анализатором Sentinel AI для обнаружения угроз за <25 мс.",
      ],
      tradeoff:
        "TimescaleDB Hypertables обеспечивает автоматическое секционирование и быструю агрегацию, но требует отдельного управления схемой параллельно с Prisma. Redis гарантирует минимальную задержку, требуя четкой инвалидации при обновлении профиля.",
      lesson:
        "Изолируйте критический путь чтения профилей от аналитической записи через очереди сообщений. Аналитика не должна влиять на время отклика страницы.",
    },
    "kerr-spacetime-workstation": {
      problem:
        "Интерактивная физическая визуализация эффектов общей теории относительности вокруг вращающейся черной дыры (метрика Керра) в браузере без использования серверных вычислений.",
      architecture: [
        "Конвейер WebGL 2.0 и Three.js r160 с шейдерами GLSL для релятивистского трассирования лучей и свечения аккреционного диска.",
        "Точный расчет тензора метрики Бойера-Линдквиста g_mu_nu(r, theta) в реальном времени в геометрических единицах (G = c = 1).",
        "Численный интегратор Рунге-Кутты 4-го порядка (RK4) для времениподобных и светоподобных геодезических (орбиты zoom-whirl, прецессия).",
        "Релятивистская модель тонкого диска Новикова-Торна с теоремой Лиувилля (I_obs = g^4 * I_em) для эффекта Доплера и гравитационного красного смещения.",
        "Интерактивные осциллографы эффективного потенциала V_eff(r) и фазовых портретов.",
      ],
      tradeoff:
        "Выполнение релятивистских расчетов в шейдерах WebGL обеспечивает максимальную доступность и кроссплатформенность, но уступает в абсолютной точности тяжелым распределенным кодам GRMHD.",
      lesson:
        "Математические инварианты (скаляр Кречмана, сохранение энергии E и углового момента L_z) должны служить непрерывными тестами устойчивости симуляции.",
    },
    "crowdsafe-physics": {
      problem:
        "Исследовательская среда для анализа пешеходной динамики и эвакуации людей, моделирующая контактную механику, панику и сужения выходов.",
      architecture: [
        "Физический движок на базе модели социальных сил Хельбинга-Фаркаша-Вичека (HFV) с упругими и фрикционными взаимодействиями.",
        "Сервер на FastAPI с поддержкой WebSockets для передачи кадров, телеметрии и управления ходом симуляции.",
        "Интерактивный редактор геометрии для создания стен, колонн, выходов и зон спавна агентов.",
        "Модуль A/B сравнения сценариев с фиксацией генератора случайных чисел для анализа чувствительности параметров.",
        "Эмпирическая валидация результатов по эталонному датасету HERMES с консольными утилитами.",
      ],
      tradeoff:
        "Микроскопические модели точно отражают заторы и паническое арочное запирание у дверей, однако вычислительная сложность растет квадратично O(N^2) без пространственного разбиения.",
      lesson:
        "Разделяйте создание сценариев, физический расчет и запись метрик на независимые этапы для обеспечения полной воспроизводимости экспериментов.",
    },
    fluenttube: fluenttubeByLang.ru.study,
    "reservation-microsystem": {
      problem:
        "Сервисным компаниям с несколькими специалистами (клиникам, салонам, студиям) нужна модульная white-label платформа онлайн-записи и управления расписанием с проверкой слотов в реальном времени, разделением ролей (ADMIN и PROVIDER), атомарной защитой от конфликтов и надежными напоминаниями на маломощных серверах.",
      architecture: [
        "Next.js 16 App Router и React 19 реализуют 4-шаговый мастер записи клиентов (с сохранением черновика через OAuth, балансировкой автоназначения, цифровым QR-пропуском ISO/IEC 18004 SVG и экспортом в .ics/Google Calendar) и защищенный ролями портал /admin.",
        "Модульный сервисный слой (booking-service, schedule-service, staff-service, reminder-service) поверх Prisma 6 и SQLite WAL с блокировками записи BEGIN IMMEDIATE и точной арифметикой часовых поясов IANA.",
        "Серверная фильтрация SSE (/api/events) для изоляции персональных данных по ролям и нативный Web Push без внешних зависимостей (RFC 8292 VAPID ES256 и RFC 8291 aes128gcm на node:crypto) с персистентной очередью PushDelivery и автонапоминаниями за 24ч и 2ч.",
        "Защищенные HMAC-SHA256 HttpOnly-сессии с отзывом через sessionVersion, CSRF-нонсы Google OAuth, SSRF-фильтры, rate limiting с учетом прокси, лимит активных записей и блокировка после 2 неявок.",
        "Экономичный Docker-контейнер node:24-alpine (лимит 650m, привязка 127.0.0.1:3000) с ротацией превентивных бэкапов SQLite и автоматическим применением миграций prisma migrate deploy при старте.",
      ],
      tradeoff:
        "Использование SQLite WAL с блокировками BEGIN IMMEDIATE и нативного Web Push без сторонних брокеров сохраняет инфраструктуру полностью автономной на ВМ с 1 ГБ ОЗУ, ограничивая параллельную запись одним узлом до переключения Prisma на PostgreSQL.",
      lesson:
        "Инварианты доступности, ролевая фильтрация SSE и идемпотентность отправки push-уведомлений (outbox по eventKey) должны обеспечиваться в транзакционных границах сервера, а не на стороне клиента.",
    },
    "inside-link": {
      problem:
        "Разработчики и авторы часто сталкиваются с перегруженными сторонними сервисами коротких ссылок с трекерами и подписками; InsideLink v2 предоставляет самостоятельный движок коротких ссылок для одного владельца, полиморфные микро-лендинги (HUB), каталог Bento и приватную аналитику 3.0 на собственном домене (links.cristianarando.dev).",
      architecture: [
        "Next.js 16 (src/proxy.ts + App Router + неблокирующая телеметрия в after()) и React 19 обслуживают публичный каталог Bento/Grid/List (/), резолвер слагов (/[slug]) и приватную панель /admin.",
        "Turso (@libsql/client) и Drizzle ORM хранят site_settings, links, click_events и pin_attempts с O(1) курсорной пагинацией и аналитикой 3.0 в одном запросе db.batch(...) (тепловая карта за 90 дней, распределение по часам UTC, города, CTR блоков HUB и экспорт в CSV).",
        "Полиморфные страницы Rich HUB (type = 'HUB') с 6 типами блоков (button, кэшируемый github-repo, click-to-play фасады youtube/spotify, code, callout), 6 темными пресетами, HEX-кастомизацией темы и генерацией брендированных QR-кодов SVG/PNG.",
        "Умная условная маршрутизация (страна, Accept-Language, устройство, ОС), отложенный запуск с таймером (starts_at), перенаправление при истечении (307 или HTTP 410 Gone), полноэкранный cloaking и сканеры метаданных/фреймов/доступности с защитой от SSRF.",
        "Однопользовательская аутентификация Better-Auth GitHub OAuth с fail-closed проверкой ALLOWED_GITHUB_ID в хуках БД, без внешних API-ключей, хеширование PIN через scrypt + timingSafeEqual, cookies HMAC-SHA256, атомарный rate limiting в SQLite (5 попыток / 60с) и 106 тестов Vitest в 27 наборах.",
      ],
      tradeoff:
        "Привязка к одному владельцу и хранение всей телеметрии внутри SQLite/Turso через after() и db.batch() устраняет сложность мультитенантности и внешние трекеры, но делает платформу специализированной для личной инфраструктуры, а не для массового SaaS.",
      lesson:
        "Отделение логики редиректов от записи телеметрии через неблокирующие хуки after() в сочетании с fail-closed проверкой владельца и защитой от SSRF на сервере обеспечивает высокую скорость и надежность.",
    },
    "explora-bolivia": {
      problem:
        "Туристический веб-сервис по достопримечательностям Боливии с каталогом маршрутов и структурированным хранением данных.",
      architecture: [
        "Next.js и библиотека Shadcn для построения модульного пользовательского интерфейса.",
        "Серверный контур на NestJS с TypeORM и базой данных PostgreSQL для транзакционной надежности.",
        "Контейнеризация в Docker и пайплайны GitLab для автоматизированного тестирования.",
      ],
      tradeoff:
        "Разделение на фронтенд и бэкенд упрощает независимое масштабирование, но увеличивает количество контрактов API.",
      lesson:
        "Проектируйте модель данных и контракт API совместно: формат представления сущности, методы выборки и слой валидации.",
    },
    "maxi-basquet": {
      problem:
        "Платформа управления международными турнирами по баскетболу, регламентом соревнований, составами команд и расписанием матчей.",
      architecture: [
        "Модульное веб-приложение на стеке Django и Python.",
        "Реляционная база данных PostgreSQL и стилизация интерфейса на Bootstrap.",
        "Сквозной контроль данных: от валидации форм до ограничений целостности на уровне базы.",
      ],
      tradeoff:
        "Монолит на Django ускоряет запуск продукта, однако динамичные интерактивные сценарии требуют дополнительного клиентского кода.",
      lesson:
        "Определяйте регламент турнира в слое бизнес-логики, а инварианты фиксируйте ограничениями БД. Отправка формы должна соответствовать валидной доменной операции.",
    },
    "long-old-live": {
      problem:
        "Оздоровительный портал для пожилых людей с упражнениями для поддержания физической формы и когнитивными тренировками.",
      architecture: [
        "Интерфейс на нативном JavaScript (Vanilla), семантическом HTML и CSS/Bootstrap.",
        "Платформа Firebase в качестве облачного бэкенда.",
        "Разделение логики рендеринга, событий пользователя и сетевых вызовов.",
      ],
      tradeoff:
        "Отказ от тяжелых фреймворков гарантирует легкость сайта, но требует дисциплины в организации модулей по мере роста функционала.",
      lesson:
        "Начинайте с доступного семантического HTML, наращивая логику модулями. Правила доступа к бэкенду проверяйте отдельно от визуальных элементов.",
    },
  },
  ja: {
    "onelink-saas": {
      problem:
        "毎秒数万アクセスを処理する高並行性リンクインバイオプラットフォーム。マイクロ秒単位のプロフィール配信、TimescaleDBによる時系列クリック分析、マルチテナント権限管理、Sentinel AIによるリアルタイム脅威検知を実装。",
      architecture: [
        "Next.js 16 (React 19 App Router)、Server Components、およびISRを活用したTurborepoモノレポ構成。",
        "クリーン／ヘキサゴナルアーキテクチャおよびOpenAPI 3.0に基づくNestJS 12バックエンド（SWC高速ビルド）。",
        "PostgreSQL 16（Prisma 6）のリレーショナル構造とTimescaleDBハイパーテーブルによるデュアルデータ永続化。",
        "Redis 7 Stackを用いたキャッシュアサイド設計とBullMQ非同期キューによる安全なログ集約。",
        "エンタープライズRBAC（所有者／管理者／安全管理／編集者／閲覧者）と25ms以内のSentinel AI脅威判定。",
      ],
      tradeoff:
        "TimescaleDBは時系列の自動パーティション分割と高速集計を実現しますが、Prismaとは別にスキーマ管理が必要です。Redisキャッシュは高速配信を保証する一方、更新時の厳格なキャッシュ破棄が必須となります。",
      lesson:
        "高頻度の読み取りパスと書き込みログ集約をメッセージキューで完全に分離すること。公開プロフィールのレスポンス速度をアナリティクス処理で低下させてはなりません。",
    },
    "kerr-spacetime-workstation": {
      problem:
        "回転ブラックホール（カー計量）周辺の一般相対性理論効果を、外部サーバーに依存せずブラウザ上で完全リアルタイム計算・物理描画するワークステーション。",
      architecture: [
        "WebGL 2.0およびThree.js r160パイプライン。GLSLシェーダーによる相対論的レイマーチングと降着円盤放射シミュレーション。",
        "幾何学単位系（G = c = 1）でリアルタイムに計算される厳密なボイヤー・リンキスト計量テンソル g_mu_nu(r, theta)。",
        "測地線方程式を解く4次ルンゲ＝クッタ法（RK4）数値積分器（ズームワール軌道、近点移動、ISCO円軌道化に対応）。",
        "リウヴィルの定理（I_obs = g^4 * I_em）を適用したノビコフ・ソーン薄型降着円盤放射モデル（ドップラー効果と重力赤方偏移）。",
        "有効ポテンシャル V_eff(r) およびシンプレクティック位相空間軌道を表示する対話型オシロスコープ。",
      ],
      tradeoff:
        "すべての数値相対論計算をGLSLシェーダーとブラウザJavaScriptで完結させることでゼロ構成の移植性を実現していますが、大規模並列スーパーコンピュータによるGRMHDコードと比較すると積分精度に限界があります。",
      lesson:
        "クレッチマンスカラー、保存エネルギーE、角運動量L_zなどの物理的不変量を、リアルタイムシミュレーションの継続的ユニットテストおよび数値安定性の指標として機能させること。",
    },
    "crowdsafe-physics": {
      problem:
        "歩行者動力学および避難行動シミュレーションの研究スタジオ。人体の接触力学、パニック時の群集行動、出口のボトルネック現象を再現可能にモデル化。",
      architecture: [
        "弾性力、摩擦力、心理的社会力を組み合わせたヘルビング・ファルカス・ヴィチェック（HFV）社会力モデル物理エンジン。",
        "リアルタイムなフレーム配信、テレメトリ収集、シミュレーション遠隔操作を可能にするFastAPI＋WebSocketバックエンド。",
        "壁、障害物、出口、エージェント発生領域をリアルタイムに配置・編集できるインタラクティブシナリオエディタ。",
        "乱数シード固定によるパラメータスイープと感度分析を支援するA/Bシナリオ比較エンジン。",
        "HERMES実証ベンチマークデータセットに基づくCLI検証テストスイート。",
      ],
      tradeoff:
        "微視的な社会力モデルは出口付近の閉塞アーチ形成を忠実に捉えますが、空間分割を適用しない場合、計算量は密度の2乗 O(N^2) で急激に増加します。",
      lesson:
        "シナリオ作成、数値積分、テレメトリ記録のパイプラインを疎結合に保ち、実験条件の決定性と再現性を完全に担保すること。",
    },
    fluenttube: fluenttubeByLang.ja.study,
    "reservation-microsystem": {
      problem:
        "複数の専門スタッフが在籍するサービス業（クリニック、サロン、スタジオなど）では、リアルタイムの空き枠計算、役割ごとの厳格な権限分離（ADMIN / PROVIDER）、競合を防ぐ排他制御、そして省メモリな単一ノード環境でも確実に届くリマインダーを備えたホワイトラベル予約基盤が求められます。",
      architecture: [
        "Next.js 16 App RouterとReact 19による4ステップの顧客予約ウィザード（OAuth下書き復元、負荷分散自動割り当て、ISO/IEC 18004 SVG QRパス、.ics/Googleカレンダー出力）および役割保護された/adminポータル。",
        "Prisma 6とSQLite WAL上で動作するモジュラーサービス層（booking-service、schedule-service、staff-service、reminder-service）をBEGIN IMMEDIATE書き込みロックとIANAタイムゾーン演算で保護。",
        "役割横断のPII漏洩を防ぐサーバー側フィルタ付きSSE（/api/events）と、node:cryptoのみで実装したRFC 8292 VAPID ES256 / RFC 8291 aes128gcmネイティブWeb Push（永続PushDeliveryアウトボックスによる24時間前・2時間前自動通知）。",
        "sessionVersion失効機能付きHMAC-SHA256 HttpOnlyセッション、Google OAuth CSRFノンス、SSRF防御、プロキシ対応レート制限、重複予約上限、および2回無断キャンセル時の自動ロック機能。",
        "650mメモリ制限・127.0.0.1:3000バインドのnode:24-alpine Docker構成と、起動時のローテーションSQLiteバックアップおよびprisma migrate deploy自動復旧。",
      ],
      tradeoff:
        "BEGIN IMMEDIATEロックを備えたSQLite WALと外部ブローカー不要のネイティブWeb Pushを採用することで1GB RAMのVMでも自己完結的かつ予測可能に動作しますが、高並列書き込みが必要な場合はPrismaの設定変更によるPostgreSQL移行を前提としています。",
      lesson:
        "予約枠の不変条件、役割別SSEフィルタリング、通知配信のべき等性（eventKeyアウトボックス）はクライアント側の状態更新に頼らず、サーバーのトランザクション境界内で強制すべきです。",
    },
    "inside-link": {
      problem:
        "クリエイターやエンジニア向けの外部短縮URLサービスは追跡ピクセルや課金制限が多くなりがちです。InsideLink v2は独自ドメイン（links.cristianarando.dev）上で動作する単一オーナー向けのセルフホスト短縮URLエンジン、ポリモーフィックHUBプラットフォーム、Bentoディレクトリ、ゼロPII分析基盤を提供します。",
      architecture: [
        "Next.js 16（src/proxy.ts、App Router、非同期after()テレメトリ）とReact 19により、公開ディレクトリ（Bento/Grid/List）、/[slug]リゾルバ、および非公開の/admin管理画面を構築。",
        "Turso（@libsql/client）とDrizzle ORMでsite_settings、links、click_events、pin_attemptsを管理し、O(1)キーセットカーソルページネーションと単一ラウンドトリップのdb.batch(...)によるAnalytics 3.0（90日ヒートマップ、24時間UTC分布、都市別集計、HUBブロックCTR、CSV出力）を実現。",
        "6種類のブロック（button、キャッシュ付きgithub-repo、クリック再生式youtube/spotifyファサード、code、callout）を備えたポリモーフィックRich HUB（type = 'HUB'）、6種のダークプリセット、HEXテーマ上書き、SVG/PNG QRコード生成に対応。",
        "条件付きスマートルーティング（国、Accept-Language、デバイス、OS）、公開予約カウントダウン（starts_at）、期限切れフォールバック（307またはHTTP 410 Gone）、フルスクリーンクローキング、SSRF対策済みメタデータ・フレーム・ヘルススキャナを搭載。",
        "Better-AuthのGitHub OAuthをALLOWED_GITHUB_IDのフェイルクローズDBフックで単一オーナーに固定し、外部APIキーを排除。scrypt + timingSafeEqualによるPIN検証、HMAC-SHA256解除クッキー、SQLite原子レート制限（60秒5回）を備え、27スイート106件のVitestテストで検証。",
      ],
      tradeoff:
        "認証を単一オーナーに限定し、全テレメトリをafter()とdb.batch()経由でSQLite/Tursoに集約することでマルチテナントの複雑さや外部計測スクリプトを排除できる一方、個人インフラ専用設計となりマルチテナントSaaS販売には向かないトレードオフがあります。",
      lesson:
        "リダイレクト解決とテレメトリ記録を非同期after()フックで切り離し、サーバー境界でフェイルクローズの所有権検証とSSRF防御を徹底することで、高速で監査可能な個人向けリンク基盤を維持できます。",
    },
    "explora-bolivia": {
      problem:
        "ボリビアの観光資源やおすすめルートを体系的に紹介し、探索体験を支えるWebプラットフォーム。",
      architecture: [
        "Next.jsとShadcnによる高信頼で直感的なUIコンポーネント構成。",
        "NestJSとTypeORM、PostgreSQLによる疎結合なバックエンドサービス境界設計。",
        "DockerコンテナとGitLab CIによる自動テストと再現可能な実行環境。",
      ],
      tradeoff:
        "フロントエンドとバックエンドの厳格な分離により個別の機能拡張が容易になる一方、維持すべきAPIスキーマの保守コストが発生します。",
      lesson:
        "データモデルとAPI仕様を一体で設計すること。目的地情報の保持方法、取得フロー、各層のバリデーション責務を明確にします。",
    },
    "maxi-basquet": {
      problem:
        "国際バスケットボール大会の運営支援システム。出場チーム登録、対戦組み合わせ、試合記録、順位表の更新を一括管理。",
      architecture: [
        "DjangoとPythonを用いた堅牢なフルスタック構成。",
        "PostgreSQLによる整合性の高いリレーショナルデータ構造とBootstrapによる直感的な管理UI。",
        "フォーム入力からビジネスロジック、DB制約に至る一貫したデータバリデーション設計。",
      ],
      tradeoff:
        "Djangoフレームワークの採用により開発速度と安全性を最大化できますが、即時性の高いライブ配信機能には追加のクライアントスクリプトが必要となります。",
      lesson:
        "競技規約をアプリケーション層に明示し、不変条件はDBの制約として設定すること。すべてのデータ更新は有効なドメイン操作として完結させる必要があります。",
    },
    "long-old-live": {
      problem:
        "シニア層の健康維持をサポートするWebサイト。無理のない筋力運動や脳トレアクティビティをわかりやすく提供。",
      architecture: [
        "素のJavaScript（Vanilla）、セマンティックHTML、CSS/Bootstrapによる軽快なフロントエンド。",
        "Firebaseを活用した安全なバックエンド・データ管理。",
        "DOM描画、ユーザー操作、外部API呼び出しを明確に分離したクリーンなモジュール設計。",
      ],
      tradeoff:
        "フレームワークを排除することで軽量性と高い互換性を得られますが、機能拡張時には状態管理の規律を自前で維持する必要があります。",
      lesson:
        "アクセシビリティを考慮したHTMLから設計を開始し、小さなモジュールで機能を追加すること。セキュリティルールはUIとは独立して検証します。",
    },
  },
};

export function getCaseStudy(id: ProjectId, lang: Lang = "en"): CaseStudyData {
  const localized = caseStudiesByLang[lang]?.[id];
  return localized || caseStudiesByLang.en[id];
}

export const caseStudies = caseStudiesByLang.en;
