import { Point } from "../../shared/models/geometry";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";

export default function Triangulation() {

  const computeVisualizationSteps = (points: Point[]) => {
    return points && [];
  }

  return (
    <VisualizationEngine 
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Triangulare"
      polygonMode={true}
    >
    </VisualizationEngine>
  );
}
