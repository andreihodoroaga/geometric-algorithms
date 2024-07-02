import { useRef, useEffect, useState } from "react";
import { VisualizationStep } from "../../shared/models/algorithm";
import { Point, convertPointBetweenAlgorithmAndCanvas } from "../../shared/models/geometry";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import VisualizationEngine, { ExplanationsExtraProps } from "../visualization-engine/VisualizationEngine";
import Graph from "./Graph";
import { computeTrapezoidalMapSteps } from "./trapezoidal-map-algorithm";
import "./TrapezoidalMap.scss";

const getCurrentTreeData = (steps: VisualizationStep[], currentStepIndex: number | null) => {
  if (currentStepIndex === null) {
    return null;
  }

  for (let i = Math.min(currentStepIndex, steps.length - 1); i > 0; i--) {
    const graphElement = steps[i].customElement;
    if (graphElement && graphElement.type === "graph") {
      return graphElement;
    }
  }
  return null;
};

export default function TrapezoidalMap() {
  const computeVisualizationSteps = (points: Point[], canvasDimensions: CanvasDimensions) => {
    const pointsForAlg = points.map(convertPointBetweenAlgorithmAndCanvas);
    return computeTrapezoidalMapSteps(pointsForAlg, canvasDimensions);
  };

  const GraphVisualizer = ({ steps, currentStepIndex }: ExplanationsExtraProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }, []);

    return (
      <div className="graph-visualizer" ref={containerRef}>
        <Graph treeData={getCurrentTreeData(steps, currentStepIndex)} svgWidth={containerWidth} svgHeight={600} />
      </div>
    );
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Harta trapezoidala"
      mode={CanvasMode.segments}
      ExplanationsExtra={GraphVisualizer}
    ></VisualizationEngine>
  );
}
