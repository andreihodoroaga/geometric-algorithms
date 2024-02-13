import { Point } from "../../shared/models/geometry";
import { CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { computeTrapezoidalMapSteps } from "./trapezoidal-map-algorithm";

export default function TrapezoidalMap() {
  const computeVisualizationSteps = (points: Point[]) => {
    return computeTrapezoidalMapSteps(points);
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Harta trapezoidala"
      mode={CanvasMode.segments}
    >
    </VisualizationEngine>
  );
}
