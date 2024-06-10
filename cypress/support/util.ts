export const captureNextSnapshotUntilFinalized = (
  imageBaseName: string,
  imgIndex: number,
  step?: number,
  earlyStopSteps?: number
) => {
  cy.get("body").then(($body) => {
    if (earlyStopSteps && imgIndex >= earlyStopSteps) {
      return;
    }
    if ($body.find(".custom-button:contains('Finalizat')").length > 0) {
      cy.get(".custom-button").contains("Finalizat").should("be.visible");
    } else {
      if (!step) {
        cy.get("canvas").compareSnapshot(`${imageBaseName}-${imgIndex}`);
      } else if (imgIndex % step === 0) {
        cy.get("canvas").compareSnapshot(`${imageBaseName}-${imgIndex / step}`);
      }
      cy.get(".custom-button").contains("Next").click();
      imgIndex++;
      captureNextSnapshotUntilFinalized(imageBaseName, imgIndex, step, earlyStopSteps);
    }
  });
};

export const startAlgoritmInManualMode = () => {
  cy.get(".custom-button.dropdown").contains("Automat").click();
  cy.get("li").contains("Manual").click();
  cy.get(".custom-button").contains("Start").click();
};
