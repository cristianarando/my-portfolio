import type { Lang } from "../i18n/utils";
import type { ProjectId } from "./projects";

export interface ArchitectureNode {
  id: string;
  layer: string;
  title: string;
  tech: string;
  telemetry: string;
  summary: string;
  contract: string;
  invariant: string;
}

export interface ArchitectureScenario {
  id: string;
  label: string;
  badge: string;
  description: string;
  nodes: ArchitectureNode[];
}

export interface ProjectArchitectureFlow {
  projectId: ProjectId;
  scenarios: ArchitectureScenario[];
}

type ArchFlowProjectId = Extract<
  ProjectId,
  | "onelink-saas"
  | "fluenttube"
  | "crowdsafe-physics"
  | "kerr-spacetime-workstation"
>;

const flowsByLang: Record<
  Lang,
  Record<ArchFlowProjectId, ArchitectureScenario[]>
> = {
  en: {
    "onelink-saas": [
      {
        id: "cache-hit",
        label: "Cache-Hit Hot Path",
        badge: "Read Path · Async Telemetry",
        description:
          "Public vanity profile delivery keeps reads off relational storage while click telemetry drains asynchronously.",
        nodes: [
          {
            id: "edge-isr",
            layer: "Edge / SSR",
            title: "Next.js 16 Router",
            tech: "React 19 · ISR",
            telemetry: "HTML Edge Hit",
            summary:
              "Resolves the creator vanity slug via Server Components and triggers a non-blocking click beacon after response hydration.",
            contract: "GET /:handle -> 200 ProfileSnapshot + POST /beacon",
            invariant:
              "Public page delivery never blocks on analytics database writes.",
          },
          {
            id: "redis-cache",
            layer: "Cache Layer",
            title: "Redis 7 Cache-Aside",
            tech: "Redis Stack",
            telemetry: "Sub-ms Lookup",
            summary:
              "Serves the serialized link tree and theme configuration directly from in-memory keyspace before touching Prisma.",
            contract: "HGETALL profile:{slug} -> CachedProfile | MISS",
            invariant:
              "Every dashboard mutation explicitly invalidates or refreshes its slug key.",
          },
          {
            id: "bullmq-queue",
            layer: "Queue Boundary",
            title: "BullMQ Click Worker",
            tech: "BullMQ · NestJS 12",
            telemetry: "Decoupled I/O",
            summary:
              "Buffers link click and audit events into Redis-backed queues so sudden traffic spikes drain cleanly without locking profile tables.",
            contract: "Queue.add('click.track', { linkId, uaHash, ts })",
            invariant:
              "Bounded retries and dead-letter queues preserve telemetry under burst load.",
          },
          {
            id: "timescale-sink",
            layer: "Time-Series DB",
            title: "TimescaleDB Hypertable",
            tech: "PostgreSQL 16 + Timescale",
            telemetry: "Chunked Rollup",
            summary:
              "Appends batched click events into time-partitioned chunks for continuous creator analytics while Prisma manages core schemas.",
            contract: "INSERT INTO click_events (time, link_id, meta)",
            invariant:
              "Dedicated hypertable migrations stay isolated from transactional Prisma models.",
          },
        ],
      },
      {
        id: "sentinel-guard",
        label: "Cache-Miss & Sentinel Guard",
        badge: "Write Path · RBAC & Safety",
        description:
          "Profile mutations pass Hexagonal NestJS validation, hierarchical RBAC, and Sentinel AI lexical scanning before cache warm-up.",
        nodes: [
          {
            id: "studio-ui",
            layer: "Creator Client",
            title: "Dashboard App",
            tech: "Next.js 16 · OpenAPI",
            telemetry: "Typed Mutation",
            summary:
              "Submits new bio links or workspace policy changes using strongly typed DTOs generated from OpenAPI 3.0 contracts.",
            contract: "PATCH /v1/links/:id { url, title, tenantId }",
            invariant:
              "Workspace tenancy and DTO bounds are validated on every API boundary.",
          },
          {
            id: "nestjs-hex",
            layer: "App Boundary",
            title: "NestJS 12 Core",
            tech: "SWC (~70ms) · RBAC",
            telemetry: "5-Tier Policy",
            summary:
              "Enforces hierarchical RBAC (Owner > Admin > Safety > Editor > Viewer) inside clean application ports.",
            contract: "Guard(role >= EDITOR, tenantMatch) -> Command",
            invariant:
              "Domain logic remains independent of transport adapters and database ORMs.",
          },
          {
            id: "sentinel-ai",
            layer: "Security Gate",
            title: "Sentinel AI Scanner",
            tech: "Lexical Threat Shield",
            telemetry: "< 25 ms Scan",
            summary:
              "Inspects destination URLs and link metadata for phishing, unsafe redirects, and policy violations prior to persistence.",
            contract: "inspectPayload(url, meta) -> ALLOW | FLAG | BLOCK",
            invariant:
              "Blocked payloads abort transaction commit and emit an immutable audit entry.",
          },
          {
            id: "pg-writeback",
            layer: "Persistence",
            title: "PostgreSQL + Cache Sync",
            tech: "Prisma 6 · Redis 7",
            telemetry: "ACID + Evict",
            summary:
              "Commits normalized relational records via Prisma 6 and invalidates the corresponding Redis profile key.",
            contract: "COMMIT link_tx -> DEL profile:{slug}",
            invariant:
              "Cache eviction runs post-commit so stale reads never outlive committed writes.",
          },
        ],
      },
    ],
    fluenttube: [
      {
        id: "offline-pipeline",
        label: "Local Media & ASR Pipeline",
        badge: "100% Offline · Checkpointed",
        description:
          "Importing local MP4 or WebM video runs media probing, Whisper ASR checkpoints, and SQLite persistence entirely on-device.",
        nodes: [
          {
            id: "react-import",
            layer: "Local UI",
            title: "React 19 Studio",
            tech: "TanStack Query · Zustand",
            telemetry: "Local File Only",
            summary:
              "Accepts a local MP4/WebM selection and opens an offline import job without uploading video files to any external server.",
            contract: "POST /imports/local { filePath, originalName }",
            invariant:
              "Original media files remain untouched; fragmented MP4 uses a cached copy without re-encoding.",
          },
          {
            id: "ffmpeg-probe",
            layer: "Worker Boundary",
            title: "FastAPI + FFmpeg",
            tech: "Bounded Queue · ffprobe",
            telemetry: "Sequential Safe",
            summary:
              "Inspects media streams, verifies duration, and extracts normalized 16 kHz audio chunks through FFmpeg subprocesses.",
            contract: "probeMedia(file) -> AudioWaveChunks[]",
            invariant:
              "Bounded worker concurrency keeps CPU/GPU utilization predictable on consumer hardware.",
          },
          {
            id: "whisper-asr",
            layer: "Speech Engine",
            title: "Faster-Whisper Checkpoints",
            tech: "CPU / Optional CUDA",
            telemetry: "5-Min Recovery",
            summary:
              "Transcribes segments locally and persists progress every five minutes so long videos resume after interruption.",
            contract: "transcribeSegment(chunk) -> TimedSentences[]",
            invariant:
              "Completed five-minute checkpoints survive restarts without re-transcribing earlier segments.",
          },
          {
            id: "sqlite-wal",
            layer: "Local Store",
            title: "SQLite WAL + IPA DB",
            tech: "SQLite WAL · 67k IPA",
            telemetry: "ACID Local",
            summary:
              "Stores sentence alignments alongside bundled British IPA (67,000+ spellings) and WordNet entries for instant lookup.",
            contract: "TX -> INSERT sentences + SELECT ipa_lexicon",
            invariant:
              "Foreign keys and WAL journaling keep library state durable alongside browser UI drafts.",
          },
        ],
      },
      {
        id: "practice-loop",
        label: "Dictation & Optional Tutor",
        badge: "Local-First · Explicit Opt-In",
        description:
          "Listen → Write → Speak runs against bundled offline dictionaries; text leaves the computer only for the optional cloud tutor.",
        nodes: [
          {
            id: "player-sync",
            layer: "Practice UI",
            title: "Listen → Write → Speak",
            tech: "Zustand · HTML5 Media",
            telemetry: "Zero Network",
            summary:
              "Loops target sentences at variable playback speeds and tracks active sentence cursors cleanly.",
            contract: "selectSentence(id, loopRange) -> ActivePrompt",
            invariant:
              "Transient typing drafts stay separated from committed SQLite practice milestones.",
          },
          {
            id: "dictation-scorer",
            layer: "Validation Core",
            title: "FastAPI Scorer",
            tech: "Token Alignment · Pitch",
            telemetry: "Deterministic",
            summary:
              "Checks completed dictation tokens in order (handling contractions and hyphens) and plots experimental pitch contours.",
            contract: "scoreDictation(input, target) -> TokenDiff + Hints",
            invariant:
              "Speaking contours and recognized words are labeled explicitly as experimental guidance, never phoneme grading.",
          },
          {
            id: "bundled-lexicon",
            layer: "Offline Reference",
            title: "British IPA & WordNet",
            tech: "Bundled Local Assets",
            telemetry: "Offline Lookup",
            summary:
              "Resolves word meanings, parts of speech, contextual examples, and alternative British IPA readings locally.",
            contract: "lookupWord(token, context) -> IPAVariants + Gloss",
            invariant:
              "Finite dictionary coverage handles missing forms gracefully without runtime downloads.",
          },
          {
            id: "cloud-tutor",
            layer: "Opt-In Boundary",
            title: "Cloud Tutor Gateway",
            tech: "Configured Provider API",
            telemetry: "Text-Only Opt-In",
            summary:
              "Sends only the requested sentence or vocabulary phrase when the learner explicitly triggers translation or connected-speech coaching.",
            contract: "explainSentence(text, apiKey) -> SpanishNote + Tips",
            invariant:
              "Core import, playback, dictation, and dictionary lookup never require an API key.",
          },
        ],
      },
    ],
    "crowdsafe-physics": [
      {
        id: "realtime-ws",
        label: "Real-Time WebSocket Stream",
        badge: "60 FPS Telemetry · HFV",
        description:
          "Geometric obstacles and exit topologies stream continuously into the social-force kernel and back over WebSockets.",
        nodes: [
          {
            id: "scenario-editor",
            layer: "Authoring UI",
            title: "Scenario Geometry Editor",
            tech: "Walls · Pillars · Exits",
            telemetry: "Declarative JSON",
            summary:
              "Defines exit widths, deflecting columns, walls, and pedestrian spawn zones in a decoupled geometry specification.",
            contract: "ScenarioSpec { walls[], exits[], spawns[], seed }",
            invariant:
              "Authoring state stays strictly separated from numerical integration mutators.",
          },
          {
            id: "fastapi-ws",
            layer: "Transport Bridge",
            title: "FastAPI + Uvicorn WS",
            tech: "FastAPI WebSockets",
            telemetry: "Bi-Directional",
            summary:
              "Streams control commands (pause, step, inspect) and pushes compact frame snapshots to the visualization client.",
            contract: "WS /ws/sim -> FramePacket { positions, velocities }",
            invariant:
              "Transport serialization never blocks or alters floating-point physics determinism.",
          },
          {
            id: "hfv-kernel",
            layer: "Physics Engine",
            title: "HFV Social-Force Kernel",
            tech: "NumPy · Python",
            telemetry: "O(N^2) Contact",
            summary:
              "Integrates desired motive, repulsive social, body-compression elastic, and tangential sliding friction forces.",
            contract:
              "stepHFV(state, dt) -> Forces(social + elastic + friction)",
            invariant:
              "Fixed timestep dt prevents tunneling through narrow exit jambs under high crowd compression.",
          },
          {
            id: "telemetry-frame",
            layer: "Metrics View",
            title: "Bottleneck Telemetry",
            tech: "Density · Arching Probe",
            telemetry: "Frame Metrics",
            summary:
              "Measures exit flow rate, clogging arches, faster-is-slower breakdowns, and local kinetic pressure per tick.",
            contract:
              "extractMetrics(frame) -> { flowRate, archCount, maxForce }",
            invariant:
              "Recorded metrics derive identically whether rendered live or executed headlessly.",
          },
        ],
      },
      {
        id: "hermes-ab",
        label: "A/B Sweep & HERMES Suite",
        badge: "Common Seed · Empirical",
        description:
          "Controlled experiments freeze PRNG seeds across architectural variants and compare metrics against the HERMES dataset.",
        nodes: [
          {
            id: "ab-seed",
            layer: "Experiment Plan",
            title: "Common-Seed Config",
            tech: "Controlled PRNG",
            telemetry: "Bit-Reproducible",
            summary:
              "Locks initial agent positions, desired velocities, and body radii across Variant A and Variant B geometries.",
            contract: "ExperimentPair(baseConfig, deltaGeometry, seed)",
            invariant:
              "Observed evacuation differences isolate geometry rather than stochastic spawn noise.",
          },
          {
            id: "sweep-runner",
            layer: "CLI / Orchestrator",
            title: "Parameter Sweep Engine",
            tech: "Python CLI · Sensitivity",
            telemetry: "Headless Batch",
            summary:
              "Evaluates desire-to-hurry v_0, bottleneck widths, and obstacle offsets across reproducible sweeps.",
            contract: "runSweep(paramGrid, seed) -> RunArtifacts[]",
            invariant:
              "Each run writes its exact configuration hash alongside time-series outputs.",
          },
          {
            id: "contact-solver",
            layer: "Integrator",
            title: "Deterministic HFV Solver",
            tech: "NumPy Vectorized",
            telemetry: "Seed-Locked",
            summary:
              "Runs the exact same contact and sliding friction laws headlessly without UI coupling.",
            contract: "simulateUntilEvacuated(spec) -> TrajectoryLog",
            invariant:
              "Core physics routines have zero dependency on WebSocket or GUI layers.",
          },
          {
            id: "hermes-val",
            layer: "Verification",
            title: "HERMES Validation Module",
            tech: "Empirical Dataset",
            telemetry: "Benchmark Fit",
            summary:
              "Calibrates fundamental diagrams (density vs. flow) and egress curves against controlled HERMES pedestrian benchmarks.",
            contract: "validateHERMES(logs, dataset) -> ResidualReport",
            invariant:
              "Qualitative claims require quantitative alignment within calibrated empirical bands.",
          },
        ],
      },
    ],
    "kerr-spacetime-workstation": [
      {
        id: "null-geodesic",
        label: "Relativistic Ray-Marching",
        badge: "WebGL 2.0 · GLSL Shader",
        description:
          "GPU fragment shaders integrate null geodesics backward from the observer camera through curved Kerr spacetime.",
        nodes: [
          {
            id: "observer-cam",
            layer: "Camera Frame",
            title: "Three.js Observer Setup",
            tech: "Three.js r160 · Spin a/M",
            telemetry: "60 FPS Viewport",
            summary:
              "Injects inclination theta_0, dimensionless spin a/M, and viewport ray directions in geometric units (G = c = 1).",
            contract:
              "uniforms { a, r_obs, theta_obs } -> ScreenRay(alpha, beta)",
            invariant:
              "Sub-extremal spin stays strictly clamped (|a| < M) to avoid naked singularity artifacts.",
          },
          {
            id: "boyer-lindquist",
            layer: "Metric Tensor",
            title: "Boyer-Lindquist Kernel",
            tech: "GLSL · g_mu_nu(r, theta)",
            telemetry: "Exact Tensor",
            summary:
              "Evaluates frame-dragging cross terms g_t_phi and horizon functions Delta and Sigma at every integration step.",
            contract:
              "metricKerr(r, theta, a) -> { g_tt, g_tphi, g_rr, g_thth }",
            invariant:
              "Ray integration halts immediately when r approaches the outer event horizon r_+.",
          },
          {
            id: "rk4-null",
            layer: "GPU Integrator",
            title: "RK4 Null Geodesics",
            tech: "4th-Order Runge-Kutta",
            telemetry: "Adaptive Step",
            summary:
              "Advances canonical geodesic momenta across strong-field photon spheres and frame-dragged lensing arcs.",
            contract: "rk4Step(x^mu, k_mu, dLambda) -> NextPhotonState",
            invariant:
              "Carter's constant Q and null norm k_mu k^mu = 0 guard against numerical drift.",
          },
          {
            id: "novikov-thorne",
            layer: "Radiative Transfer",
            title: "Novikov-Thorne Disk",
            tech: "Liouville I_obs = g^4 I_em",
            telemetry: "Doppler Shift",
            summary:
              "Evaluates photon frequency shift factor g = E_obs / E_em at equatorial disk intersections for relativistic beaming.",
            contract: "shadeDisk(r_hit, k_mu) -> RGBA(I_obs = g^4 * I_em)",
            invariant:
              "Emission terminates cleanly inside the spin-dependent ISCO radius.",
          },
        ],
      },
      {
        id: "timelike-orbit",
        label: "Zoom-Whirl & Invariants",
        badge: "G = c = 1 · Diagnostics",
        description:
          "Browser physics probes integrate massive particle orbits and stream live invariant diagnostics into phase oscilloscopes.",
        nodes: [
          {
            id: "orbital-params",
            layer: "Initial Data",
            title: "Conserved Constants",
            tech: "Energy E · Momentum L_z",
            telemetry: "Initial State",
            summary:
              "Translates user impact parameters and spin into exact timelike four-velocity normalization.",
            contract: "initParticle(r0, E, L_z, a) -> u^mu(0) (u.u = -1)",
            invariant:
              "Every initial state satisfies the timelike normalization g_mu_nu u^mu u^nu = -1.",
          },
          {
            id: "veff-potential",
            layer: "Potential Analysis",
            title: "Effective Potential V_eff(r)",
            tech: "Radial Turning Points",
            telemetry: "Real-Time Plot",
            summary:
              "Computes relativistic potential wells to classify plunging, circular ISCO, precessing, and zoom-whirl regimes.",
            contract: "evalVeff(r, E, L_z, a) -> BarrierProfile",
            invariant:
              "Turning points reflect smoothly without imaginary-square-root domain errors.",
          },
          {
            id: "rk4-timelike",
            layer: "JS Integrator",
            title: "Timelike RK4 Solver",
            tech: "Hamiltonian / Symplectic",
            telemetry: "Proper Time tau",
            summary:
              "Steps massive bodies through relativistic apsidal precession and multiple tight whirls near the unstable barrier.",
            contract:
              "integrateOrbit(state, dTau) -> Path + PhasePoint(r, p_r)",
            invariant:
              "Coordinates switch or clamp cleanly before coordinate singularities near r_+.",
          },
          {
            id: "invariant-guard",
            layer: "Oscilloscope Guard",
            title: "Invariants & Phase Scope",
            tech: "Kretschmann · (r, p_r)",
            telemetry: "Continuous Check",
            summary:
              "Monitors residual drift in E, L_z, and Kretschmann curvature scalar alongside live symplectic phase-space traces.",
            contract: "checkInvariants(state) -> { dE, dLz, K_scalar }",
            invariant:
              "Conserved quantities act as live unit tests verifying numerical integration integrity.",
          },
        ],
      },
    ],
  },
  es: {
    "onelink-saas": [
      {
        id: "cache-hit",
        label: "Ruta rápida Cache-Hit",
        badge: "Lectura · Telemetría asíncrona",
        description:
          "La entrega pública de perfiles evita tocar la base relacional en caliente mientras la analítica de clics drena en segundo plano.",
        nodes: [
          {
            id: "edge-isr",
            layer: "Edge / SSR",
            title: "Next.js 16 App Router",
            tech: "React 19 · ISR",
            telemetry: "Cache Edge",
            summary:
              "Resuelve el alias del creador mediante Server Components y emite el beacon de clic sin bloquear la hidratación.",
            contract: "GET /:handle -> 200 ProfileSnapshot + POST /beacon",
            invariant:
              "La entrega del perfil público nunca queda bloqueada por escrituras analíticas.",
          },
          {
            id: "redis-cache",
            layer: "Capa Caché",
            title: "Redis 7 Cache-Aside",
            tech: "Redis Stack",
            telemetry: "Sub-milisegundo",
            summary:
              "Entrega el árbol de enlaces serializado y la configuración visual directamente desde memoria antes de consultar Prisma.",
            contract: "HGETALL profile:{slug} -> CachedProfile | MISS",
            invariant:
              "Toda mutación desde el panel invalida o refresca explícitamente su clave en Redis.",
          },
          {
            id: "bullmq-queue",
            layer: "Frontera de Cola",
            title: "Worker BullMQ",
            tech: "BullMQ · NestJS 12",
            telemetry: "E/S Desacoplada",
            summary:
              "Encola clics y eventos de auditoría en Redis para absorber picos de tráfico sin bloquear tablas transaccionales.",
            contract: "Queue.add('click.track', { linkId, uaHash, ts })",
            invariant:
              "Reintentos acotados y colas de fallos preservan la telemetría bajo picos de carga.",
          },
          {
            id: "timescale-sink",
            layer: "Series Temporales",
            title: "TimescaleDB Hypertable",
            tech: "PostgreSQL 16 + Timescale",
            telemetry: "Particionado Temporal",
            summary:
              "Inserta lotes de clics en chunks particionados por tiempo mientras Prisma administra el esquema relacional central.",
            contract: "INSERT INTO click_events (time, link_id, meta)",
            invariant:
              "Las migraciones de hypertables se gestionan separadas del esquema estándar de Prisma.",
          },
        ],
      },
      {
        id: "sentinel-guard",
        label: "Cache-Miss y Sentinel AI",
        badge: "Escritura · RBAC y Seguridad",
        description:
          "Las mutaciones de perfil cruzan Arquitectura Hexagonal en NestJS, RBAC jerárquico y análisis léxico con Sentinel AI.",
        nodes: [
          {
            id: "studio-ui",
            layer: "Cliente Creador",
            title: "Panel de Control",
            tech: "Next.js 16 · OpenAPI",
            telemetry: "DTO Tipado",
            summary:
              "Envía nuevos enlaces o cambios de política usando contratos DTO generados desde especificaciones OpenAPI 3.0.",
            contract: "PATCH /v1/links/:id { url, title, tenantId }",
            invariant:
              "El aislamiento multi-inquilino y los límites del esquema se validan en la frontera API.",
          },
          {
            id: "nestjs-hex",
            layer: "Frontera Aplicación",
            title: "Núcleo NestJS 12",
            tech: "SWC (~70ms) · RBAC",
            telemetry: "RBAC 5 Niveles",
            summary:
              "Verifica permisos jerárquicos (Owner > Admin > Safety > Editor > Viewer) sobre puertos hexagonales desacoplados.",
            contract: "Guard(role >= EDITOR, tenantMatch) -> Command",
            invariant:
              "Las reglas de dominio permanecen independientes del transporte HTTP y del ORM.",
          },
          {
            id: "sentinel-ai",
            layer: "Filtro Seguridad",
            title: "Escáner Sentinel AI",
            tech: "Defensa Léxica",
            telemetry: "Análisis < 25 ms",
            summary:
              "Inspecciona URLs de destino y metadatos frente a phishing, redirecciones maliciosas o abuso léxico antes de persistir.",
            contract: "inspectPayload(url, meta) -> ALLOW | FLAG | BLOCK",
            invariant:
              "Los enlaces bloqueados abortan la transacción y generan un registro inmutable de auditoría.",
          },
          {
            id: "pg-writeback",
            layer: "Persistencia",
            title: "PostgreSQL + Invalidación",
            tech: "Prisma 6 · Redis 7",
            telemetry: "ACID + Evict",
            summary:
              "Confirma los cambios relacionales con Prisma 6 e invalida la clave en caché correspondiente al perfil modificado.",
            contract: "COMMIT link_tx -> DEL profile:{slug}",
            invariant:
              "La invalidación ocurre tras confirmar la transacción para evitar lecturas obsoletas.",
          },
        ],
      },
    ],
    fluenttube: [
      {
        id: "offline-pipeline",
        label: "Pipeline Local de Medios y ASR",
        badge: "100% Offline · Con Checkpoints",
        description:
          "Importar MP4 o WebM locales ejecuta inspección multimedia, transcripción Whisper por tramos y SQLite enteramente en tu equipo.",
        nodes: [
          {
            id: "react-import",
            layer: "UI Local",
            title: "Estudio React 19",
            tech: "TanStack Query · Zustand",
            telemetry: "Solo Archivo Local",
            summary:
              "Selecciona un video MP4/WebM del disco e inicia la importación sin subir archivos multimedia a ningún servidor.",
            contract: "POST /imports/local { filePath, originalName }",
            invariant:
              "El archivo original no se modifica; los MP4 fragmentados usan copia en caché sin recodificar.",
          },
          {
            id: "ffmpeg-probe",
            layer: "Frontera Worker",
            title: "FastAPI + FFmpeg",
            tech: "Cola Acotada · ffprobe",
            telemetry: "Flujo Seguro",
            summary:
              "Inspecciona pistas mediante ffprobe y extrae audio normalizado a 16 kHz por segmentos en segundo plano.",
            contract: "probeMedia(file) -> AudioWaveChunks[]",
            invariant:
              "La cola acotada evita saturar memoria o CPU en hardware doméstico.",
          },
          {
            id: "whisper-asr",
            layer: "Motor de Voz",
            title: "Checkpoints Faster-Whisper",
            tech: "CPU / CUDA Opcional",
            telemetry: "Tramos de 5 Min",
            summary:
              "Transcribe localmente y guarda puntos de control cada cinco minutos para reanudar videos largos tras reinicios.",
            contract: "transcribeSegment(chunk) -> TimedSentences[]",
            invariant:
              "Los tramos completados sobreviven reinicios sin reprocesar segmentos ya transcritos.",
          },
          {
            id: "sqlite-wal",
            layer: "Almacén Local",
            title: "SQLite WAL + Diccionario IPA",
            tech: "SQLite WAL · 67k IPA",
            telemetry: "ACID Local",
            summary:
              "Persiste oraciones alineadas junto al léxico británico embebido (67.000+ grafías) y entradas WordNet sin descargas.",
            contract: "TX -> INSERT sentences + SELECT ipa_lexicon",
            invariant:
              "Las claves foráneas y WAL protegen la biblioteca frente a borradores temporales del navegador.",
          },
        ],
      },
      {
        id: "practice-loop",
        label: "Dictado y Tutor Opcional",
        badge: "Local-First · Opt-In Explícito",
        description:
          "Listen → Write → Speak usa diccionarios locales empaquetados; solo el tutor opcional en la nube recibe texto puntual.",
        nodes: [
          {
            id: "player-sync",
            layer: "Práctica UI",
            title: "Listen → Write → Speak",
            tech: "Zustand · Video Nativo",
            telemetry: "Cero Red",
            summary:
              "Reproduce bucles por oración a velocidad variable manteniendo sincronizado el estado activo en la lista.",
            contract: "selectSentence(id, loopRange) -> ActivePrompt",
            invariant:
              "Los borradores de escritura se aíslan del progreso consolidado en SQLite.",
          },
          {
            id: "dictation-scorer",
            layer: "Núcleo Evaluación",
            title: "Evaluador FastAPI",
            tech: "Tokens · Contorno Tonal",
            telemetry: "Determinista",
            summary:
              "Evalúa palabras completadas en orden (contracciones y guiones) y traza contornos experimentales de entonación.",
            contract: "scoreDictation(input, target) -> TokenDiff + Hints",
            invariant:
              "El feedback oral se presenta explícitamente como guía experimental y no califica fonemas ni certifica acento.",
          },
          {
            id: "bundled-lexicon",
            layer: "Léxico Offline",
            title: "IPA Británico y WordNet",
            tech: "Datos Empaquetados",
            telemetry: "Consulta Instantánea",
            summary:
              "Muestra transcripción IPA británica, significados, categoría gramatical y lecturas alternativas desde disco.",
            contract: "lookupWord(token, context) -> IPAVariants + Gloss",
            invariant:
              "Ante entradas fuera del diccionario finito, la interfaz degrada con claridad sin fallar.",
          },
          {
            id: "cloud-tutor",
            layer: "Frontera Opcional",
            title: "Pasarela Tutor Cloud",
            tech: "Proveedor Configurado",
            telemetry: "Solo Texto Opt-In",
            summary:
              "Envía únicamente la frase seleccionada cuando el usuario solicita traducción al español o notas de connected speech.",
            contract: "explainSentence(text, apiKey) -> SpanishNote + Tips",
            invariant:
              "Ninguna función principal de importación, dictado o léxico requiere clave API.",
          },
        ],
      },
    ],
    "crowdsafe-physics": [
      {
        id: "realtime-ws",
        label: "Transmisión WebSocket en Vivo",
        badge: "60 FPS · Modelo HFV",
        description:
          "La geometría del escenario alimenta el motor físico de fuerzas sociales y transmite cuadros en vivo mediante WebSockets.",
        nodes: [
          {
            id: "scenario-editor",
            layer: "Edición UI",
            title: "Editor de Escenarios",
            tech: "Muros · Pilares · Salidas",
            telemetry: "JSON Declarativo",
            summary:
              "Define anchos de salida, columnas deflectoras, paredes y zonas de aparición sin acoplarse al integrador.",
            contract: "ScenarioSpec { walls[], exits[], spawns[], seed }",
            invariant:
              "La geometría de entrada permanece separada del estado mutable de la integración física.",
          },
          {
            id: "fastapi-ws",
            layer: "Puente Red",
            title: "FastAPI + Uvicorn WS",
            tech: "FastAPI WebSockets",
            telemetry: "Bidireccional",
            summary:
              "Recibe comandos interactivos (pausa, paso, inspección) y emite paquetes compactos de posición y velocidad.",
            contract: "WS /ws/sim -> FramePacket { positions, velocities }",
            invariant:
              "La serialización de red jamás altera la reproducibilidad numérica de los pasos físicos.",
          },
          {
            id: "hfv-kernel",
            layer: "Motor Físico",
            title: "Núcleo Social-Force HFV",
            tech: "NumPy · Python",
            telemetry: "Contacto O(N^2)",
            summary:
              "Integra fuerza motriz deseada, repulsión social, elasticidad corporal y fricción tangencial en contacto humano.",
            contract:
              "stepHFV(state, dt) -> Forces(social + elastic + friction)",
            invariant:
              "Un paso temporal dt acotado evita que agentes atraviesen muros bajo alta compresión.",
          },
          {
            id: "telemetry-frame",
            layer: "Vista Métricas",
            title: "Telemetría de Evacuación",
            tech: "Densidad · Arcos de Bloqueo",
            telemetry: "Métricas por Tick",
            summary:
              "Registra caudal de salida, formación de arcos de bloqueo, efecto faster-is-slower y presión de contacto.",
            contract:
              "extractMetrics(frame) -> { flowRate, archCount, maxForce }",
            invariant:
              "Las métricas calculadas son idénticas tanto en visualización WebSocket como por CLI.",
          },
        ],
      },
      {
        id: "hermes-ab",
        label: "Comparación A/B y HERMES",
        badge: "Semilla Fija · Validación",
        description:
          "Experimentos controlados fijan semillas aleatorias entre variantes geométricas y validan curvas contra el dataset HERMES.",
        nodes: [
          {
            id: "ab-seed",
            layer: "Diseño Experimental",
            title: "Configuración Common-Seed",
            tech: "PRNG Controlado",
            telemetry: "Determinista",
            summary:
              "Bloquea posiciones iniciales, radios y velocidades deseadas idénticas entre las variantes A y B.",
            contract: "ExperimentPair(baseConfig, deltaGeometry, seed)",
            invariant:
              "Las diferencias de flujo aislan el cambio arquitectónico y no ruido aleatorio inicial.",
          },
          {
            id: "sweep-runner",
            layer: "Orquestador CLI",
            title: "Barrido de Parámetros",
            tech: "Python CLI · Sensibilidad",
            telemetry: "Lote Headless",
            summary:
              "Explora velocidad de urgencia v_0, ubicación de pilares deflectores y anchos de salida en ejecución reproducible.",
            contract: "runSweep(paramGrid, seed) -> RunArtifacts[]",
            invariant:
              "Cada corrida archiva el hash de configuración junto a sus series de telemetría.",
          },
          {
            id: "contact-solver",
            layer: "Integrador",
            title: "Integrador HFV Puro",
            tech: "NumPy Vectorizado",
            telemetry: "Sin Acoplamiento UI",
            summary:
              "Ejecuta exactamente las mismas ecuaciones de fuerza y fricción sin dependencia de navegador ni servidor web.",
            contract: "simulateUntilEvacuated(spec) -> TrajectoryLog",
            invariant:
              "El núcleo numérico no importa ni depende de WebSockets ni de capas de interfaz.",
          },
          {
            id: "hermes-val",
            layer: "Validación Empírica",
            title: "Benchmark HERMES",
            tech: "Dataset Empírico",
            telemetry: "Calibración",
            summary:
              "Contrasta diagramas fundamentales densidad-flujo y tiempos de evacuación frente a experimentos reales HERMES.",
            contract: "validateHERMES(logs, dataset) -> ResidualReport",
            invariant:
              "Las conclusiones de seguridad se apoyan en rangos empíricos medidos.",
          },
        ],
      },
    ],
    "kerr-spacetime-workstation": [
      {
        id: "null-geodesic",
        label: "Ray-Marching Relativista",
        badge: "WebGL 2.0 · Shaders GLSL",
        description:
          "Los shaders de fragmento integran geodésicas nulas hacia atrás desde el observador a través de la métrica de Kerr.",
        nodes: [
          {
            id: "observer-cam",
            layer: "Marco Observador",
            title: "Cámara Three.js r160",
            tech: "Three.js · Spin a/M",
            telemetry: "Viewport 60 FPS",
            summary:
              "Inyecta inclinación theta_0, espín adimensional a/M y dirección de rayos en unidades geométricas (G = c = 1).",
            contract:
              "uniforms { a, r_obs, theta_obs } -> ScreenRay(alpha, beta)",
            invariant:
              "El espín sub-extremal se acota estrictamente (|a| < M) para evitar singularidades desnudas.",
          },
          {
            id: "boyer-lindquist",
            layer: "Tensor Métrico",
            title: "Métrica Boyer-Lindquist",
            tech: "GLSL · g_mu_nu(r, theta)",
            telemetry: "Tensor Exacto",
            summary:
              "Evalúa el arrastre de marco g_t_phi y funciones de horizonte Delta y Sigma en cada paso de integración.",
            contract:
              "metricKerr(r, theta, a) -> { g_tt, g_tphi, g_rr, g_thth }",
            invariant:
              "La integración de rayos se detiene al aproximarse al horizonte de eventos exterior r_+.",
          },
          {
            id: "rk4-null",
            layer: "Integrador GPU",
            title: "Geodésicas Nulas RK4",
            tech: "Runge-Kutta 4º Orden",
            telemetry: "Paso Adaptativo",
            summary:
              "Avanza el cuadrimomento del fotón cerca de la esfera de fotones y capta arcos de lente gravitacional.",
            contract: "rk4Step(x^mu, k_mu, dLambda) -> NextPhotonState",
            invariant:
              "La constante de Carter Q y la condición nula k_mu k^mu = 0 vigilan la deriva numérica.",
          },
          {
            id: "novikov-thorne",
            layer: "Transporte Radiativo",
            title: "Disco Novikov-Thorne",
            tech: "Liouville I_obs = g^4 I_em",
            telemetry: "Beaming Doppler",
            summary:
              "Calcula el factor de corrimiento g = E_obs / E_em al intersectar el disco ecuatorial para beaming y redshift.",
            contract: "shadeDisk(r_hit, k_mu) -> RGBA(I_obs = g^4 * I_em)",
            invariant:
              "La emisión del disco delgado se trunca limpiamente dentro del radio ISCO según el espín.",
          },
        ],
      },
      {
        id: "timelike-orbit",
        label: "Órbitas Zoom-Whirl e Invariantes",
        badge: "G = c = 1 · Osciloscopios",
        description:
          "El motor numérico integra trayectorias de partículas masivas y valida invariantes físicos en tiempo real.",
        nodes: [
          {
            id: "observer-init",
            layer: "Datos Iniciales",
            title: "Constantes Conservadas",
            tech: "Energía E · Momento L_z",
            telemetry: "Normalización Exacta",
            summary:
              "Convierte parámetros de impacto y espín en condiciones iniciales consistentes de cuadrivelocidad.",
            contract: "initParticle(r0, E, L_z, a) -> u^mu(0) (u.u = -1)",
            invariant:
              "Toda trayectoria parte verificando la norma temporal g_mu_nu u^mu u^nu = -1.",
          },
          {
            id: "veff-potential",
            layer: "Análisis Potencial",
            title: "Potencial Efectivo V_eff(r)",
            tech: "Puntos de Retorno",
            telemetry: "Gráfico en Vivo",
            summary:
              "Calcula pozos de potencial relativista para clasificar órbitas de caída, ISCO circular, precesión y zoom-whirl.",
            contract: "evalVeff(r, E, L_z, a) -> BarrierProfile",
            invariant:
              "Los puntos de retorno radiales invierten suavemente sin errores de raíz negativa.",
          },
          {
            id: "rk4-timelike",
            layer: "Integrador JS",
            title: "Solucionador Temporal RK4",
            tech: "Simpléctico / Tiempo Propio",
            telemetry: "Paso en tau",
            summary:
              "Integra la precesión absidal extrema y múltiples giros cercanos a la barrera orbital inestable.",
            contract:
              "integrateOrbit(state, dTau) -> Path + PhasePoint(r, p_r)",
            invariant:
              "Los pasos temporales acotados evitan inestabilidades cerca de singularidades de coordenadas en r_+.",
          },
          {
            id: "invariant-guard",
            layer: "Osciloscopio Guard",
            title: "Invariantes y Retrato de Fase",
            tech: "Kretschmann · (r, p_r)",
            telemetry: "Chequeo Continuo",
            summary:
              "Mide deriva de E, L_z y el escalar de Kretschmann junto al retrato simpléctico del espacio de fases.",
            contract: "checkInvariants(state) -> { dE, dLz, K_scalar }",
            invariant:
              "Los invariantes matemáticos actúan como pruebas unitarias continuas de estabilidad numérica.",
          },
        ],
      },
    ],
  },
  de: {
    "onelink-saas": [
      {
        id: "cache-hit",
        label: "Cache-Hit Hot-Path",
        badge: "Lesepfad · Async-Telemetrie",
        description:
          "Öffentliche Link-in-Bio-Profile werden aus dem Arbeitsspeicher ausgeliefert, während Klick-Telemetrie asynchron abläuft.",
        nodes: [
          {
            id: "edge-isr",
            layer: "Edge / SSR",
            title: "Next.js 16 Router",
            tech: "React 19 · ISR",
            telemetry: "Edge Cache Hit",
            summary:
              "Löst Creator-Slugs über Server Components auf und sendet nach der Hydratation einen nicht-blockierenden Beacon.",
            contract: "GET /:handle -> 200 ProfileSnapshot + POST /beacon",
            invariant:
              "Die Auslieferung öffentlicher Profile wird niemals durch Analyse-Schreibvorgänge verzögert.",
          },
          {
            id: "redis-cache",
            layer: "Cache-Schicht",
            title: "Redis 7 Cache-Aside",
            tech: "Redis Stack",
            telemetry: "Sub-ms Abruf",
            summary:
              "Liefert serialisierte Link-Strukturen direkt aus dem RAM aus, bevor relationale Abfragen ausgelöst werden.",
            contract: "HGETALL profile:{slug} -> CachedProfile | MISS",
            invariant:
              "Jede Profiländerung invalidiert gezielt den zugehörigen Redis-Schlüssel.",
          },
          {
            id: "bullmq-queue",
            layer: "Queue-Grenze",
            title: "BullMQ Worker",
            tech: "BullMQ · NestJS 12",
            telemetry: "Entkoppeltes I/O",
            summary:
              "Puffert Klick- und Audit-Ereignisse in Redis-Warteschlangen, um Lastspitzen ohne Tabellensperren abzufangen.",
            contract: "Queue.add('click.track', { linkId, uaHash, ts })",
            invariant:
              "Begrenzte Wiederholungen und Dead-Letter-Queues sichern Telemetrie bei Traffic-Spitzen.",
          },
          {
            id: "timescale-sink",
            layer: "Zeitreihen-DB",
            title: "TimescaleDB Hypertable",
            tech: "PostgreSQL 16 + Timescale",
            telemetry: "Chunk-Partitioniert",
            summary:
              "Speichert gebündelte Klicks in zeitpartitionierten Chunks, während Prisma das relationale Kernmodell pflegt.",
            contract: "INSERT INTO click_events (time, link_id, meta)",
            invariant:
              "Hypertable-Migrationen bleiben strikt von regulären Prisma-Modellen getrennt.",
          },
        ],
      },
      {
        id: "sentinel-guard",
        label: "Cache-Miss & Sentinel Guard",
        badge: "Schreibpfad · RBAC & Schutz",
        description:
          "Schreibvorgänge passieren die hexagonale NestJS-Architektur, RBAC-Regeln und die lexikalische Sentinel-AI-Prüfung.",
        nodes: [
          {
            id: "studio-ui",
            layer: "Creator-Client",
            title: "Dashboard App",
            tech: "Next.js 16 · OpenAPI",
            telemetry: "Typisiertes DTO",
            summary:
              "Übermittelt Link-Aktualisierungen über streng typisierte OpenAPI-3.0-Schnittstellen.",
            contract: "PATCH /v1/links/:id { url, title, tenantId }",
            invariant:
              "Mandantentrennung und Schemagrenzen werden an jeder API-Grenze geprüft.",
          },
          {
            id: "nestjs-hex",
            layer: "Anwendungsgrenze",
            title: "NestJS 12 Kern",
            tech: "SWC (~70ms) · RBAC",
            telemetry: "5-Stufen-RBAC",
            summary:
              "Erzwingt hierarchische Rollenrechte (Owner bis Viewer) innerhalb sauberer hexagonaler Ports.",
            contract: "Guard(role >= EDITOR, tenantMatch) -> Command",
            invariant:
              "Domänenlogik bleibt unabhängig von HTTP-Adaptern und ORM-Details.",
          },
          {
            id: "sentinel-ai",
            layer: "Sicherheits-Gate",
            title: "Sentinel AI Scanner",
            tech: "Lexikalischer Schutz",
            telemetry: "< 25 ms Scan",
            summary:
              "Prüft Ziel-URLs und Metadaten vor der Speicherung auf Phishing-Muster und unsichere Weiterleitungen.",
            contract: "inspectPayload(url, meta) -> ALLOW | FLAG | BLOCK",
            invariant:
              "Blockierte Eingaben brechen den Commit ab und erzeugen einen unveränderlichen Audit-Eintrag.",
          },
          {
            id: "pg-writeback",
            layer: "Persistenz",
            title: "PostgreSQL + Cache-Sync",
            tech: "Prisma 6 · Redis 7",
            telemetry: "ACID + Evict",
            summary:
              "Speichert relationale Änderungen via Prisma 6 und entfernt den veralteten Redis-Cache-Eintrag.",
            contract: "COMMIT link_tx -> DEL profile:{slug}",
            invariant:
              "Cache-Invalidierung erfolgt nach erfolgreichem Commit zur Vermeidung veralteter Lesezugriffe.",
          },
        ],
      },
    ],
    fluenttube: [
      {
        id: "offline-pipeline",
        label: "Lokale Medien- & ASR-Pipeline",
        badge: "100% Offline · Checkpoints",
        description:
          "Lokale MP4/WebM-Importe führen Medienanalyse, Whisper-Transkription und SQLite-Speicherung vollständig lokal aus.",
        nodes: [
          {
            id: "react-import",
            layer: "Lokale UI",
            title: "React 19 Studio",
            tech: "TanStack Query · Zustand",
            telemetry: "Nur Lokale Datei",
            summary:
              "Startet den Import direkt von der Festplatte, ohne Mediendateien auf externe Server hochzuladen.",
            contract: "POST /imports/local { filePath, originalName }",
            invariant:
              "Originaldateien bleiben unangetastet; fragmentierte MP4s nutzen einen lokalen Cache ohne Neukodierung.",
          },
          {
            id: "ffmpeg-probe",
            layer: "Worker-Grenze",
            title: "FastAPI + FFmpeg",
            tech: "Begrenzte Queue · ffprobe",
            telemetry: "Kontrollierte Last",
            summary:
              "Analysiert Streams über ffprobe und extrahiert 16-kHz-Audiosegmente über eine begrenzte Warteschlange.",
            contract: "probeMedia(file) -> AudioWaveChunks[]",
            invariant:
              "Begrenzte Worker-Parallelität schützt CPU und RAM auf lokalen Rechnern.",
          },
          {
            id: "whisper-asr",
            layer: "Spracherkennung",
            title: "Faster-Whisper Checkpoints",
            tech: "CPU / Optional CUDA",
            telemetry: "5-Min-Sicherung",
            summary:
              "Transkribiert lokal und sichert abgeschlossene Fünf-Minuten-Abschnitte für unterbrechungsfreie Fortsetzung.",
            contract: "transcribeSegment(chunk) -> TimedSentences[]",
            invariant:
              "Gesicherte Checkpoints überstehen Neustarts ohne doppelte Transkription.",
          },
          {
            id: "sqlite-wal",
            layer: "Lokaler Speicher",
            title: "SQLite WAL + IPA-Lexikon",
            tech: "SQLite WAL · 67k IPA",
            telemetry: "Lokales ACID",
            summary:
              "Speichert Satzsegmente samt mitgeliefertem britischem IPA-Wortschatz (67.000+) und WordNet-Daten lokal.",
            contract: "TX -> INSERT sentences + SELECT ipa_lexicon",
            invariant:
              "Fremdschlüssel und WAL schützen die Mediathek getrennt von Browser-Entwürfen.",
          },
        ],
      },
      {
        id: "practice-loop",
        label: "Diktat & Optionaler Tutor",
        badge: "Local-First · Explizites Opt-In",
        description:
          "Listen → Write → Speak nutzt lokale Wörterbücher; Text verlässt das Gerät nur beim optionalen Cloud-Tutor.",
        nodes: [
          {
            id: "player-sync",
            layer: "Übungs-UI",
            title: "Listen → Write → Speak",
            tech: "Zustand · Video-Player",
            telemetry: "Kein Netzwerk",
            summary:
              "Wiederholt gewählte Sätze flexibel im Loop und synchronisiert den Übungsfokus.",
            contract: "selectSentence(id, loopRange) -> ActivePrompt",
            invariant:
              "Flüchtige Eingabeentwürfe bleiben von abgeschlossenen SQLite-Meilensteinen getrennt.",
          },
          {
            id: "dictation-scorer",
            layer: "Auswertungskern",
            title: "FastAPI Auswertung",
            tech: "Token-Prüfung · Tonhöhe",
            telemetry: "Deterministisch",
            summary:
              "Prüft Wörter inklusive Kontraktionen in Reihenfolge und zeigt experimentelle Intonationsverläufe.",
            contract: "scoreDictation(input, target) -> TokenDiff + Hints",
            invariant:
              "Sprach-Feedback ist klar als experimentell gekennzeichnet und ersetzt keine Phonembewertung.",
          },
          {
            id: "bundled-lexicon",
            layer: "Offline-Referenz",
            title: "Britisches IPA & WordNet",
            tech: "Gebündelte Assets",
            telemetry: "Sofortabruf",
            summary:
              "Liefert britische IPA-Varianten, Wortarten und Kontextbeispiele ohne laufende Internetverbindung.",
            contract: "lookupWord(token, context) -> IPAVariants + Gloss",
            invariant:
              "Fehlende Einträge im endlichen Lexikon werden sauber abgefangen.",
          },
          {
            id: "cloud-tutor",
            layer: "Opt-In-Grenze",
            title: "Cloud-Tutor-Gateway",
            tech: "Konfigurierter Anbieter",
            telemetry: "Nur Text Opt-In",
            summary:
              "Überträgt nur den gewählten Satz, wenn ausdrücklich Übersetzungen oder Connected-Speech-Tipps angefordert werden.",
            contract: "explainSentence(text, apiKey) -> SpanishNote + Tips",
            invariant:
              "Lokales Üben, Diktat und Wörterbuch benötigen keinerlei API-Schlüssel.",
          },
        ],
      },
    ],
    "crowdsafe-physics": [
      {
        id: "realtime-ws",
        label: "Echtzeit-WebSocket-Stream",
        badge: "60 FPS · HFV-Modell",
        description:
          "Szenariogeometrien speisen die Social-Force-Engine und streamen Zustandsbilder live über WebSockets.",
        nodes: [
          {
            id: "scenario-editor",
            layer: "Szenario-UI",
            title: "Geometrie-Editor",
            tech: "Wände · Säulen · Ausgänge",
            telemetry: "Deklaratives JSON",
            summary:
              "Definiert Ausgänge, Leitpfeiler, Wände und Agenten-Zonen entkoppelt vom numerischen Löser.",
            contract: "ScenarioSpec { walls[], exits[], spawns[], seed }",
            invariant:
              "Editor-Datenstrukturen bleiben strikt getrennt von der physikalischen Integration.",
          },
          {
            id: "fastapi-ws",
            layer: "Netzwerkbrücke",
            title: "FastAPI + Uvicorn WS",
            tech: "FastAPI WebSockets",
            telemetry: "Bidirektional",
            summary:
              "Überträgt Steuerbefehle und kompakte Frame-Pakete an das Visualisierungs-Frontend.",
            contract: "WS /ws/sim -> FramePacket { positions, velocities }",
            invariant:
              "Protokoll-Serialisierung beeinflusst niemals die numerische Deterministik.",
          },
          {
            id: "hfv-kernel",
            layer: "Physik-Engine",
            title: "HFV Social-Force-Kern",
            tech: "NumPy · Python",
            telemetry: "O(N^2) Kontakt",
            summary:
              "Berechnet Wunschbewegung, soziale Abstoßung sowie elastische und Reibungskräfte beim Körperkontakt.",
            contract:
              "stepHFV(state, dt) -> Forces(social + elastic + friction)",
            invariant:
              "Konstante Zeitschritte dt verhindern Durchdringung bei hoher Gedrängedichte.",
          },
          {
            id: "telemetry-frame",
            layer: "Metrik-Ansicht",
            title: "Engpass-Telemetrie",
            tech: "Dichte · Bogenbildung",
            telemetry: "Frame-Metriken",
            summary:
              "Misst Durchflussraten, Staupunkte an Ausgängen und den Faster-is-Slower-Effekt pro Zeitschritt.",
            contract:
              "extractMetrics(frame) -> { flowRate, archCount, maxForce }",
            invariant:
              "Telemetrie bleibt im Live-Modus und CLI-Batch-Lauf bit-identisch.",
          },
        ],
      },
      {
        id: "hermes-ab",
        label: "A/B-Sweep & HERMES-Suite",
        badge: "Fixierter Seed · Empirisch",
        description:
          "Kontrollierte Experimente fixieren Zufallssamen über Varianten hinweg und prüfen Kurven gegen HERMES-Daten.",
        nodes: [
          {
            id: "ab-seed",
            layer: "Versuchsplan",
            title: "Common-Seed-Konfig",
            tech: "Kontrollierter PRNG",
            telemetry: "Reproduzierbar",
            summary:
              "Hält Startpositionen, Körperradien und Zielgeschwindigkeiten zwischen Variante A und B identisch.",
            contract: "ExperimentPair(baseConfig, deltaGeometry, seed)",
            invariant:
              "Durchflussunterschiede messen rein bauliche Geometrie statt Startrauschen.",
          },
          {
            id: "sweep-runner",
            layer: "CLI-Steuerung",
            title: "Parameter-Sweep-Engine",
            tech: "Python CLI · Sensitivität",
            telemetry: "Headless Batch",
            summary:
              "Variiert Eile-Parameter v_0, Säulenabstände und Türbreiten systematisch in reproduzierbaren Läufen.",
            contract: "runSweep(paramGrid, seed) -> RunArtifacts[]",
            invariant:
              "Jeder Lauf protokolliert seinen Konfigurations-Hash zusammen mit den Ergebnissen.",
          },
          {
            id: "contact-solver",
            layer: "Integrator",
            title: "Reiner HFV-Löser",
            tech: "NumPy Vektorisiert",
            telemetry: "UI-Unabhängig",
            summary:
              "Führt exakt dieselbe Kontakt- und Reibungsphysik ohne WebSocket- oder Browser-Abhängigkeit aus.",
            contract: "simulateUntilEvacuated(spec) -> TrajectoryLog",
            invariant:
              "Der Rechenkern enthält keinerlei Verweise auf die Präsentationsschicht.",
          },
          {
            id: "hermes-val",
            layer: "Verifikation",
            title: "HERMES Validierung",
            tech: "Empirischer Datensatz",
            telemetry: "Benchmark-Abgleich",
            summary:
              "Vergleicht Fundamentaldiagramme (Dichte vs. Fluss) mit realen HERMES-Evakuierungsstudien.",
            contract: "validateHERMES(logs, dataset) -> ResidualReport",
            invariant:
              "Sicherheitsaussagen stützen sich auf kalibrierte empirische Toleranzbänder.",
          },
        ],
      },
    ],
    "kerr-spacetime-workstation": [
      {
        id: "null-geodesic",
        label: "Relativistisches Ray-Marching",
        badge: "WebGL 2.0 · GLSL Shader",
        description:
          "Fragment-Shader integrieren Nullgeodäten rückwärts vom Beobachter durch die gekrümmte Kerr-Raumzeit.",
        nodes: [
          {
            id: "observer-cam",
            layer: "Beobachterrahmen",
            title: "Three.js r160 Kamera",
            tech: "Three.js · Spin a/M",
            telemetry: "60 FPS Viewport",
            summary:
              "Übergibt Inklination theta_0, Spin a/M und Sichtstrahlen in geometrischen Einheiten (G = c = 1).",
            contract:
              "uniforms { a, r_obs, theta_obs } -> ScreenRay(alpha, beta)",
            invariant:
              "Der Spin bleibt sub-extremal (|a| < M), um nackte Singularitäten auszuschließen.",
          },
          {
            id: "boyer-lindquist",
            layer: "Metrik-Tensor",
            title: "Boyer-Lindquist-Kernel",
            tech: "GLSL · g_mu_nu(r, theta)",
            telemetry: "Exakter Tensor",
            summary:
              "Berechnet Frame-Dragging-Terme g_t_phi sowie die Horizontfunktionen Delta und Sigma an jedem Schritt.",
            contract:
              "metricKerr(r, theta, a) -> { g_tt, g_tphi, g_rr, g_thth }",
            invariant:
              "Die Strahlverfolgung stoppt sauber am äußeren Ereignishorizont r_+.",
          },
          {
            id: "rk4-null",
            layer: "GPU-Integrator",
            title: "RK4 Nullgeodäten",
            tech: "Runge-Kutta 4. Ordnung",
            telemetry: "Adaptiver Schritt",
            summary:
              "Integriert Photonenimpulse durch stark gekrümmte Photonensphären und Linsenbögen.",
            contract: "rk4Step(x^mu, k_mu, dLambda) -> NextPhotonState",
            invariant:
              "Carter-Konstante Q und Null-Bedingung k_mu k^mu = 0 überwachen numerische Drift.",
          },
          {
            id: "novikov-thorne",
            layer: "Strahlungstransport",
            title: "Novikov-Thorne-Scheibe",
            tech: "Liouville I_obs = g^4 I_em",
            telemetry: "Doppler-Beaming",
            summary:
              "Wertet den Frequenzverschiebungsfaktor g = E_obs / E_em am Scheibenschnittpunkt für Beaming und Rotverschiebung aus.",
            contract: "shadeDisk(r_hit, k_mu) -> RGBA(I_obs = g^4 * I_em)",
            invariant:
              "Strahlung endet konsistent innerhalb des spinabhängigen ISCO-Radius.",
          },
        ],
      },
      {
        id: "timelike-orbit",
        label: "Zoom-Whirl & Invarianten",
        badge: "G = c = 1 · Oszilloskope",
        description:
          "Browser-Integrator verfolgt massebehaftete Orbits und überwacht Erhaltungsgrößen live im Phasenraum.",
        nodes: [
          {
            id: "observer-init",
            layer: "Anfangsdaten",
            title: "Erhaltungsgrößen",
            tech: "Energie E · Drehimpuls L_z",
            telemetry: "Normierter Zustand",
            summary:
              "Übersetzt Stoßparameter und Spin in eine konsistente Vierergeschwindigkeit.",
            contract: "initParticle(r0, E, L_z, a) -> u^mu(0) (u.u = -1)",
            invariant:
              "Jeder Startzustand erfüllt die zeitartige Normierung g_mu_nu u^mu u^nu = -1.",
          },
          {
            id: "veff-potential",
            layer: "Potentialanalyse",
            title: "Effektives Potential V_eff(r)",
            tech: "Umkehrpunkte",
            telemetry: "Live-Diagramm",
            summary:
              "Ermittelt Potentialbarrieren für Einfang-, ISCO-, Präzessions- und Zoom-Whirl-Orbits.",
            contract: "evalVeff(r, E, L_z, a) -> BarrierProfile",
            invariant:
              "Radiale Umkehrpunkte kehren sauber ohne imaginäre Wurzelfehler um.",
          },
          {
            id: "rk4-timelike",
            layer: "JS-Integrator",
            title: "Zeitartiger RK4-Löser",
            tech: "Eigenzeit tau · Präzession",
            telemetry: "Schritt in tau",
            summary:
              "Integriert Apsidendrehung und enge Umläufe nahe der instabilen Potentialbarriere.",
            contract:
              "integrateOrbit(state, dTau) -> Path + PhasePoint(r, p_r)",
            invariant:
              "Schrittbegrenzungen schützen vor Koordinatensingularitäten nahe r_+.",
          },
          {
            id: "invariant-guard",
            layer: "Diagnose-Schutz",
            title: "Invarianten & Phasenporträt",
            tech: "Kretschmann · (r, p_r)",
            telemetry: "Dauerprüfung",
            summary:
              "Überwacht E, L_z und den Kretschmann-Skalar parallel zum symplektischen Phasenporträt.",
            contract: "checkInvariants(state) -> { dE, dLz, K_scalar }",
            invariant:
              "Physikalische Invarianten dienen als fortlaufende Integritätstests der Simulation.",
          },
        ],
      },
    ],
  },
  ru: {
    "onelink-saas": [
      {
        id: "cache-hit",
        label: "Быстрый путь Cache-Hit",
        badge: "Чтение · Асинхронная телеметрия",
        description:
          "Публичная выдача профилей обходит реляционную БД на горячем пути, а аналитика кликов обрабатывается в фоне.",
        nodes: [
          {
            id: "edge-isr",
            layer: "Edge / SSR",
            title: "Next.js 16 Роутер",
            tech: "React 19 · ISR",
            telemetry: "Edge-Кэш",
            summary:
              "Разрешает адрес автора через Server Components и отправляет неблокирующий beacon после гидратации.",
            contract: "GET /:handle -> 200 ProfileSnapshot + POST /beacon",
            invariant:
              "Отдача публичного профиля никогда не блокируется записью аналитики в БД.",
          },
          {
            id: "redis-cache",
            layer: "Слой Кэша",
            title: "Redis 7 Cache-Aside",
            tech: "Redis Stack",
            telemetry: "Суб-мс Отклик",
            summary:
              "Возвращает дерево ссылок и настройки темы напрямую из памяти до обращения к Prisma.",
            contract: "HGETALL profile:{slug} -> CachedProfile | MISS",
            invariant:
              "Каждое изменение профиля в кабинете инвалидирует или обновляет ключ Redis.",
          },
          {
            id: "bullmq-queue",
            layer: "Граница Очереди",
            title: "Воркер BullMQ",
            tech: "BullMQ · NestJS 12",
            telemetry: "Асинхронный I/O",
            summary:
              "Буферизует события кликов и аудита в очередях Redis, сглаживая всплески трафика без блокировок таблиц.",
            contract: "Queue.add('click.track', { linkId, uaHash, ts })",
            invariant:
              "Ограниченные повторы и очередь сбоев сохраняют телеметрию при пиках нагрузки.",
          },
          {
            id: "timescale-sink",
            layer: "Временные Ряды",
            title: "TimescaleDB Hypertable",
            tech: "PostgreSQL 16 + Timescale",
            telemetry: "Секционирование",
            summary:
              "Записывает батчи кликов в секционированные чанки времени, пока Prisma управляет основной схемой.",
            contract: "INSERT INTO click_events (time, link_id, meta)",
            invariant:
              "Миграции гипертаблиц изолированы от транзакционных моделей Prisma.",
          },
        ],
      },
      {
        id: "sentinel-guard",
        label: "Cache-Miss и Sentinel AI",
        badge: "Запись · RBAC и Защита",
        description:
          "Изменения профиля проходят гексагональную архитектуру NestJS, ролевой контроль RBAC и сканер Sentinel AI.",
        nodes: [
          {
            id: "studio-ui",
            layer: "Клиент Автора",
            title: "Кабинет Управления",
            tech: "Next.js 16 · OpenAPI",
            telemetry: "Строгий DTO",
            summary:
              "Отправляет обновления ссылок и политик по строго типизированным контрактам OpenAPI 3.0.",
            contract: "PATCH /v1/links/:id { url, title, tenantId }",
            invariant:
              "Изоляция арендаторов и границы схемы проверяются на каждом рубеже API.",
          },
          {
            id: "nestjs-hex",
            layer: "Ядро Приложения",
            title: "NestJS 12 Core",
            tech: "SWC (~70ms) · RBAC",
            telemetry: "5 Уровней RBAC",
            summary:
              "Применяет иерархию прав (Owner > Admin > Safety > Editor > Viewer) на границе гексагональных портов.",
            contract: "Guard(role >= EDITOR, tenantMatch) -> Command",
            invariant:
              "Бизнес-логика не зависит от транспортного протокола и реализации ORM.",
          },
          {
            id: "sentinel-ai",
            layer: "Контур Защиты",
            title: "Сканер Sentinel AI",
            tech: "Лексический Анализ",
            telemetry: "Проверка < 25 мс",
            summary:
              "Проверяет целевые URL и метаданные на фишинг и вредоносные редиректы до фиксации в базе.",
            contract: "inspectPayload(url, meta) -> ALLOW | FLAG | BLOCK",
            invariant:
              "Заблокированный ввод отменяет транзакцию и записывает неизменяемый журнал аудита.",
          },
          {
            id: "pg-writeback",
            layer: "Персистентность",
            title: "PostgreSQL + Сброс Кэша",
            tech: "Prisma 6 · Redis 7",
            telemetry: "ACID + Evict",
            summary:
              "Фиксирует изменения через Prisma 6 и очищает соответствующий ключ кэша в Redis.",
            contract: "COMMIT link_tx -> DEL profile:{slug}",
            invariant:
              "Сброс кэша выполняется после коммита, исключая чтение устаревших данных.",
          },
        ],
      },
    ],
    fluenttube: [
      {
        id: "offline-pipeline",
        label: "Локальный Медиа- и ASR-конвейер",
        badge: "100% Офлайн · Чекпоинты",
        description:
          "Импорт локальных MP4/WebM выполняет анализ потока, транскрипцию Whisper по частям и запись в SQLite локально.",
        nodes: [
          {
            id: "react-import",
            layer: "Локальный UI",
            title: "Студия React 19",
            tech: "TanStack Query · Zustand",
            telemetry: "Локальный Файл",
            summary:
              "Открывает локальный MP4/WebM с диска и запускает обработку без загрузки видео на внешние серверы.",
            contract: "POST /imports/local { filePath, originalName }",
            invariant:
              "Исходный файл сохраняется неизменным; фрагментированный MP4 кэшируется без перекодирования.",
          },
          {
            id: "ffmpeg-probe",
            layer: "Граница Воркера",
            title: "FastAPI + FFmpeg",
            tech: "Очередь · ffprobe",
            telemetry: "Безопасный Поток",
            summary:
              "Проверяет потоки через ffprobe и извлекает аудиодорожки 16 кГц в ограниченной фоновой очереди.",
            contract: "probeMedia(file) -> AudioWaveChunks[]",
            invariant:
              "Ограничение параллелизма воркеров защищает CPU и память компьютера.",
          },
          {
            id: "whisper-asr",
            layer: "Движок Речи",
            title: "Чекпоинты Faster-Whisper",
            tech: "CPU / Опция CUDA",
            telemetry: "Сохранение 5 Мин",
            summary:
              "Локально транскрибирует речь и сохраняет чекпоинты каждые 5 минут для возобновления длинных видео.",
            contract: "transcribeSegment(chunk) -> TimedSentences[]",
            invariant:
              "Готовые пятиминутные фрагменты переживают перезапуск без повторной обработки.",
          },
          {
            id: "sqlite-wal",
            layer: "Локальная БД",
            title: "SQLite WAL + База IPA",
            tech: "SQLite WAL · 67k IPA",
            telemetry: "Локальный ACID",
            summary:
              "Хранит выровненные фразы и встроенный британский словарь IPA (67 000+ слов) с базой WordNet.",
            contract: "TX -> INSERT sentences + SELECT ipa_lexicon",
            invariant:
              "Внешние ключи и WAL отделяют надежное хранилище библиотеки от черновиков браузера.",
          },
        ],
      },
      {
        id: "practice-loop",
        label: "Диктант и Опциональный Тьютор",
        badge: "Local-First · Явный Выбор",
        description:
          "Listen → Write → Speak работает со встроенными словарями; текст уходит в сеть только при вызове облачного тьютора.",
        nodes: [
          {
            id: "player-sync",
            layer: "UI Практики",
            title: "Listen → Write → Speak",
            tech: "Zustand · Плеер",
            telemetry: "Без Сети",
            summary:
              "Зацикливает целевые фразы на настраиваемой скорости и синхронизирует активный курсор.",
            contract: "selectSentence(id, loopRange) -> ActivePrompt",
            invariant:
              "Временные черновики ввода не смешиваются с зафиксированным прогрессом SQLite.",
          },
          {
            id: "dictation-scorer",
            layer: "Ядро Оценки",
            title: "Проверяющий Модуль FastAPI",
            tech: "Токены · Контур Тона",
            telemetry: "Детерминированно",
            summary:
              "Проверяет слова диктанта по порядку (включая сокращения и дефисы) и строит экспериментальный тон.",
            contract: "scoreDictation(input, target) -> TokenDiff + Hints",
            invariant:
              "Анализ речи помечен как экспериментальный и не сертифицирует акцент или отдельные фонемы.",
          },
          {
            id: "bundled-lexicon",
            layer: "Офлайн-Словарь",
            title: "Британский IPA и WordNet",
            tech: "Встроенные Данные",
            telemetry: "Мгновенный Поиск",
            summary:
              "Предоставляет британскую транскрипцию IPA, части речи, значения и альтернативные чтения без сети.",
            contract: "lookupWord(token, context) -> IPAVariants + Gloss",
            invariant:
              "Отсутствующие слова корректно обрабатываются без обращения к внешним серверам.",
          },
          {
            id: "cloud-tutor",
            layer: "Опция Облака",
            title: "Шлюз Облачного Тьютора",
            tech: "Провайдер по Настройке",
            telemetry: "Только Текст",
            summary:
              "Отправляет выбранное предложение лишь при явном запросе перевода или разбора связной речи.",
            contract: "explainSentence(text, apiKey) -> SpanishNote + Tips",
            invariant:
              "Основной цикл импорта, диктанта и словаря не требует API-ключей.",
          },
        ],
      },
    ],
    "crowdsafe-physics": [
      {
        id: "realtime-ws",
        label: "Поток WebSocket Реального Времени",
        badge: "60 FPS · Модель HFV",
        description:
          "Геометрия препятствий и выходов поступает в физическое ядро социальных сил и транслируется по WebSocket.",
        nodes: [
          {
            id: "scenario-editor",
            layer: "UI Редактора",
            title: "Редактор Геометрии Сцен",
            tech: "Стены · Колонны · Выходы",
            telemetry: "Декларативный JSON",
            summary:
              "Задает ширину дверей, отбойные колонны, стены и зоны появления агентов независимо от решателя.",
            contract: "ScenarioSpec { walls[], exits[], spawns[], seed }",
            invariant:
              "Спецификация сцены строго отделена от мутируемого состояния физического интегратора.",
          },
          {
            id: "fastapi-ws",
            layer: "Сетевой Мост",
            title: "FastAPI + Uvicorn WS",
            tech: "FastAPI WebSockets",
            telemetry: "Двусторонний Канал",
            summary:
              "Принимает команды управления (пауза, шаг) и транслирует компактные пакеты кадров на клиент.",
            contract: "WS /ws/sim -> FramePacket { positions, velocities }",
            invariant:
              "Сетевая сериализация не вмешивается в детерминизм расчетов с плавающей точкой.",
          },
          {
            id: "hfv-kernel",
            layer: "Физический Движок",
            title: "Ядро Социальных Сил HFV",
            tech: "NumPy · Python",
            telemetry: "O(N^2) Контакт",
            summary:
              "Интегрирует целевое движение, социальное отталкивание, упругость тел и силу трения в толпе.",
            contract:
              "stepHFV(state, dt) -> Forces(social + elastic + friction)",
            invariant:
              "Фиксированный шаг dt предотвращает туннелирование агентов через стены при сжатии.",
          },
          {
            id: "telemetry-frame",
            layer: "Метрики",
            title: "Телеметрия Узких Мест",
            tech: "Плотность · Арки Затора",
            telemetry: "Срез Кадра",
            summary:
              "Измеряет пропускную способность выходов, образование арок затора и давление контакта.",
            contract:
              "extractMetrics(frame) -> { flowRate, archCount, maxForce }",
            invariant:
              "Метрики идентичны как при потоковом WebSocket-рендере, так и в автономном CLI.",
          },
        ],
      },
      {
        id: "hermes-ab",
        label: "A/B Сравнение и HERMES",
        badge: "Общий Seed · Валидация",
        description:
          "Контролируемые серии фиксируют генератор случайных чисел и сверяют кривые с эталоном HERMES.",
        nodes: [
          {
            id: "ab-seed",
            layer: "План Эксперимента",
            title: "Конфиг Common-Seed",
            tech: "Фиксированный PRNG",
            telemetry: "Воспроизводимость",
            summary:
              "Фиксирует начальные позиции, радиусы тел и целевые скорости для обоих вариантов планировки.",
            contract: "ExperimentPair(baseConfig, deltaGeometry, seed)",
            invariant:
              "Различия эвакуации отражают только геометрию, исключая случайный шум спавна.",
          },
          {
            id: "sweep-runner",
            layer: "Оркестратор CLI",
            title: "Движок Перебора Параметров",
            tech: "Python CLI · Чувствительность",
            telemetry: "Пакетный Режим",
            summary:
              "Систематически варьирует скорость спешки v_0, позиции колонн и ширину выходов.",
            contract: "runSweep(paramGrid, seed) -> RunArtifacts[]",
            invariant:
              "Каждый прогон сохраняет хэш конфигурации вместе с временными рядами.",
          },
          {
            id: "contact-solver",
            layer: "Интегратор",
            title: "Детерминированный HFV Решатель",
            tech: "Векторный NumPy",
            telemetry: "Изолированное Ядро",
            summary:
              "Выполняет те же уравнения контакта и трения без зависимостей от веб-слоя и UI.",
            contract: "simulateUntilEvacuated(spec) -> TrajectoryLog",
            invariant:
              "Ядро симуляции полностью изолировано от транспортного слоя и интерфейса.",
          },
          {
            id: "hermes-val",
            layer: "Верификация",
            title: "Валидация по HERMES",
            tech: "Эталонный Датасет",
            telemetry: "Сверка Диаграмм",
            summary:
              "Сопоставляет фундаментальные диаграммы поток-плотность с натурными испытаниями HERMES.",
            contract: "validateHERMES(logs, dataset) -> ResidualReport",
            invariant:
              "Выводы безопасности опираются на калиброванные эмпирические допуски.",
          },
        ],
      },
    ],
    "kerr-spacetime-workstation": [
      {
        id: "null-geodesic",
        label: "Релятивистский Ray-Marching",
        badge: "WebGL 2.0 · Шейдеры GLSL",
        description:
          "Фрагментные шейдеры интегрируют светоподобные геодезические назад от камеры сквозь метрику Керра.",
        nodes: [
          {
            id: "observer-cam",
            layer: "Система Наблюдателя",
            title: "Камера Three.js r160",
            tech: "Three.js · Спин a/M",
            telemetry: "60 FPS Экран",
            summary:
              "Передает наклон theta_0, безразмерный спин a/M и лучи зрения в геометрических единицах (G = c = 1).",
            contract:
              "uniforms { a, r_obs, theta_obs } -> ScreenRay(alpha, beta)",
            invariant:
              "Спин ограничен условием |a| < M во избежание артефактов голой сингулярности.",
          },
          {
            id: "boyer-lindquist",
            layer: "Тензор Метрики",
            title: "Ядро Бойера-Линдквиста",
            tech: "GLSL · g_mu_nu(r, theta)",
            telemetry: "Точный Тензор",
            summary:
              "Вычисляет увлечение инерциальных систем g_t_phi и функции горизонта Delta и Sigma.",
            contract:
              "metricKerr(r, theta, a) -> { g_tt, g_tphi, g_rr, g_thth }",
            invariant:
              "Трассировка луча корректно завершается на внешнем горизонте событий r_+.",
          },
          {
            id: "rk4-null",
            layer: "GPU-Интегратор",
            title: "Интегратор РК4",
            tech: "Рунге-Кутта 4-го Порядка",
            telemetry: "Адаптивный Шаг",
            summary:
              "Продвигает импульс фотона вблизи фотонной сферы, воспроизводя гравитационное линзирование.",
            contract: "rk4Step(x^mu, k_mu, dLambda) -> NextPhotonState",
            invariant:
              "Константа Картера Q и условие k_mu k^mu = 0 контролируют численный дрейф.",
          },
          {
            id: "novikov-thorne",
            layer: "Перенос Излучения",
            title: "Диск Новикова-Торна",
            tech: "Лиувилль I_obs = g^4 I_em",
            telemetry: "Эффект Доплера",
            summary:
              "Вычисляет фактор смещения частоты g = E_obs / E_em на экваториальном диске.",
            contract: "shadeDisk(r_hit, k_mu) -> RGBA(I_obs = g^4 * I_em)",
            invariant:
              "Излучение тонкого диска строго обрывается внутри радиуса ISCO.",
          },
        ],
      },
      {
        id: "timelike-orbit",
        label: "Орбиты Zoom-Whirl и Инварианты",
        badge: "G = c = 1 · Осциллографы",
        description:
          "Вычислитель в браузере интегрирует массивные траектории и контролирует законы сохранения.",
        nodes: [
          {
            id: "observer-init",
            layer: "Начальные Данные",
            title: "Сохраняемые Интегралы",
            tech: "Энергия E · Момент L_z",
            telemetry: "Точная Норма",
            summary:
              "Преобразует прицельные параметры и спин в согласованную 4-скорость частицы.",
            contract: "initParticle(r0, E, L_z, a) -> u^mu(0) (u.u = -1)",
            invariant:
              "Начальный вектор строго проверяет нормировку g_mu_nu u^mu u^nu = -1.",
          },
          {
            id: "veff-potential",
            layer: "Анализ Потенциала",
            title: "Эффективный Потенциал V_eff(r)",
            tech: "Точки Поворота",
            telemetry: "График в Реальном Времени",
            summary:
              "Строит потенциальные ямы для классификации захвата, ISCO, прецессии и zoom-whirl орбит.",
            contract: "evalVeff(r, E, L_z, a) -> BarrierProfile",
            invariant:
              "Точки поворота отражают движение без ошибок извлечения мнимого корня.",
          },
          {
            id: "rk4-timelike",
            layer: "JS-Интегратор",
            title: "Времяподобный Решатель РК4",
            tech: "Собственное Время tau",
            telemetry: "Шаг по tau",
            summary:
              "Отслеживает апсидальную прецессию и плотные витки вблизи неустойчивого барьера.",
            contract:
              "integrateOrbit(state, dTau) -> Path + PhasePoint(r, p_r)",
            invariant:
              "Ограничение шага защищает расчет от координатных сингулярностей у r_+.",
          },
          {
            id: "invariant-guard",
            layer: "Осциллограф Защиты",
            title: "Инварианты и Фазовый Портрет",
            tech: "Кречман · (r, p_r)",
            telemetry: "Непрерывный Тест",
            summary:
              "Контролирует дрейф E, L_z и скаляра Кречмана вместе с фазовым пространством.",
            contract: "checkInvariants(state) -> { dE, dLz, K_scalar }",
            invariant:
              "Математические инварианты работают как непрерывные юнит-тесты симуляции.",
          },
        ],
      },
    ],
  },
  ja: {
    "onelink-saas": [
      {
        id: "cache-hit",
        label: "キャッシュヒット高速経路",
        badge: "読取経路 · 非同期テレメトリ",
        description:
          "公開プロフィールの配信はリレーショナルDBをバイパスし、クリック計測は非同期キュー経由で記録します。",
        nodes: [
          {
            id: "edge-isr",
            layer: "Edge / SSR",
            title: "Next.js 16 ルーター",
            tech: "React 19 · ISR",
            telemetry: "Edge キャッシュ",
            summary:
              "Server Componentsでスラッグを解決し、ハイドレーション後に非ブロッキングのクリックビーコンを送信します。",
            contract: "GET /:handle -> 200 ProfileSnapshot + POST /beacon",
            invariant:
              "公開プロフィールの応答速度が分析DBへの書き込みによって遅延することはありません。",
          },
          {
            id: "redis-cache",
            layer: "キャッシュ層",
            title: "Redis 7 Cache-Aside",
            tech: "Redis Stack",
            telemetry: "サブミリ秒応答",
            summary:
              "シリアライズ済みのリンクツリーとテーマ設定をメモリから即座に返却します。",
            contract: "HGETALL profile:{slug} -> CachedProfile | MISS",
            invariant:
              "管理画面での変更時は対応するRedisキーを必ず無効化または更新します。",
          },
          {
            id: "bullmq-queue",
            layer: "キュー境界",
            title: "BullMQ ワーカー",
            tech: "BullMQ · NestJS 12",
            telemetry: "非同期 I/O",
            summary:
              "クリックと監査イベントをキューにバッファリングし、アクセス集中時でもDBロックを防ぎます。",
            contract: "Queue.add('click.track', { linkId, uaHash, ts })",
            invariant:
              "リトライ上限とデッドレターキューにより高負荷時のテレメトリ欠損を防ぎます。",
          },
          {
            id: "timescale-sink",
            layer: "時系列DB",
            title: "TimescaleDB ハイパーテーブル",
            tech: "PostgreSQL 16 + Timescale",
            telemetry: "自動チャンク分割",
            summary:
              "時間パーティション化されたチャンクへクリック履歴を追記し、Prismaはコア構造を管理します。",
            contract: "INSERT INTO click_events (time, link_id, meta)",
            invariant:
              "時系列マイグレーションはトランザクション用Prismaスキーマから分離されています。",
          },
        ],
      },
      {
        id: "sentinel-guard",
        label: "キャッシュミス & Sentinel監視",
        badge: "書込経路 · RBAC & セキュリティ",
        description:
          "更新操作はヘキサゴナルNestJS層、RBAC権限検証、Sentinel AI字句脅威スキャンを経由して永続化されます。",
        nodes: [
          {
            id: "studio-ui",
            layer: "管理クライアント",
            title: "ダッシュボードUI",
            tech: "Next.js 16 · OpenAPI",
            telemetry: "型安全 DTO",
            summary:
              "OpenAPI 3.0契約に基づく厳密な型定義DTOでリンク更新リクエストを送信します。",
            contract: "PATCH /v1/links/:id { url, title, tenantId }",
            invariant:
              "マルチテナント境界とスキーマ検証は全API入口で強制されます。",
          },
          {
            id: "nestjs-hex",
            layer: "アプリ境界",
            title: "NestJS 12 コア",
            tech: "SWC (~70ms) · RBAC",
            telemetry: "5段階権限",
            summary:
              "クリーン／ヘキサゴナルポート上で階層RBAC（OwnerからViewer）を検証します。",
            contract: "Guard(role >= EDITOR, tenantMatch) -> Command",
            invariant:
              "ドメインロジックはHTTPアダプタやORM詳細から完全に独立しています。",
          },
          {
            id: "sentinel-ai",
            layer: "防衛ゲート",
            title: "Sentinel AI スキャナ",
            tech: "字句脅威シールド",
            telemetry: "25ms未満検査",
            summary:
              "保存前に宛先URLとメタデータをスキャンし、フィッシングや不正リダイレクトを検知します。",
            contract: "inspectPayload(url, meta) -> ALLOW | FLAG | BLOCK",
            invariant:
              "ブロック時はトランザクションを中断し不変の監査ログを記録します。",
          },
          {
            id: "pg-writeback",
            layer: "永続化層",
            title: "PostgreSQL + キャッシュ同期",
            tech: "Prisma 6 · Redis 7",
            telemetry: "ACID + Evict",
            summary:
              "Prisma 6でリレーショナル更新を確定させた後、該当Redisキャッシュキーを破棄します。",
            contract: "COMMIT link_tx -> DEL profile:{slug}",
            invariant:
              "コミット確定後のキャッシュ破棄により古い情報の配信を防止します。",
          },
        ],
      },
    ],
    fluenttube: [
      {
        id: "offline-pipeline",
        label: "ローカルメディア・ASR処理",
        badge: "100% オフライン · 再開可能",
        description:
          "ローカルMP4/WebMの解析、Whisper文字起こし、SQLite保存まですべて端末内で完結します。",
        nodes: [
          {
            id: "react-import",
            layer: "ローカル UI",
            title: "React 19 スタジオ",
            tech: "TanStack Query · Zustand",
            telemetry: "ローカル限定",
            summary:
              "外部サーバーへ動画をアップロードせず、ローカルディスクから取り込みジョブを開始します。",
            contract: "POST /imports/local { filePath, originalName }",
            invariant:
              "元ファイルは変更せず、断片化MP4も再エンコードなしでローカルキャッシュ再生します。",
          },
          {
            id: "ffmpeg-probe",
            layer: "ワーカー境界",
            title: "FastAPI + FFmpeg",
            tech: "制御キュー · ffprobe",
            telemetry: "安全並列度",
            summary:
              "ffprobeでストリームを検証し、制限付きバックグラウンドキューで16kHz音声を抽出します。",
            contract: "probeMedia(file) -> AudioWaveChunks[]",
            invariant:
              "有界キュー設計によりローカルCPU/メモリ負荷を安定維持します。",
          },
          {
            id: "whisper-asr",
            layer: "音声認識エンジン",
            title: "Faster-Whisper チェックポイント",
            tech: "CPU / 任意 CUDA",
            telemetry: "5分単位復旧",
            summary:
              "ローカル推論で文字起こしを行い、5分ごとの完了地点を永続化して中断後の再開に対応します。",
            contract: "transcribeSegment(chunk) -> TimedSentences[]",
            invariant:
              "完了済みの5分チャンクは再起動後も再計算せず復元されます。",
          },
          {
            id: "sqlite-wal",
            layer: "ローカルストア",
            title: "SQLite WAL + 6.7万語IPA",
            tech: "SQLite WAL · WordNet",
            telemetry: "ローカル ACID",
            summary:
              "文データに加え、同梱のイギリス英語IPA辞書（67,000語以上）とWordNetを参照できます。",
            contract: "TX -> INSERT sentences + SELECT ipa_lexicon",
            invariant:
              "外部キーとWALによりライブラリデータとブラウザ下書きを明確に分離します。",
          },
        ],
      },
      {
        id: "practice-loop",
        label: "ディクテーション & 任意チューター",
        badge: "Local-First · 明示的オプトイン",
        description:
          "Listen → Write → Speakは内蔵辞書で動作し、テキストが外部に出るのは任意のクラウド機能使用時のみです。",
        nodes: [
          {
            id: "player-sync",
            layer: "演習 UI",
            title: "Listen → Write → Speak",
            tech: "Zustand · ローカル再生",
            telemetry: "通信ゼロ",
            summary:
              "対象文の区間ループと速度調整を同期し、入力状態と再生位置を保ちます。",
            contract: "selectSentence(id, loopRange) -> ActivePrompt",
            invariant:
              "ブラウザ上の入力下書きはSQLiteの永続ライブラリデータから分離されています。",
          },
          {
            id: "dictation-scorer",
            layer: "採点コア",
            title: "FastAPI スコアラー",
            tech: "語順整合 · ピッチ曲線",
            telemetry: "決定的判定",
            summary:
              "短縮形やハイフン語を含むディクテーションを語順通りに判定し、実験的ピッチ波形を表示します。",
            contract: "scoreDictation(input, target) -> TokenDiff + Hints",
            invariant:
              "スピーキング分析は実験的ガイドと明記され、音素単位の採点や発音認定は行いません。",
          },
          {
            id: "bundled-lexicon",
            layer: "オフライン辞書",
            title: "英国IPA & WordNet",
            tech: "同梱辞書データ",
            telemetry: "即時検索",
            summary:
              "インターネット接続なしで発音記号バリエーション、品詞、文脈用例を取得します。",
            contract: "lookupWord(token, context) -> IPAVariants + Gloss",
            invariant:
              "有限辞書に未登録の語でも実行時エラーを起こさず優雅にフォールバックします。",
          },
          {
            id: "cloud-tutor",
            layer: "任意境界",
            title: "クラウドチューター接続",
            tech: "設定プロバイダAPI",
            telemetry: "テキスト任意送信",
            summary:
              "ユーザーが翻訳や連結音解説を明示的に押した時のみ対象テキストを送信します。",
            contract: "explainSentence(text, apiKey) -> SpanishNote + Tips",
            invariant:
              "取り込み・再生・ディクテーション・辞書確認にAPIキーは一切不要です。",
          },
        ],
      },
    ],
    "crowdsafe-physics": [
      {
        id: "realtime-ws",
        label: "リアルタイムWebSocket配信",
        badge: "60 FPS · HFVモデル",
        description:
          "建築シナリオ形状が社会力物理カーネルへ渡され、WebSocket経由でフレームとテレメトリを連続配信します。",
        nodes: [
          {
            id: "scenario-editor",
            layer: "編集 UI",
            title: "シナリオ形状エディタ",
            tech: "壁 · 柱 · 出口定義",
            telemetry: "宣言的 JSON",
            summary:
              "出口幅、誘導柱、壁面、エージェント生成領域を物理計算から独立した定義として編集します。",
            contract: "ScenarioSpec { walls[], exits[], spawns[], seed }",
            invariant:
              "形状エディタの状態は数値積分器の可変ステートから厳密に分離されます。",
          },
          {
            id: "fastapi-ws",
            layer: "通信ブリッジ",
            title: "FastAPI + Uvicorn WS",
            tech: "FastAPI WebSockets",
            telemetry: "双方向ストリーム",
            summary:
              "停止・ステップ実行命令を受信し、圧縮された座標・速度フレームを描画クライアントへ配信します。",
            contract: "WS /ws/sim -> FramePacket { positions, velocities }",
            invariant:
              "ネットワークシリアライズが浮動小数点の物理再現性を損なうことはありません。",
          },
          {
            id: "hfv-kernel",
            layer: "物理エンジン",
            title: "HFV 社会力カーネル",
            tech: "NumPy · Python",
            telemetry: "O(N^2) 接触力学",
            summary:
              "目標推進力、心理的反発力、身体弾性力、接線摩擦力を統合しパニック群集の接触を解きます。",
            contract:
              "stepHFV(state, dt) -> Forces(social + elastic + friction)",
            invariant:
              "固定時間刻みdtにより高密度圧縮時の壁貫通（トンネリング）を防止します。",
          },
          {
            id: "telemetry-frame",
            layer: "計測ビュー",
            title: "ボトルネック・テレメトリ",
            tech: "閉塞アーチ · 流量",
            telemetry: "毎ステップ計測",
            summary:
              "出口流量、閉塞アーチ形成、Faster-is-Slower現象、局所圧力をステップ毎に記録します。",
            contract:
              "extractMetrics(frame) -> { flowRate, archCount, maxForce }",
            invariant:
              "ライブ描画でもCLIバッチ実行でも算出メトリクスは完全に一致します。",
          },
        ],
      },
      {
        id: "hermes-ab",
        label: "A/B比較 & HERMESベンチマーク",
        badge: "共通シード · 実証検証",
        description:
          "乱数シードを固定した制御実験で形状差を比較し、HERMES実測データセットと照合します。",
        nodes: [
          {
            id: "ab-seed",
            layer: "実験計画",
            title: "共通シード構成",
            tech: "制御 PRNG",
            telemetry: "完全再現",
            summary:
              "バリアントAとBの間で初期位置・体格半径・目標速度をビット単位で固定します。",
            contract: "ExperimentPair(baseConfig, deltaGeometry, seed)",
            invariant:
              "観測される避難時間差は確率ノイズではなく純粋に建築形状の差異を表します。",
          },
          {
            id: "sweep-runner",
            layer: "CLI制御",
            title: "パラメータスイープ",
            tech: "Python CLI · 感度分析",
            telemetry: "ヘッドレス実行",
            summary:
              "急ぎ速度v_0、柱配置、出口幅を再現可能なCLIスイープで一括評価します。",
            contract: "runSweep(paramGrid, seed) -> RunArtifacts[]",
            invariant: "各実行は構成ハッシュと時系列出力を対にして保存します。",
          },
          {
            id: "contact-solver",
            layer: "数値積分器",
            title: "純粋 HFV ソルバー",
            tech: "ベクトル化 NumPy",
            telemetry: "UI非依存",
            summary:
              "WebSocketやGUI層への依存ゼロで同一の接触・摩擦方程式を実行します。",
            contract: "simulateUntilEvacuated(spec) -> TrajectoryLog",
            invariant:
              "物理ソルバーはネットワーク層や表示層を一切参照しません。",
          },
          {
            id: "hermes-val",
            layer: "実証検証",
            title: "HERMES データ照合",
            tech: "実証ベンチマーク",
            telemetry: "基本図整合",
            summary:
              "密度-流量の基本図および避難曲線をHERMES実測ベンチマークと比較検証します。",
            contract: "validateHERMES(logs, dataset) -> ResidualReport",
            invariant:
              "定性的主張は較正済み実証バンド内での定量的整合によって裏付けられます。",
          },
        ],
      },
    ],
    "kerr-spacetime-workstation": [
      {
        id: "null-geodesic",
        label: "相対論的レイマーチング",
        badge: "WebGL 2.0 · GLSL シェーダー",
        description:
          "フラグメントシェーダーが観測者カメラからカー時空の曲がった幾何を通して光的測地線を逆積分します。",
        nodes: [
          {
            id: "observer-cam",
            layer: "観測者座標",
            title: "Three.js r160 カメラ",
            tech: "Three.js · スピン a/M",
            telemetry: "60 FPS 描画",
            summary:
              "観測傾斜角theta_0、無次元スピンa/M、視線方向を幾何学単位系（G = c = 1）で渡します。",
            contract:
              "uniforms { a, r_obs, theta_obs } -> ScreenRay(alpha, beta)",
            invariant:
              "裸の特異点を避けるためスピンは厳密に |a| < M にクランプされます。",
          },
          {
            id: "boyer-lindquist",
            layer: "計量テンソル",
            title: "ボイヤー・リンキスト核",
            tech: "GLSL · g_mu_nu(r, theta)",
            telemetry: "厳密テンソル",
            summary:
              "各積分ステップで慣性系引きずり項g_t_phiと地平面関数Delta, Sigmaを評価します。",
            contract:
              "metricKerr(r, theta, a) -> { g_tt, g_tphi, g_rr, g_thth }",
            invariant:
              "レイは外部事象の地平面r_+への接近時に安全に積分終了します。",
          },
          {
            id: "rk4-null",
            layer: "GPU 積分器",
            title: "4次 RK4 光的測地線",
            tech: "Runge-Kutta 4次",
            telemetry: "適応ステップ",
            summary:
              "光子球近傍や強い重力レンズ弧を通過する光子運動量を高精度に前進積分します。",
            contract: "rk4Step(x^mu, k_mu, dLambda) -> NextPhotonState",
            invariant:
              "カーター定数Qとヌル条件 k_mu k^mu = 0 が数値ドリフトを監視します。",
          },
          {
            id: "novikov-thorne",
            layer: "放射輸送",
            title: "ノビコフ・ソーン円盤",
            tech: "リウヴィル I_obs = g^4 I_em",
            telemetry: "ドップラー変調",
            summary:
              "赤道面降着円盤との交点で振動数比g = E_obs / E_emを求め、ビーミングと重力赤方偏移を描画します。",
            contract: "shadeDisk(r_hit, k_mu) -> RGBA(I_obs = g^4 * I_em)",
            invariant:
              "薄型降着円盤の放射はスピン依存ISCO半径の内側で厳密に停止します。",
          },
        ],
      },
      {
        id: "timelike-orbit",
        label: "ズームワール軌道 & 不変量",
        badge: "G = c = 1 · 診断オシロ",
        description:
          "ブラウザ上の数値積分器が質量粒子軌道を解き、位相空間と保存不変量をリアルタイム監視します。",
        nodes: [
          {
            id: "observer-init",
            layer: "初期値設定",
            title: "保存定数パラメータ",
            tech: "エネルギー E · 角運動量 L_z",
            telemetry: "厳密正規化",
            summary:
              "衝突パラメータとブラックホールスピンから整合的な4元速度初期値を構成します。",
            contract: "initParticle(r0, E, L_z, a) -> u^mu(0) (u.u = -1)",
            invariant:
              "全初期状態は時間的正規化条件 g_mu_nu u^mu u^nu = -1 を満たします。",
          },
          {
            id: "veff-potential",
            layer: "ポテンシャル解析",
            title: "有効ポテンシャル V_eff(r)",
            tech: "動径方向転回点",
            telemetry: "即時プロット",
            summary:
              "相対論的ポテンシャル井戸を計算し、落下・ISCO円・歳差・ズームワール軌道を分類します。",
            contract: "evalVeff(r, E, L_z, a) -> BarrierProfile",
            invariant:
              "転回点は虚数平方根エラーを起こさずに滑らかに反射処理されます。",
          },
          {
            id: "rk4-timelike",
            layer: "JS 積分器",
            title: "時間的 RK4 ソルバー",
            tech: "固有時 tau · 近点移動",
            telemetry: "tau ステップ",
            summary:
              "不安定ポテンシャル障壁付近での多回転ワールと劇的な近点移動を積分します。",
            contract:
              "integrateOrbit(state, dTau) -> Path + PhasePoint(r, p_r)",
            invariant:
              "刻み制御によりr_+近傍の座標特異点による破綻を回避します。",
          },
          {
            id: "invariant-guard",
            layer: "不変量ガード",
            title: "不変量 & 位相スコープ",
            tech: "クレッチマン · (r, p_r)",
            telemetry: "連続検証",
            summary:
              "E, L_zおよびクレッチマンスカラーの誤差推移をシンプレクティック位相図と並列監視します。",
            contract: "checkInvariants(state) -> { dE, dLz, K_scalar }",
            invariant:
              "保存物理量がリアルタイムシミュレーションの連続ユニットテストとして機能します。",
          },
        ],
      },
    ],
  },
};

export function getArchitectureFlow(
  projectId: ProjectId,
  lang: Lang = "en",
): ProjectArchitectureFlow | null {
  if (!(projectId in flowsByLang.en)) return null;
  const typedId = projectId as ArchFlowProjectId;
  const scenarios = flowsByLang[lang]?.[typedId] ?? flowsByLang.en[typedId];
  return {
    projectId,
    scenarios,
  };
}
