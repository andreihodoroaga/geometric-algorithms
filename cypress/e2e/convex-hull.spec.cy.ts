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

  // TODO: jarvis march chooses the pivot point randomly so the test fails
  xit("tests a basic scenario for Jarvis March", () => {
    runBasicTest("Jarvis March");
  });

  // TODO: chan also involves randomness (it shuffles the array of points)
  // NOTE: chan's algorithm uses the same colors for the same 5 groups the next are randomly generated.
  // not a problem when there are 5 points like the base scenario, but could be if there are more points
  xit("tests a basic scenario for Chan", () => {
    runBasicTest("Chan");
  });
});
