import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import {
  computeJacobiConstant,
  createPresetOrbit,
  precomputeOrbitTrail,
  setupLagrangeSimulation,
  stepCr3bpRk4,
  svgToSynodic,
  synodicToSvg,
} from "../src/scripts/lagrange-physics.ts";

test("CR3BP RK4 solver conserves Jacobi integral and preserves synodic-SVG coordinate bijection", () => {
  // Coordinate bijection across orbital plane
  for (const [x, y] of [
    [0.5, 0.866],
    [-1.1, -0.35],
    [0.0, 0.0],
    [1.25, 0.42],
  ]) {
    const svg = synodicToSvg(x, y);
    const back = svgToSynodic(svg.x, svg.y);
    assert.ok(Math.abs(back.x - x) < 1e-12, "x coordinate round-trip exact");
    assert.ok(Math.abs(back.y - y) < 1e-12, "y coordinate round-trip exact");
  }

  // Jacobi integral conservation over 240 steps for all 5 Lagrange presets
  for (const point of ["L1", "L2", "L3", "L4", "L5"]) {
    const initial = createPresetOrbit(point);
    const c0 = computeJacobiConstant(initial);
    let state = initial;
    for (let i = 0; i < 240; i++) {
      state = stepCr3bpRk4(state, 0.01);
    }
    const cFinal = computeJacobiConstant(state);
    const drift = Math.abs(cFinal - c0);
    assert.ok(
      drift < 1e-4,
      `${point}: Jacobi constant drift ${drift} must be < 1e-4`,
    );
  }

  // Precompute trail length
  const { svgTrail } = precomputeOrbitTrail(createPresetOrbit("L4"), 50, 0.01);
  assert.equal(svgTrail.length, 51);
});

test("setupLagrangeSimulation initializes L4 orbit, switches regimes, injects custom SVG probes, and resets", () => {
  const dom = new JSDOM(
    `<!doctype html><html lang="en"><body>
      <div id="lagrange-container">
        <div
          class="lagrange-card"
          data-default-title="LAGRANGE_EQUILIBRIUM"
          data-default-desc="The fundamental forces balancing my engineering"
        >
          <button type="button" data-lagrange-reset>↺</button>
          <svg data-lagrange-svg viewBox="0 0 200 200">
            <line class="line-element line-L2" />
            <path class="contour-element contour-L2" />
            <polyline data-lagrange-trail points="" />
            <line data-lagrange-velocity x1="0" y1="0" x2="0" y2="0" />
            <circle data-lagrange-probe-glow cx="0" cy="0" r="4" />
            <circle data-lagrange-probe cx="0" cy="0" r="2" />
            <g class="lagrange-node" data-id="L1" data-title="L1: PRECISION" data-desc="Exact execution"></g>
            <g class="lagrange-node" data-id="L2" data-title="L2: ADAPTABILITY" data-desc="Expanding capabilities"></g>
            <g class="lagrange-node" data-id="L4" data-title="L4: SYSTEM_THINKING" data-desc="Holistic stability"></g>
            <text class="text-node-label opacity-0" data-id="L2">L2</text>
          </svg>
          <span class="system-status-title">LAGRANGE_EQUILIBRIUM</span>
          <span class="system-status-desc">The fundamental forces balancing my engineering</span>
          <span data-lagrange-jacobi>3.000</span>
          <span data-lagrange-regime>RK4 · L4_TROJAN</span>
        </div>
      </div>
    </body></html>`,
    { url: "https://example.test/en/" },
  );

  const originalGlobals = new Map();
  for (const key of [
    "window",
    "document",
    "matchMedia",
    "requestAnimationFrame",
    "cancelAnimationFrame",
  ]) {
    originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value:
        key === "matchMedia"
          ? () => ({ matches: true })
          : key === "requestAnimationFrame"
            ? () => 1
            : key === "cancelAnimationFrame"
              ? () => {}
              : dom.window[key],
    });
  }

  const card = dom.window.document.getElementById("lagrange-container");
  const svg = card.querySelector("[data-lagrange-svg]");
  svg.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 200,
    height: 200,
    right: 200,
    bottom: 200,
    x: 0,
    y: 0,
    toJSON() {},
  });

  const controller = new dom.window.AbortController();
  const $ = (selector) => card.querySelector(selector);

  try {
    setupLagrangeSimulation(card, controller.signal);

    // 1. Initial L4 Trojan orbit populated
    const initialTrail = $("[data-lagrange-trail]").getAttribute("points");
    assert.ok(initialTrail && initialTrail.split(" ").length > 100);
    assert.equal(
      $("[data-lagrange-regime]").textContent.trim(),
      "RK4 · L4_TROJAN",
    );
    assert.ok(Number($("[data-lagrange-jacobi]").textContent) > 2.5);

    // 2. Clicking L2 node locks L2 epicycle regime & highlights L2 UI
    $("[data-id='L2']").dispatchEvent(
      new dom.window.MouseEvent("click", { bubbles: true }),
    );
    assert.equal(
      $("[data-lagrange-regime]").textContent.trim(),
      "RK4 · L2_EPICYCLE",
    );
    assert.equal(
      $(".system-status-title").textContent.trim(),
      "L2: ADAPTABILITY",
    );
    assert.ok($(".contour-L2").classList.contains("contour-active"));

    const l2Trail = $("[data-lagrange-trail]").getAttribute("points");
    assert.notEqual(l2Trail, initialTrail);

    // 3. Clicking empty orbital space injects a custom RK4 test probe
    svg.dispatchEvent(
      new dom.window.MouseEvent("click", {
        bubbles: true,
        clientX: 60,
        clientY: 75,
      }),
    );
    assert.equal(
      $("[data-lagrange-regime]").textContent.trim(),
      "RK4 · TEST_PROBE",
    );
    assert.equal(
      $(".system-status-title").textContent.trim(),
      "LAGRANGE_EQUILIBRIUM",
    );

    // 4. Reset button restores L4 orbit cleanly
    $("[data-lagrange-reset]").click();
    assert.equal(
      $("[data-lagrange-regime]").textContent.trim(),
      "RK4 · L4_TROJAN",
    );
    assert.equal(
      $("[data-lagrange-trail]").getAttribute("points"),
      initialTrail,
    );
  } finally {
    controller.abort();
    dom.window.close();
    for (const [key, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
