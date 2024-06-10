const addPrimalPoint = (x: number, y: number) => {
  cy.get("#point-x").type(x.toString());
  cy.get("#point-y").type(y.toString());

  cy.get(".add-btn.add-point").click();
};

const addPrimalLine = (m: number, n: number) => {
  cy.get("#line-x").type(m.toString());
  cy.get("#line-y").type(n.toString());

  cy.get(".add-btn.add-line").click();
};

describe("Duality", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/geometric-algorithms/duality");
  });

  it("adds a point", () => {
    addPrimalPoint(2, 3);
    cy.compareSnapshot("test-1");
  });

  it("adds a line", () => {
    addPrimalLine(0, -1);
    cy.compareSnapshot("test-2");
  });

  it("adds a configuration of points and lines", () => {
    addPrimalPoint(0, 1);
    addPrimalPoint(-5, 7);
    addPrimalPoint(-4, -6);
    addPrimalLine(2, 3);
    addPrimalLine(-3, 4);
    addPrimalLine(13, 9);

    cy.compareSnapshot("test-3");
  });
});
