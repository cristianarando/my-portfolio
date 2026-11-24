export type LagrangePointId = "L1" | "L2" | "L3" | "L4" | "L5";

export interface OrbitalState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface SvgPoint {
  x: number;
  y: number;
}

/** Sub-Routh stable mass ratio mu < 0.03852 (Earth-Moon analog in geometric units). */
export const DEFAULT_MU = 0.01215;

/** Core gravitational softening parameter to guard against numerical blow-up near M1/M2. */
const SOFTENING_SQ = 0.04 * 0.04;

/** SVG geometry anchors matching LagrangeSimulation.astro viewBox (0..200 x 0..200). */
const SVG_SUN_X = 100;
const SVG_SUN_Y = 100;
const SVG_ORBIT_RADIUS = 50;

const DEFAULT_DT = 0.01;
const INITIAL_TRAIL_STEPS = 240;
const MAX_TRAIL_POINTS = 240;
const VELOCITY_VECTOR_SCALE = 8;

const COLOR_MAP: Record<LagrangePointId | "CUSTOM", string> = {
  L1: "#3b82f6",
  L2: "#10b981",
  L3: "#f59e0b",
  L4: "#8b5cf6",
  L5: "#ec4899",
  CUSTOM: "currentColor",
};

const REGIME_LABELS: Record<LagrangePointId | "CUSTOM", string> = {
  L1: "RK4 · L1_HALO",
  L2: "RK4 · L2_EPICYCLE",
  L3: "RK4 · L3_HORSESHOE",
  L4: "RK4 · L4_TROJAN",
  L5: "RK4 · L5_TROJAN",
  CUSTOM: "RK4 · TEST_PROBE",
};

/**
 * Convert rotating synodic CR3BP coordinates into SVG viewBox coordinates.
 * Maps M1(-mu, 0) -> (100, 100) and M2(1 - mu, 0) -> (150, 100).
 */
export function synodicToSvg(x: number, y: number, mu = DEFAULT_MU): SvgPoint {
  return {
    x: SVG_SUN_X + (x + mu) * SVG_ORBIT_RADIUS,
    y: SVG_SUN_Y - y * SVG_ORBIT_RADIUS,
  };
}

/**
 * Convert SVG viewBox coordinates (0..200) back into rotating synodic coordinates.
 */
export function svgToSynodic(
  svgX: number,
  svgY: number,
  mu = DEFAULT_MU,
): SvgPoint {
  return {
    x: (svgX - SVG_SUN_X) / SVG_ORBIT_RADIUS - mu,
    y: (SVG_SUN_Y - svgY) / SVG_ORBIT_RADIUS,
  };
}

function softenedDistances(x: number, y: number, mu: number) {
  const dx1 = x + mu;
  const dx2 = x - (1 - mu);
  const ySq = y * y;
  const r1Sq = dx1 * dx1 + ySq + SOFTENING_SQ;
  const r2Sq = dx2 * dx2 + ySq + SOFTENING_SQ;
  return {
    dx1,
    dx2,
    r1: Math.sqrt(r1Sq),
    r2: Math.sqrt(r2Sq),
    r1Cu: r1Sq * Math.sqrt(r1Sq),
    r2Cu: r2Sq * Math.sqrt(r2Sq),
  };
}

/**
 * Compute rotating-frame CR3BP potential Omega(x, y) consistent with softened dynamics.
 */
export function computeEffectivePotential(
  x: number,
  y: number,
  mu = DEFAULT_MU,
): number {
  const { r1, r2 } = softenedDistances(x, y, mu);
  return 0.5 * (x * x + y * y) + (1 - mu) / r1 + mu / r2;
}

/**
 * Compute the conserved Jacobi integral C_J = 2 * Omega(x, y) - (vx^2 + vy^2).
 */
export function computeJacobiConstant(
  state: OrbitalState,
  mu = DEFAULT_MU,
): number {
  const omega = computeEffectivePotential(state.x, state.y, mu);
  return 2 * omega - (state.vx * state.vx + state.vy * state.vy);
}

function derivatives(state: OrbitalState, mu: number): OrbitalState {
  const { x, y, vx, vy } = state;
  const { dx1, dx2, r1Cu, r2Cu } = softenedDistances(x, y, mu);
  const dOmegaDx = x - ((1 - mu) * dx1) / r1Cu - (mu * dx2) / r2Cu;
  const dOmegaDy = y - ((1 - mu) * y) / r1Cu - (mu * y) / r2Cu;
  return {
    x: vx,
    y: vy,
    vx: 2 * vy + dOmegaDx,
    vy: -2 * vx + dOmegaDy,
  };
}

function addScaled(
  base: OrbitalState,
  delta: OrbitalState,
  scale: number,
): OrbitalState {
  return {
    x: base.x + delta.x * scale,
    y: base.y + delta.y * scale,
    vx: base.vx + delta.vx * scale,
    vy: base.vy + delta.vy * scale,
  };
}

/**
 * Advance a test particle by dt using 4th-order Runge-Kutta in the rotating synodic frame.
 */
export function stepCr3bpRk4(
  state: OrbitalState,
  dt: number,
  mu = DEFAULT_MU,
): OrbitalState {
  const k1 = derivatives(state, mu);
  const k2 = derivatives(addScaled(state, k1, dt * 0.5), mu);
  const k3 = derivatives(addScaled(state, k2, dt * 0.5), mu);
  const k4 = derivatives(addScaled(state, k3, dt), mu);
  const sixth = dt / 6;
  return {
    x: state.x + sixth * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: state.y + sixth * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    vx: state.vx + sixth * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx),
    vy: state.vy + sixth * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy),
  };
}

/**
 * Construct initial orbital state centered near a Lagrange point with bounded libration.
 */
export function createPresetOrbit(
  pointId: LagrangePointId,
  mu = DEFAULT_MU,
): OrbitalState {
  const halfSqrt3 = Math.sqrt(3) * 0.5;
  switch (pointId) {
    case "L4":
      return {
        x: 0.5 - mu + 0.09,
        y: halfSqrt3 - 0.06,
        vx: -0.055,
        vy: -0.045,
      };
    case "L5":
      return {
        x: 0.5 - mu + 0.09,
        y: -halfSqrt3 + 0.06,
        vx: -0.055,
        vy: 0.045,
      };
    case "L1":
      return {
        x: 0.72 - mu,
        y: 0.04,
        vx: -0.02,
        vy: 0.24,
      };
    case "L2":
      return {
        x: 1.38 - mu,
        y: 0.0,
        vx: 0.0,
        vy: -0.58,
      };
    case "L3":
      return {
        x: -1.32 - mu,
        y: 0.0,
        vx: 0.0,
        vy: 0.48,
      };
  }
}

/**
 * Convert a user click in SVG space into a bound rotating-frame circular Keplerian orbit probe.
 */
export function createInjectedProbe(
  svgX: number,
  svgY: number,
  mu = DEFAULT_MU,
): OrbitalState {
  const clampedX = Math.max(12, Math.min(188, svgX));
  const clampedY = Math.max(12, Math.min(188, svgY));
  const { x, y } = svgToSynodic(clampedX, clampedY, mu);

  const dx2 = x - (1 - mu);
  const r2 = Math.hypot(dx2, y);
  if (r2 < 0.16) {
    // Capture into a bound prograde satellite orbit around M2 (Earth)
    const r2Soft = Math.max(0.06, r2);
    const vc2 = Math.sqrt(mu / r2Soft);
    return {
      x,
      y,
      vx: (-y / r2Soft) * vc2 + y,
      vy: (dx2 / r2Soft) * vc2 - dx2,
    };
  }

  // Exact bound circular Keplerian velocity around M1 transformed to synodic frame: v_rot = v_inert - (omega x r)
  const dx1 = x + mu;
  const r1 = Math.max(0.18, Math.hypot(dx1, y));
  const vc1 = Math.sqrt((1 - mu) / r1);
  return {
    x,
    y,
    vx: (-y / r1) * vc1 + y,
    vy: (dx1 / r1) * vc1 - x,
  };
}

/**
 * Integrate a trajectory history array for immediate visualization and reduced-motion views.
 */
export function precomputeOrbitTrail(
  initial: OrbitalState,
  steps = INITIAL_TRAIL_STEPS,
  dt = DEFAULT_DT,
  mu = DEFAULT_MU,
): { finalState: OrbitalState; svgTrail: SvgPoint[] } {
  let state = { ...initial };
  const svgTrail: SvgPoint[] = [synodicToSvg(state.x, state.y, mu)];
  for (let i = 0; i < steps; i++) {
    state = stepCr3bpRk4(state, dt, mu);
    svgTrail.push(synodicToSvg(state.x, state.y, mu));
  }
  return { finalState: state, svgTrail };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function setupLagrangeSimulation(
  card: HTMLElement,
  signal?: AbortSignal,
): () => void {
  const svg = card.querySelector<SVGSVGElement>("[data-lagrange-svg]");
  const lagrangeCard = card.querySelector<HTMLElement>(".lagrange-card");
  const lagrangeNodes = Array.from(
    card.querySelectorAll<Element>(".lagrange-node"),
  );
  const statusTitle = card.querySelector<HTMLElement>(".system-status-title");
  const statusDesc = card.querySelector<HTMLElement>(".system-status-desc");
  const trailEl = card.querySelector<SVGPolylineElement>(
    "[data-lagrange-trail]",
  );
  const probeEl = card.querySelector<SVGCircleElement>("[data-lagrange-probe]");
  const probeGlowEl = card.querySelector<SVGCircleElement>(
    "[data-lagrange-probe-glow]",
  );
  const velocityEl = card.querySelector<SVGLineElement>(
    "[data-lagrange-velocity]",
  );
  const jacobiEl = card.querySelector<HTMLElement>("[data-lagrange-jacobi]");
  const regimeEl = card.querySelector<HTMLElement>("[data-lagrange-regime]");
  const resetBtn = card.querySelector<HTMLButtonElement>(
    "[data-lagrange-reset]",
  );

  let lockedPoint: LagrangePointId | "CUSTOM" | null = "L4";
  let currentState = createPresetOrbit("L4");
  let svgTrail: SvgPoint[] = [];
  let frameId: number | null = null;
  let isVisible = true;
  let intersectionObserver: IntersectionObserver | null = null;

  const setActiveHighlight = (pointId: LagrangePointId | null) => {
    if (!pointId) {
      card.style.removeProperty("--active-color");
      if (statusTitle && statusDesc) {
        statusTitle.textContent =
          lagrangeCard?.getAttribute("data-default-title") ||
          "LAGRANGE_EQUILIBRIUM";
        statusDesc.textContent =
          lagrangeCard?.getAttribute("data-default-desc") || "";
        statusTitle.style.color = "";
      }
      lagrangeNodes.forEach((other) => other.classList.remove("node-inactive"));
      card.querySelectorAll(".text-node-label").forEach((lbl) => {
        lbl.classList.remove("opacity-100");
        lbl.classList.add("opacity-0");
      });
      card.querySelectorAll(".line-element").forEach((line) => {
        line.classList.remove("line-active", "line-inactive");
      });
      card.querySelectorAll(".contour-element").forEach((contour) => {
        contour.classList.remove("contour-active", "contour-inactive");
      });
      return;
    }

    const node = lagrangeNodes.find(
      (item) => item.getAttribute("data-id") === pointId,
    );
    const title = node?.getAttribute("data-title");
    const desc = node?.getAttribute("data-desc");

    card.style.setProperty("--active-color", COLOR_MAP[pointId]);
    if (title && desc && statusTitle && statusDesc) {
      statusTitle.textContent = title;
      statusDesc.textContent = desc;
      statusTitle.style.color = "var(--active-color)";
    }

    lagrangeNodes.forEach((other) => {
      other.classList.toggle(
        "node-inactive",
        other.getAttribute("data-id") !== pointId,
      );
    });
    card.querySelectorAll(".text-node-label").forEach((lbl) => {
      const match = lbl.getAttribute("data-id") === pointId;
      lbl.classList.toggle("opacity-100", match);
      lbl.classList.toggle("opacity-0", !match);
    });
    card.querySelectorAll(".line-element").forEach((line) => {
      const match = line.classList.contains(`line-${pointId}`);
      line.classList.toggle("line-active", match);
      line.classList.toggle("line-inactive", !match);
    });
    card.querySelectorAll(".contour-element").forEach((contour) => {
      const match = contour.classList.contains(`contour-${pointId}`);
      contour.classList.toggle("contour-active", match);
      contour.classList.toggle("contour-inactive", !match);
    });
  };

  const renderProbeAndHud = () => {
    const pos = synodicToSvg(currentState.x, currentState.y);

    if (probeEl) {
      probeEl.setAttribute("cx", pos.x.toFixed(2));
      probeEl.setAttribute("cy", pos.y.toFixed(2));
    }
    if (probeGlowEl) {
      probeGlowEl.setAttribute("cx", pos.x.toFixed(2));
      probeGlowEl.setAttribute("cy", pos.y.toFixed(2));
    }
    if (velocityEl) {
      const tipX = pos.x + currentState.vx * VELOCITY_VECTOR_SCALE;
      const tipY = pos.y - currentState.vy * VELOCITY_VECTOR_SCALE;
      velocityEl.setAttribute("x1", pos.x.toFixed(2));
      velocityEl.setAttribute("y1", pos.y.toFixed(2));
      velocityEl.setAttribute("x2", tipX.toFixed(2));
      velocityEl.setAttribute("y2", tipY.toFixed(2));
    }
    if (trailEl) {
      trailEl.setAttribute(
        "points",
        svgTrail.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      );
    }
    if (jacobiEl) {
      jacobiEl.textContent = computeJacobiConstant(currentState).toFixed(3);
    }
    if (regimeEl) {
      const key = lockedPoint ?? "L4";
      regimeEl.textContent = REGIME_LABELS[key];
    }
  };

  const loadOrbit = (
    initial: OrbitalState,
    regime: LagrangePointId | "CUSTOM",
  ) => {
    lockedPoint = regime;
    if (regime === "CUSTOM") {
      // Launch directly from the clicked point without skipping ahead
      currentState = { ...initial };
      svgTrail = [synodicToSvg(initial.x, initial.y)];
    } else {
      const precomputed = precomputeOrbitTrail(initial, INITIAL_TRAIL_STEPS);
      currentState = precomputed.finalState;
      svgTrail = precomputed.svgTrail;
    }
    renderProbeAndHud();
  };

  const tick = () => {
    if (signal?.aborted || !isVisible || prefersReducedMotion()) {
      frameId = null;
      return;
    }

    // 3x dt=0.01 substeps per animation frame keep Jacobi error < 1e-6 while staying fluid at 60Hz
    for (let s = 0; s < 3; s++) {
      currentState = stepCr3bpRk4(currentState, DEFAULT_DT);
      const pt = synodicToSvg(currentState.x, currentState.y);
      // Soft boundary re-center if an extreme injected orbit exits viewport cleanly
      if (pt.x < -30 || pt.x > 230 || pt.y < -30 || pt.y > 230) {
        loadOrbit(
          createPresetOrbit(
            lockedPoint && lockedPoint !== "CUSTOM" ? lockedPoint : "L4",
          ),
          lockedPoint && lockedPoint !== "CUSTOM" ? lockedPoint : "L4",
        );
        break;
      }
      svgTrail.push(pt);
      if (svgTrail.length > MAX_TRAIL_POINTS) {
        svgTrail.shift();
      }
    }

    renderProbeAndHud();
    frameId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (
      frameId === null &&
      !prefersReducedMotion() &&
      isVisible &&
      !signal?.aborted
    ) {
      frameId = requestAnimationFrame(tick);
    }
  };

  const stopLoop = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  // Initial orbital seed
  loadOrbit(createPresetOrbit("L4"), "L4");
  // Keep card header clean at rest on first load (only trail highlights L4 gently)
  setActiveHighlight(null);

  // Node hover, focus, click & keyboard interactions
  lagrangeNodes.forEach((node) => {
    const id = node.getAttribute("data-id") as LagrangePointId | null;
    if (!id) return;

    node.addEventListener("mouseenter", () => setActiveHighlight(id), {
      signal,
    });
    node.addEventListener("focus", () => setActiveHighlight(id), { signal });

    node.addEventListener(
      "mouseleave",
      () => {
        setActiveHighlight(
          lockedPoint && lockedPoint !== "CUSTOM" ? null : null,
        );
      },
      { signal },
    );
    node.addEventListener("blur", () => setActiveHighlight(null), { signal });

    node.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
        setActiveHighlight(id);
        loadOrbit(createPresetOrbit(id), id);
      },
      { signal },
    );

    node.addEventListener(
      "keydown",
      (event) => {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
          keyEvent.preventDefault();
          setActiveHighlight(id);
          loadOrbit(createPresetOrbit(id), id);
        }
      },
      { signal },
    );
  });

  // Click anywhere inside orbital SVG to inject custom RK4 probe
  svg?.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element | null;
      if (target?.closest(".lagrange-node")) return;

      let svgX: number | null = null;
      let svgY: number | null = null;

      if (
        typeof svg.createSVGPoint === "function" &&
        typeof svg.getScreenCTM === "function"
      ) {
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = event.clientX;
          pt.y = event.clientY;
          const localPt = pt.matrixTransform(ctm.inverse());
          svgX = localPt.x;
          svgY = localPt.y;
        }
      }

      if (
        svgX === null ||
        svgY === null ||
        Number.isNaN(svgX) ||
        Number.isNaN(svgY)
      ) {
        const rect = svg.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) return;
        svgX = ((event.clientX - rect.left) / rect.width) * 200;
        svgY = ((event.clientY - rect.top) / rect.height) * 200;
      }

      setActiveHighlight(null);
      loadOrbit(createInjectedProbe(svgX, svgY), "CUSTOM");
    },
    { signal },
  );

  resetBtn?.addEventListener(
    "click",
    () => {
      setActiveHighlight(null);
      loadOrbit(createPresetOrbit("L4"), "L4");
    },
    { signal },
  );

  if (typeof IntersectionObserver !== "undefined") {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(card);
  }

  startLoop();

  const cleanup = () => {
    stopLoop();
    intersectionObserver?.disconnect();
    intersectionObserver = null;
  };

  signal?.addEventListener("abort", cleanup, { once: true });
  return cleanup;
}

export function initLagrangeSimulation(signal?: AbortSignal): void {
  const card = document.getElementById("lagrange-container");
  if (card) {
    setupLagrangeSimulation(card, signal);
  }
}
