import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { setupSkillsTopology } from "../src/scripts/skills-topology.ts";
import { buildSkillsTopology } from "../src/data/skills-topology.ts";
import { skills as enSkills } from "../src/i18n/locales/en/skills.ts";
import { projectCatalog } from "../src/data/projects.ts";
import { projectCopy as enProjectCopy } from "../src/i18n/locales/en/projects.ts";

function buildTopologyFixture() {
  const enProjects = projectCatalog.map((project) => ({
    ...project,
    tech: [...project.tech],
    ...enProjectCopy[project.id],
  }));
  const topology = buildSkillsTopology("en", enSkills, enProjects);
  const initialNode = topology.nodes[0];

  const html = `<!doctype html><html lang="en"><body>
    <section
      id="skills"
      data-skills-root
      data-all-skills-label="All domain skills"
    >
      <button type="button" data-skills-view-btn="grid" aria-pressed="true">Category Grid</button>
      <button type="button" data-skills-view-btn="topology" aria-pressed="false">Systems Topology</button>

      <div id="skills-grid-panel" data-skills-panel="grid"></div>
      <div id="skills-topology-panel" data-skills-panel="topology" hidden>
        <svg viewBox="0 0 960 520">
          ${topology.edges
            .map(
              (edge) =>
                `<line data-topo-edge data-from="${edge.from}" data-to="${edge.to}" data-active="false" />`,
            )
            .join("")}
          ${topology.nodes
            .map(
              (node) =>
                `<g role="button" tabindex="0" data-topo-node="${node.id}" data-state="idle" aria-current="false">${node.name}</g>`,
            )
            .join("")}
        </svg>

        <div>
          ${topology.nodes
            .map(
              (node) =>
                `<button type="button" data-topo-pill="${node.id}" aria-pressed="false">${node.name}</button>`,
            )
            .join("")}
        </div>

        <aside data-topo-inspector>
          <span data-topo-constellation>${initialNode.constellation}</span>
          <h3 data-topo-title>${initialNode.name}</h3>
          <p data-topo-desc>${initialNode.description}</p>
          <p data-topo-role>${initialNode.roleNote}</p>
          <a data-topo-evidence-link href="/en/search/?q=Languages&evidence=1" rel="nofollow">Search evidence</a>
          <div data-topo-skills></div>
          <div data-topo-connections></div>
          <div data-topo-projects></div>
          <p data-topo-empty hidden>No results yet.</p>
        </aside>
      </div>
    </section>
  </body></html>`;

  const dom = new JSDOM(html, { url: "https://example.test/en/" });
  const root = dom.window.document.querySelector("[data-skills-root]");
  root.dataset.topology = JSON.stringify(topology);
  root.dataset.categories = JSON.stringify({
    fullstack: "Fullstack",
    scientific: "Scientific Computing",
    ai: "AI & ML",
    frontend: "Frontend",
    backend: "Backend",
  });
  return { dom, root, topology };
}

test("skills topology toggles grid/topology views, highlights coupled edges, filters projects by skill, and navigates via keyboard", () => {
  const { dom, root, topology } = buildTopologyFixture();
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
  const $$ = (selector) => [...root.querySelectorAll(selector)];

  try {
    setupSkillsTopology(root, controller.signal);

    // 1. Starts in Grid view, initial domain is languages
    assert.equal($("[data-skills-panel='grid']").hidden, false);
    assert.equal($("[data-skills-panel='topology']").hidden, true);
    assert.equal(
      $("[data-topo-node='languages']").getAttribute("data-state"),
      "active",
    );

    // 2. Toggle to Systems Topology view
    $("[data-skills-view-btn='topology']").click();
    assert.equal($("[data-skills-panel='grid']").hidden, true);
    assert.equal($("[data-skills-panel='topology']").hidden, false);
    assert.equal(
      $("[data-skills-view-btn='topology']").getAttribute("aria-pressed"),
      "true",
    );

    // 3. Select 'databases' domain node via SVG click -> updates inspector, edges, neighbors, and projects
    $("[data-topo-node='databases']").dispatchEvent(
      new dom.window.MouseEvent("click", { bubbles: true }),
    );
    const databasesNode = topology.nodes.find((n) => n.id === "databases");
    assert.equal($("[data-topo-title]").textContent, databasesNode.name);
    assert.equal(
      $("[data-topo-node='databases']").getAttribute("data-state"),
      "active",
    );
    assert.equal(
      $("[data-topo-node='backend']").getAttribute("data-state"),
      "connected",
    );
    assert.equal(
      $("[data-topo-node='frontend']").getAttribute("data-state"),
      "dimmed",
    );
    assert.equal(
      $(
        "[data-topo-edge][data-from='backend'][data-to='databases']",
      ).getAttribute("data-active"),
      "true",
    );
    assert.equal(
      $(
        "[data-topo-edge][data-from='languages'][data-to='frontend']",
      ).getAttribute("data-active"),
      "false",
    );

    // Coupled domains include backend and devops
    const jumpIds = $$("[data-topo-jump]").map((el) =>
      el.getAttribute("data-topo-jump"),
    );
    assert.ok(jumpIds.includes("backend") && jumpIds.includes("devops"));

    // 4. Filter projects by individual skill ('SQLite' -> FluentTube & Reservas App)
    const sqliteBtn = $("[data-skill-filter='SQLite']");
    assert.ok(sqliteBtn, "SQLite skill filter button exists");
    sqliteBtn.click();
    const filteredProjectIds = $$("[data-topo-project-card]").map((el) =>
      el.getAttribute("data-topo-project-card"),
    );
    assert.deepEqual(filteredProjectIds, [
      "fluenttube",
      "reservation-microsystem",
    ]);
    assert.ok(
      $("[data-topo-evidence-link]").href.includes("q=SQLite"),
      "evidence link reflects selected skill query",
    );

    // 5. Clicking coupled domain jump button switches subsystem cleanly
    $("[data-topo-jump='backend']").click();
    assert.equal(
      $("[data-topo-node='backend']").getAttribute("data-state"),
      "active",
    );

    // 6. Keyboard ArrowRight from node 0 moves cleanly to node 1
    $("[data-topo-pill='languages']").click();
    $("[data-topo-node='languages']").dispatchEvent(
      new dom.window.KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
      }),
    );
    assert.equal(
      $(`[data-topo-node='${topology.nodes[1].id}']`).getAttribute(
        "data-state",
      ),
      "active",
    );

    // 7. Toggle back to Grid view
    $("[data-skills-view-btn='grid']").click();
    assert.equal($("[data-skills-panel='grid']").hidden, false);
    assert.equal($("[data-skills-panel='topology']").hidden, true);
  } finally {
    controller.abort();
    dom.window.close();
    for (const [key, descriptor] of originalGlobals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
