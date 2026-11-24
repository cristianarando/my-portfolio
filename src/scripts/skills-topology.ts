import type {
  SkillDomainId,
  SkillsTopology,
  TopologyNode,
} from "../data/skills-topology";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isFineHoverPointer(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function animateReveal(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion() || typeof el.animate !== "function") {
    return;
  }
  try {
    el.animate(
      [
        { opacity: 0.35, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      { duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  } catch {
    // Graceful no-op under minimal DOM implementations.
  }
}

export function setupSkillsTopology(
  root: HTMLElement,
  signal?: AbortSignal,
): () => void {
  const rawTopology = root.dataset.topology;
  if (!rawTopology) return () => {};

  let topology: SkillsTopology;
  try {
    topology = JSON.parse(rawTopology) as SkillsTopology;
  } catch {
    return () => {};
  }
  if (!topology.nodes?.length) return () => {};

  let categoryLabels: Record<string, string> = {};
  try {
    categoryLabels = root.dataset.categories
      ? (JSON.parse(root.dataset.categories) as Record<string, string>)
      : {};
  } catch {
    categoryLabels = {};
  }

  const allSkillsLabel = root.dataset.allSkillsLabel || "All domain skills";

  const nodeMap = new Map<SkillDomainId, TopologyNode>(
    topology.nodes.map((node) => [node.id, node]),
  );

  const viewBtns = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-skills-view-btn]"),
  ];
  const gridPanel = root.querySelector<HTMLElement>(
    "[data-skills-panel='grid']",
  );
  const topoPanel = root.querySelector<HTMLElement>(
    "[data-skills-panel='topology']",
  );

  const topoNodes = [...root.querySelectorAll<Element>("[data-topo-node]")];
  const topoPills = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-topo-pill]"),
  ];
  const topoEdges = [...root.querySelectorAll<Element>("[data-topo-edge]")];

  const inspectorTitle = root.querySelector<HTMLElement>("[data-topo-title]");
  const inspectorConstellation = root.querySelector<HTMLElement>(
    "[data-topo-constellation]",
  );
  const inspectorDesc = root.querySelector<HTMLElement>("[data-topo-desc]");
  const inspectorRole = root.querySelector<HTMLElement>("[data-topo-role]");
  const inspectorSkills = root.querySelector<HTMLElement>("[data-topo-skills]");
  const inspectorConnections = root.querySelector<HTMLElement>(
    "[data-topo-connections]",
  );
  const inspectorProjects = root.querySelector<HTMLElement>(
    "[data-topo-projects]",
  );
  const inspectorEmpty = root.querySelector<HTMLElement>("[data-topo-empty]");
  const evidenceLink = root.querySelector<HTMLAnchorElement>(
    "[data-topo-evidence-link]",
  );

  let activeView: "grid" | "topology" = "grid";
  let activeDomainId: SkillDomainId = topology.nodes[0].id;
  let activeSkill: string | null = null;

  const setView = (nextView: "grid" | "topology", animate = true) => {
    activeView = nextView;

    viewBtns.forEach((btn) => {
      const btnView = btn.dataset.skillsViewBtn;
      const isSelected = btnView === activeView;
      btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
      btn.classList.toggle("bg-primary", isSelected);
      btn.classList.toggle("text-primary-content", isSelected);
      btn.classList.toggle("border-primary", isSelected);
      btn.classList.toggle("shadow-sm", isSelected);
      btn.classList.toggle("bg-base-200/70", !isSelected);
      btn.classList.toggle("text-base-content/80", !isSelected);
      btn.classList.toggle("border-base-content/15", !isSelected);
    });

    if (gridPanel) {
      const showGrid = activeView === "grid";
      gridPanel.hidden = !showGrid;
      if (showGrid && animate) animateReveal(gridPanel);
    }
    if (topoPanel) {
      const showTopo = activeView === "topology";
      topoPanel.hidden = !showTopo;
      if (showTopo && animate) animateReveal(topoPanel);
    }
  };

  const renderProjectsList = (node: TopologyNode) => {
    if (!inspectorProjects) return;
    inspectorProjects.replaceChildren();

    const filtered = activeSkill
      ? node.projects.filter((project) =>
          project.matchedSkills.includes(activeSkill!),
        )
      : node.projects;

    if (inspectorEmpty) {
      inspectorEmpty.hidden = filtered.length > 0;
    }

    for (const project of filtered) {
      const link = document.createElement("a");
      link.href = project.url;
      link.setAttribute("data-topo-project-card", project.id);
      link.className =
        "group block rounded-xl border border-base-content/12 bg-base-200/60 hover:border-primary/45 hover:bg-base-100/90 p-3 transition-all";

      const topRow = document.createElement("div");
      topRow.className = "flex items-center justify-between gap-2 mb-1.5";

      const badge = document.createElement("span");
      badge.className =
        "badge badge-xs badge-outline border-primary/40 text-primary font-mono";
      badge.textContent = categoryLabels[project.category] || project.category;

      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.className =
        "text-xs font-mono opacity-55 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all";
      arrow.textContent = "→";

      topRow.append(badge, arrow);

      const titleEl = document.createElement("div");
      titleEl.className =
        "text-xs md:text-sm font-semibold text-base-content group-hover:text-primary transition-colors leading-snug mb-2";
      titleEl.textContent = project.title;

      const tagsWrap = document.createElement("div");
      tagsWrap.className = "flex flex-wrap gap-1";
      for (const matched of project.matchedSkills) {
        const tag = document.createElement("span");
        const isHighlighted = matched === activeSkill;
        tag.className = isHighlighted
          ? "px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary text-primary-content font-semibold"
          : "px-1.5 py-0.5 rounded text-[10px] font-mono bg-base-300/75 text-base-content/75";
        tag.textContent = matched;
        tagsWrap.append(tag);
      }

      link.append(topRow, titleEl, tagsWrap);
      inspectorProjects.append(link);
    }
  };

  const renderInspector = (node: TopologyNode) => {
    if (inspectorTitle) inspectorTitle.textContent = node.name;
    if (inspectorConstellation) {
      inspectorConstellation.textContent = `${node.constellation} · ★ ${node.alpha}`;
    }
    if (inspectorDesc) inspectorDesc.textContent = node.description;
    if (inspectorRole) inspectorRole.textContent = node.roleNote;

    if (evidenceLink) {
      const q = activeSkill ?? node.name;
      evidenceLink.href = `/${topology.lang}/search/?q=${encodeURIComponent(q)}&evidence=1`;
    }

    // Skill chips (All + each item)
    if (inspectorSkills) {
      inspectorSkills.replaceChildren();

      const createChip = (label: string, skillValue: string | null) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("data-skill-filter", skillValue ?? "");
        const selected = activeSkill === skillValue;
        btn.setAttribute("aria-pressed", selected ? "true" : "false");
        btn.className = selected
          ? "px-2.5 py-1 rounded-full text-[11px] font-mono border border-primary bg-primary text-primary-content font-semibold transition-colors cursor-pointer"
          : "px-2.5 py-1 rounded-full text-[11px] font-mono border border-base-content/15 bg-base-200/70 text-base-content/85 hover:border-primary/45 transition-colors cursor-pointer";
        btn.textContent = label;
        btn.addEventListener(
          "click",
          () => {
            if (skillValue === null) {
              activeSkill = null;
            } else {
              activeSkill = activeSkill === skillValue ? null : skillValue;
            }
            renderInspector(node);
          },
          { signal },
        );
        return btn;
      };

      inspectorSkills.append(createChip(allSkillsLabel, null));
      for (const item of node.items) {
        inspectorSkills.append(createChip(item, item));
      }
    }

    // Coupled domain jump pills
    if (inspectorConnections) {
      inspectorConnections.replaceChildren();
      for (const connId of node.connections) {
        const neighbor = nodeMap.get(connId);
        if (!neighbor) continue;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("data-topo-jump", neighbor.id);
        btn.className =
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-base-content/15 bg-base-200/70 text-base-content/85 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer";

        const star = document.createElement("span");
        star.setAttribute("aria-hidden", "true");
        star.className = "text-primary text-[10px]";
        star.textContent = "✦";

        const label = document.createElement("span");
        label.textContent = neighbor.name;

        btn.append(star, label);
        btn.addEventListener(
          "click",
          () => {
            selectDomain(neighbor.id);
          },
          { signal },
        );
        inspectorConnections.append(btn);
      }
    }

    renderProjectsList(node);
  };

  const renderTopologyGraph = () => {
    const activeNode = nodeMap.get(activeDomainId) ?? topology.nodes[0];
    const connectedSet = new Set<SkillDomainId>(activeNode.connections);

    for (const el of topoNodes) {
      const id = el.getAttribute("data-topo-node") as SkillDomainId;
      const isActive = id === activeNode.id;
      const isConnected = connectedSet.has(id);
      const state = isActive ? "active" : isConnected ? "connected" : "dimmed";
      el.setAttribute("data-state", state);
      el.setAttribute("aria-current", isActive ? "true" : "false");
    }

    for (const pill of topoPills) {
      const id = pill.getAttribute("data-topo-pill") as SkillDomainId;
      const isActive = id === activeNode.id;
      const isConnected = connectedSet.has(id);
      pill.setAttribute("aria-pressed", isActive ? "true" : "false");
      pill.setAttribute(
        "data-state",
        isActive ? "active" : isConnected ? "connected" : "idle",
      );
      pill.classList.toggle("bg-primary", isActive);
      pill.classList.toggle("text-primary-content", isActive);
      pill.classList.toggle("border-primary", isActive);
      pill.classList.toggle("border-primary/45", isConnected && !isActive);
      pill.classList.toggle("bg-base-100/80", !isActive);
      pill.classList.toggle(
        "border-base-content/15",
        !isActive && !isConnected,
      );
    }

    for (const edge of topoEdges) {
      const from = edge.getAttribute("data-from") as SkillDomainId;
      const to = edge.getAttribute("data-to") as SkillDomainId;
      const isIncident = from === activeNode.id || to === activeNode.id;
      edge.setAttribute("data-active", isIncident ? "true" : "false");
    }

    renderInspector(activeNode);
  };

  const selectDomain = (domainId: SkillDomainId) => {
    if (!nodeMap.has(domainId)) return;
    if (activeDomainId === domainId && activeSkill === null) return;
    activeDomainId = domainId;
    activeSkill = null;
    renderTopologyGraph();
  };

  viewBtns.forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const view =
          btn.dataset.skillsViewBtn === "topology" ? "topology" : "grid";
        setView(view, true);
      },
      { signal },
    );
  });

  topoNodes.forEach((nodeEl, idx) => {
    const id = nodeEl.getAttribute("data-topo-node") as SkillDomainId;
    nodeEl.addEventListener("click", () => selectDomain(id), { signal });
    nodeEl.addEventListener(
      "mouseenter",
      () => {
        if (isFineHoverPointer()) selectDomain(id);
      },
      { signal },
    );
    nodeEl.addEventListener(
      "keydown",
      (event) => {
        const keyEvent = event as KeyboardEvent;
        let nextIdx: number | null = null;
        if (keyEvent.key === "ArrowRight" || keyEvent.key === "ArrowDown") {
          nextIdx = (idx + 1) % topoNodes.length;
        } else if (keyEvent.key === "ArrowLeft" || keyEvent.key === "ArrowUp") {
          nextIdx = (idx - 1 + topoNodes.length) % topoNodes.length;
        } else if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          selectDomain(id);
          return;
        }
        if (nextIdx !== null) {
          keyEvent.preventDefault();
          const targetEl = topoNodes[nextIdx] as HTMLElement | SVGElement;
          const targetId = targetEl.getAttribute(
            "data-topo-node",
          ) as SkillDomainId;
          selectDomain(targetId);
          targetEl.focus?.();
        }
      },
      { signal },
    );
  });

  topoPills.forEach((pill) => {
    const id = pill.getAttribute("data-topo-pill") as SkillDomainId;
    pill.addEventListener("click", () => selectDomain(id), { signal });
  });

  // Initialize cleanly without transition flash
  setView("grid", false);
  renderTopologyGraph();

  return () => {};
}

export function initSkillsTopology(signal?: AbortSignal): void {
  const roots = document.querySelectorAll<HTMLElement>("[data-skills-root]");
  for (const root of roots) {
    setupSkillsTopology(root, signal);
  }
}
