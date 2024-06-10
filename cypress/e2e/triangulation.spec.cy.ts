import { captureNextSnapshotUntilFinalized, startAlgoritmInManualMode } from "../support/util.ts";

describe("Triangulation", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/geometric-algorithms/triangulation");
  });

  it("tests a basic scenario for a y-monotone polygon", () => {
    cy.get("canvas").click(50, 10);
    cy.get("canvas").click(60, 40);
    cy.get("canvas").click(80, 65);
    cy.get("canvas").click(150, 110);
    cy.get("canvas").click(40, 150);
    cy.get("canvas").click(50, 10);

    startAlgoritmInManualMode();
    captureNextSnapshotUntilFinalized("y-monotone", 0);
  });
});
