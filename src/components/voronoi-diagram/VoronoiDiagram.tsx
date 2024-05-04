import { Point, convertPointBetweenAlgorithmAndCanvas } from "../../shared/models/geometry";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { computeFortuneAlgorithmSteps } from "./fortune-algorithm";

export default function VoronoiDiagram() {
  const computeVisualizationSteps = (points: Point[], canvasDimensions: CanvasDimensions) => {
    const pointsForAlg = points.map((p) => convertPointBetweenAlgorithmAndCanvas(p));
    return computeFortuneAlgorithmSteps(pointsForAlg, canvasDimensions);
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Fortune"
      mode={CanvasMode.points}
      minAlgorithmSpeedInMs={15}
      speedUpdateStep={4}
    ></VisualizationEngine>
  );
}
