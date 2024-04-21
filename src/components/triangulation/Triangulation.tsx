import { Point } from "../../shared/models/geometry";
import { determinePointsForAlgorithm } from "../../shared/util";
import { CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { checkValidPolygon, computeTriangulationSteps, isPolygonMonotone } from "./triangulation-algorithm";

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

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Triangulare"
      mode={CanvasMode.polygon}
    >
    </VisualizationEngine>
  );
}
