import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { setupArchitectureFlow } from "../src/scripts/architecture-flow.ts";
import { getArchitectureFlow } from "../src/data/architecture-flows.ts";

function buildFixture() {
  const flow = getArchitectureFlow("onelink-saas", "en");
  assert.ok(flow, "onelink-saas architecture flow exists");

  const firstScenario = flow.scenarios[0];
  const initialNodes = firstScenario.nodes;
  const initialNode = initialNodes[0];

  const html = `<!doctype html><html lang="en"><body>
    <section
      class="arch-flow"
      data-play-label="Auto-trace"
      data-pause-label="Pause trace"
    >
      <button type="button" data-arch-play aria-pressed="false">
        <span data-arch-play-text>Auto-trace</span>
      </button>
      <button type="button" data-arch-next>Next hop</button>
      <button type="button" data-arch-reset>Reset</button>

      ${flow.scenarios
        .map(
          (sc, idx) =>
            `<button type="button" data-arch-scenario data-scenario-index="${idx}" aria-pressed="${idx === 0}">${sc.label}</button>`,
        )
        .join("")}
      <span data-arch-scenario-badge>${firstScenario.badge}</span>
      <p data-arch-scenario-desc>${firstScenario.description}</p>

      <div data-arch-progress-bar style="width: 0%"></div>
      <span data-arch-packet style="left: 12.5%"></span>

      ${initialNodes
        .map(
          (node, i) => `
          <button type="button" data-arch-node data-node-index="${i}" aria-current="${i === 0 ? "step" : "false"}">
            <span data-node-step>0${i + 1}</span>
            <span data-node-layer>${node.layer}</span>
            <span data-node-title>${node.title}</span>
            <span data-node-tech>${node.tech}</span>
            <span data-node-telemetry>${node.telemetry}</span>
          </button>
          ${i < initialNodes.length - 1 ? `<span data-arch-connector data-connector-index="${i}">→</span>` : ""}
        `,
        )
        .join("")}

      <div data-arch-inspector>
        <span data-arch-step-pill>01 / 04</span>
        <span data-arch-layer>${initialNode.layer}</span>
        <h4 data-arch-node-title>${initialNode.title}</h4>
        <span data-arch-tech>${initialNode.tech}</span>
        <span data-arch-telemetry>${initialNode.telemetry}</span>
        <p data-arch-summary>${initialNode.summary}</p>
        <code data-arch-contract>${initialNode.contract}</code>
        <p data-arch-invariant>${initialNode.invariant}</p>
      </div>
    </section>
  </body></html>`;

  const dom = new JSDOM(html, {
    url: "https://example.test/en/projects/onelink-saas/",
  });
  const root = dom.window.document.querySelector(".arch-flow");
  root.dataset.flow = JSON.stringify(flow.scenarios);
  return { dom, root, flow };
}

test("architecture flow steps, switches scenarios, navigates via keyboard, and aborts auto-trace", () => {
  const { dom, root, flow } = buildFixture();
  const originalGlobals = new Map();
  for (const key of ["window", "document", "matchMedia"]) {
    originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === "matchMedia" ? () => ({ matches: true }) : dom.window[key],
    });
  }

  const controller = new dom.window.AbortController();
  const $ = (selector) => root.querySelector(selector);

  try {
    setupArchitectureFlow(root, controller.signal);

    // 1. Initial state
    assert.equal(
      $("[data-arch-node-title]").textContent,
      flow.scenarios[0].nodes[0].title,
    );
    assert.equal(
      $("[data-arch-contract]").textContent,
      flow.scenarios[0].nodes[0].contract,
    );
    assert.equal(
      $("[data-arch-node][data-node-index='0']").getAttribute("aria-current"),
      "step",
    );

    // 2. Step via Next hop button
    $("[data-arch-next]").click();
    assert.equal($("[data-arch-step-pill]").textContent.trim(), "02 / 04");
    assert.equal(
      $("[data-arch-node-title]").textContent,
      flow.scenarios[0].nodes[1].title,
    );
    assert.equal(
      $("[data-arch-contract]").textContent,
      flow.scenarios[0].nodes[1].contract,
    );
    assert.equal(
      $("[data-arch-connector][data-connector-index='0']").dataset.active,
      "true",
    );
    assert.equal(
      $("[data-arch-node][data-node-index='1']").getAttribute("aria-current"),
      "step",
    );

    // 3. Click node 3 directly
    $("[data-arch-node][data-node-index='3']").click();
    assert.equal(
      $("[data-arch-node-title]").textContent,
      flow.scenarios[0].nodes[3].title,
    );
    assert.equal($("[data-arch-progress-bar]").style.width, "100%");

    // 4. Keyboard arrow navigation wraps to node 0
    $("[data-arch-node][data-node-index='3']").dispatchEvent(
      new dom.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
      }),
    );
    assert.equal(
      $("[data-arch-node-title]").textContent,
      flow.scenarios[0].nodes[0].title,
    );

    // 5. Switch scenario resets to node 0 of scenario 1
    $("[data-arch-scenario][data-scenario-index='1']").click();
    assert.equal(
      $("[data-arch-scenario][data-scenario-index='1']").getAttribute(
        "aria-pressed",
      ),
      "true",
    );
    assert.equal(
      $("[data-arch-scenario-badge]").textContent,
      flow.scenarios[1].badge,
    );
    assert.equal(
      $("[data-arch-node-title]").textContent,
      flow.scenarios[1].nodes[0].title,
    );
    assert.equal(
      $("[data-arch-invariant]").textContent,
      flow.scenarios[1].nodes[0].invariant,
    );

    // 6. Auto-trace toggles aria-pressed & stops on Reset / abort
    $("[data-arch-play]").click();
    assert.equal($("[data-arch-play]").getAttribute("aria-pressed"), "true");
    assert.equal($("[data-arch-play-text]").textContent, "Pause trace");

    $("[data-arch-reset]").click();
    assert.equal($("[data-arch-play]").getAttribute("aria-pressed"), "false");
    assert.equal($("[data-arch-play-text]").textContent, "Auto-trace");

    $("[data-arch-play]").click();
    controller.abort();
    assert.equal($("[data-arch-play]").getAttribute("aria-pressed"), "false");
  } finally {
    controller.abort();
    dom.window.close();
    for (const [key, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
