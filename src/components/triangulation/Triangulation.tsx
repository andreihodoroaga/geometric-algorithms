import "./Triangulation.scss";
import { VisualizationStep } from "../../shared/models/algorithm";
import { Point } from "../../shared/models/geometry";
import { determinePointsForAlgorithm } from "../../shared/util";
import { CanvasMode } from "../canvas/helpers";
import VisualizationEngine, { ExplanationsExtraProps } from "../visualization-engine/VisualizationEngine";
import Stack from "./Stack";
import { checkValidPolygon, computeTriangulationSteps, isPolygonMonotone } from "./triangulation-algorithm";

const getLastStackStatus = (steps: VisualizationStep[], currentStepIndex: number | null) => {
  if (!currentStepIndex) {
    return [];
  }

  for (let i = currentStepIndex; i >= 0; i--) {
    if (currentStepIndex === steps.length) {
      return [];
    }
    const stackStep = steps[i].graphicDrawingsStepList?.find((el) => el.type === "stackStatus");
    if (stackStep) {
      return stackStep.element.map((el: Point) => el.label);
    }
  }
  return [];
};

export default function Triangulation() {
  // Returns the visualization steps or an error
  const computeVisualizationSteps = (points: Point[]) => {
    const pointsForAlgorithm = determinePointsForAlgorithm(points);
    if (!checkValidPolygon(points)) {
      return "Punctele nu formeaza un poligon valid!";
    }
    if (!isPolygonMonotone(pointsForAlgorithm, "y")) {
      return "Poligonul nu e y-monoton!";
    }
    const visualizationSteps = computeTriangulationSteps(pointsForAlgorithm);
    return visualizationSteps;
  };

  const extraExplanation = ({ steps, currentStepIndex }: ExplanationsExtraProps) => {
    return <Stack elements={getLastStackStatus(steps, currentStepIndex)} />;
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Triangulare"
      mode={CanvasMode.polygon}
      ExplanationsExtra={extraExplanation}
    ></VisualizationEngine>
  );
}
