import { Point } from "../../shared/models/geometry";
import { determinePointsForAlgorithm } from "../../shared/util";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import {
  checkValidPolygon,
  checkYMonotone,
  computeTriangulationSteps,
  isPolygonMonotone,
} from "./triangulation-algorithm";

export default function Triangulation() {
  const computeVisualizationSteps = (points: Point[]) => {
    const pointsForAlgorithm = determinePointsForAlgorithm(points);
    const visualizationSteps = computeTriangulationSteps(pointsForAlgorithm);
    console.log("Is polygon valid: ", checkValidPolygon(points));
    console.log("Is polygon x-monotone: ", isPolygonMonotone(pointsForAlgorithm, "x"));
    console.log("Is polygon y-monotone: ", isPolygonMonotone(pointsForAlgorithm, "y"));
    console.log("Is polygon y-monotone v2: ", checkYMonotone(pointsForAlgorithm, [], []));
    console.log(visualizationSteps);
    return visualizationSteps;
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Triangulare"
      polygonMode={true}
    >
    </VisualizationEngine>
  );
}
