import type { ArchitectureScenario } from "../data/architecture-flows";

const TRACE_INTERVAL_MS = 3200;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function animatePanelRefresh(panel: HTMLElement | null): void {
  if (!panel || prefersReducedMotion() || typeof panel.animate !== "function") {
    return;
  }
  try {
    panel.animate(
      [
        { opacity: 0.65, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      {
        duration: 240,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
  } catch {
    // Minimal DOM environments without WAAPI support fail gracefully.
  }
}

export function setupArchitectureFlow(
  root: HTMLElement,
  signal?: AbortSignal,
): () => void {
  const raw = root.dataset.flow;
  if (!raw) return () => {};

  let scenarios: ArchitectureScenario[] = [];
  try {
    scenarios = JSON.parse(raw) as ArchitectureScenario[];
  } catch {
    return () => {};
  }
  if (!Array.isArray(scenarios) || scenarios.length === 0) return () => {};

  const scenarioBtns = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-arch-scenario]"),
  ];
  const nodeBtns = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-arch-node]"),
  ];
  const connectors = [
    ...root.querySelectorAll<HTMLElement>("[data-arch-connector]"),
  ];

  const scenarioBadge = root.querySelector<HTMLElement>(
    "[data-arch-scenario-badge]",
  );
  const scenarioDesc = root.querySelector<HTMLElement>(
    "[data-arch-scenario-desc]",
  );
  const packetEl = root.querySelector<HTMLElement>("[data-arch-packet]");
  const progressBarEl = root.querySelector<HTMLElement>(
    "[data-arch-progress-bar]",
  );

  const playBtn = root.querySelector<HTMLButtonElement>("[data-arch-play]");
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-arch-next]");
  const resetBtn = root.querySelector<HTMLButtonElement>("[data-arch-reset]");

  const inspectorEl = root.querySelector<HTMLElement>("[data-arch-inspector]");
  const stepPillEl = root.querySelector<HTMLElement>("[data-arch-step-pill]");
  const layerEl = root.querySelector<HTMLElement>("[data-arch-layer]");
  const nodeTitleEl = root.querySelector<HTMLElement>("[data-arch-node-title]");
  const techEl = root.querySelector<HTMLElement>("[data-arch-tech]");
  const telemetryEl = root.querySelector<HTMLElement>("[data-arch-telemetry]");
  const summaryEl = root.querySelector<HTMLElement>("[data-arch-summary]");
  const contractEl = root.querySelector<HTMLElement>("[data-arch-contract]");
  const invariantEl = root.querySelector<HTMLElement>("[data-arch-invariant]");

  const playLabel = root.dataset.playLabel || "Auto-trace";
  const pauseLabel = root.dataset.pauseLabel || "Pause trace";

  let activeScenarioIndex = 0;
  let activeNodeIndex = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let renderedKey = "";

  const stopAutoTrace = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", "false");
      const labelSpan = playBtn.querySelector<HTMLElement>(
        "[data-arch-play-text]",
      );
      if (labelSpan) labelSpan.textContent = playLabel;
      else playBtn.textContent = playLabel;
      playBtn.classList.remove("btn-primary");
      playBtn.classList.add("btn-outline");
    }
  };

  const render = (shouldAnimate = false) => {
    const scenario = scenarios[activeScenarioIndex] ?? scenarios[0];
    const nodes = scenario.nodes;
    if (!nodes || nodes.length === 0) return;
    if (activeNodeIndex >= nodes.length) activeNodeIndex = 0;

    const currentNode = nodes[activeNodeIndex];

    // Scenario tabs
    scenarioBtns.forEach((btn, i) => {
      const active = i === activeScenarioIndex;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("bg-primary", active);
      btn.classList.toggle("text-primary-content", active);
      btn.classList.toggle("border-primary", active);
      btn.classList.toggle("shadow-sm", active);
      btn.classList.toggle("bg-base-100/70", !active);
      btn.classList.toggle("text-base-content/80", !active);
      btn.classList.toggle("border-base-content/15", !active);
    });

    if (scenarioBadge) scenarioBadge.textContent = scenario.badge;
    if (scenarioDesc) scenarioDesc.textContent = scenario.description;

    // Node pipeline cards
    nodeBtns.forEach((btn, i) => {
      const node = nodes[i];
      if (!node) {
        btn.hidden = true;
        return;
      }
      btn.hidden = false;
      const isActive = i === activeNodeIndex;
      const isPassed = i < activeNodeIndex;

      btn.setAttribute("aria-current", isActive ? "step" : "false");
      btn.dataset.state = isActive ? "active" : isPassed ? "passed" : "idle";

      btn.classList.toggle("border-primary", isActive);
      btn.classList.toggle("bg-primary/10", isActive);
      btn.classList.toggle("shadow-md", isActive);
      btn.classList.toggle("border-primary/40", isPassed);
      btn.classList.toggle("bg-base-100/85", isPassed);
      btn.classList.toggle("border-base-content/12", !isActive && !isPassed);
      btn.classList.toggle("bg-base-100/50", !isActive && !isPassed);

      const stepBadge = btn.querySelector<HTMLElement>("[data-node-step]");
      const layerBadge = btn.querySelector<HTMLElement>("[data-node-layer]");
      const titleNode = btn.querySelector<HTMLElement>("[data-node-title]");
      const techNode = btn.querySelector<HTMLElement>("[data-node-tech]");
      const telNode = btn.querySelector<HTMLElement>("[data-node-telemetry]");

      if (stepBadge) {
        stepBadge.textContent = `0${i + 1}`;
        stepBadge.classList.toggle("bg-primary", isActive);
        stepBadge.classList.toggle("text-primary-content", isActive);
        stepBadge.classList.toggle("bg-base-300", !isActive);
      }
      if (layerBadge) layerBadge.textContent = node.layer;
      if (titleNode) titleNode.textContent = node.title;
      if (techNode) techNode.textContent = node.tech;
      if (telNode) telNode.textContent = node.telemetry;
    });

    // Connectors & SVG progress conduit
    connectors.forEach((conn, i) => {
      const activeHop = i < activeNodeIndex;
      conn.dataset.active = activeHop ? "true" : "false";
      conn.classList.toggle("text-primary", activeHop);
      conn.classList.toggle("opacity-100", activeHop);
      conn.classList.toggle("opacity-35", !activeHop);
    });

    const ratio = ((activeNodeIndex + 0.5) / nodes.length) * 100;
    if (packetEl) {
      packetEl.style.left = `${ratio}%`;
    }
    if (progressBarEl) {
      const progressPct =
        nodes.length > 1 ? (activeNodeIndex / (nodes.length - 1)) * 100 : 100;
      progressBarEl.style.width = `${progressPct}%`;
    }

    // Inspector fields
    if (stepPillEl) {
      stepPillEl.textContent = `0${activeNodeIndex + 1} / 0${nodes.length}`;
    }
    if (layerEl) layerEl.textContent = currentNode.layer;
    if (nodeTitleEl) nodeTitleEl.textContent = currentNode.title;
    if (techEl) techEl.textContent = currentNode.tech;
    if (telemetryEl) telemetryEl.textContent = currentNode.telemetry;
    if (summaryEl) summaryEl.textContent = currentNode.summary;
    if (contractEl) contractEl.textContent = currentNode.contract;
    if (invariantEl) invariantEl.textContent = currentNode.invariant;

    const nextKey = `${scenario.id}:${currentNode.id}`;
    if (shouldAnimate && renderedKey && renderedKey !== nextKey) {
      animatePanelRefresh(inspectorEl);
    }
    renderedKey = nextKey;
  };

  const selectScenario = (index: number) => {
    stopAutoTrace();
    activeScenarioIndex = Math.max(0, Math.min(index, scenarios.length - 1));
    activeNodeIndex = 0;
    render(true);
  };

  const selectNode = (index: number, stopPlayback = true) => {
    if (stopPlayback) stopAutoTrace();
    const nodes = scenarios[activeScenarioIndex]?.nodes ?? [];
    if (nodes.length === 0) return;
    activeNodeIndex = ((index % nodes.length) + nodes.length) % nodes.length;
    render(true);
  };

  const toggleAutoTrace = () => {
    if (timer !== null) {
      stopAutoTrace();
      return;
    }
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", "true");
      const labelSpan = playBtn.querySelector<HTMLElement>(
        "[data-arch-play-text]",
      );
      if (labelSpan) labelSpan.textContent = pauseLabel;
      else playBtn.textContent = pauseLabel;
      playBtn.classList.remove("btn-outline");
      playBtn.classList.add("btn-primary");
    }
    timer = setInterval(() => {
      selectNode(activeNodeIndex + 1, false);
    }, TRACE_INTERVAL_MS);
  };

  scenarioBtns.forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const idx = Number(btn.dataset.scenarioIndex ?? 0);
        selectScenario(idx);
      },
      { signal },
    );
  });

  nodeBtns.forEach((btn, idx) => {
    btn.addEventListener(
      "click",
      () => {
        selectNode(idx, true);
      },
      { signal },
    );
    btn.addEventListener(
      "keydown",
      (event) => {
        const nodesCount = (scenarios[activeScenarioIndex]?.nodes ?? []).length;
        if (nodesCount === 0) return;
        let nextIdx: number | null = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIdx = (idx + 1) % nodesCount;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIdx = (idx - 1 + nodesCount) % nodesCount;
        }
        if (nextIdx !== null) {
          event.preventDefault();
          selectNode(nextIdx, true);
          nodeBtns[nextIdx]?.focus();
        }
      },
      { signal },
    );
  });

  playBtn?.addEventListener("click", toggleAutoTrace, { signal });
  nextBtn?.addEventListener(
    "click",
    () => selectNode(activeNodeIndex + 1, true),
    { signal },
  );
  resetBtn?.addEventListener(
    "click",
    () => {
      stopAutoTrace();
      activeNodeIndex = 0;
      render(true);
    },
    { signal },
  );

  signal?.addEventListener("abort", stopAutoTrace, { once: true });

  render(false);
  return stopAutoTrace;
}

export function initArchitectureFlows(signal?: AbortSignal): void {
  const roots = document.querySelectorAll<HTMLElement>(".arch-flow");
  for (const root of roots) {
    setupArchitectureFlow(root, signal);
  }
}
