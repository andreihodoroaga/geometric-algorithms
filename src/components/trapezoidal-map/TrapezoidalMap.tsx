import { Point, convertPointBetweenAlgorithmAndCanvas } from "../../shared/models/geometry";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { computeTrapezoidalMapSteps } from "./trapezoidal-map-algorithm";

export default function TrapezoidalMap() {
  const computeVisualizationSteps = (points: Point[], canvasDimensions: CanvasDimensions) => {
    const pointsForAlg = points.map(convertPointBetweenAlgorithmAndCanvas);
    return computeTrapezoidalMapSteps(pointsForAlg, canvasDimensions);
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Harta trapezoidala"
      mode={CanvasMode.segments}
    ></VisualizationEngine>
  );
}
