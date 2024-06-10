import { captureNextSnapshotUntilFinalized, startAlgoritmInManualMode } from "../support/util.ts";

const runBasicTest = (algorithmName: string) => {
  cy.get("canvas").click(50, 10);
  cy.get("canvas").click(45, 50);
  cy.get("canvas").click(5, 100);
  cy.get("canvas").click(75, 75);
  cy.get("canvas").click(100, 100);

  cy.get(".custom-button.algorithm-selector").click();
  cy.get("li").contains(algorithmName).click();

  startAlgoritmInManualMode();
  captureNextSnapshotUntilFinalized(algorithmName, 0);
};

describe("Convex hull", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/geometric-algorithms/convex-hull");
  });

  it("tests a basic scenario for Graham Scan", () => {
    runBasicTest("Graham Scan");
  });

  it("tests a basic scenario for Jarvis March", () => {
    runBasicTest("Jarvis March");
  });

  // NOTE: chan's algorithm uses the same colors for the same 5 groups the next are randomly generated.
  // not a problem when there are 5 points like the base scenario, but could be if there are more points
  it("tests a basic scenario for Chan", () => {
    runBasicTest("Chan");
  });
});
