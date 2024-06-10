import { captureNextSnapshotUntilFinalized, startAlgoritmInManualMode } from "../support/util.ts";

describe("Voronoi Diagram", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/geometric-algorithms/voronoi-diagram");
  });

  it("tests a basic scenario for the voronoi diagram", () => {
    cy.get("canvas").click(90, 30);
    cy.get("canvas").click(10, 90);
    cy.get("canvas").click(55, 150);
    cy.get("canvas").click(140, 70);
    cy.get("canvas").click(200, 85);
    cy.get("canvas").click(230, 120);

    startAlgoritmInManualMode();
    captureNextSnapshotUntilFinalized("vertical-sweep", 0, 30, 250);
  });
});
