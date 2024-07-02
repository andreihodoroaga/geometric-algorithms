import "./Triangulation.scss";
import { VisualizationStep } from "../../shared/models/algorithm";
import { Axis, Point } from "../../shared/models/geometry";
import { determinePointsForAlgorithm } from "../../shared/util";
import { CanvasMode } from "../canvas/helpers";
import VisualizationEngine, { ExplanationsExtraProps } from "../visualization-engine/VisualizationEngine";
import Stack from "./Stack";
import { checkValidPolygon, computeTriangulationSteps, isPolygonMonotone } from "./triangulation-algorithm";
import { Menu, MenuItem } from "@szhsin/react-menu";
import Button from "../button/Button";
import { useState } from "react";

const getLastStackStatus = (steps: VisualizationStep[], currentStepIndex: number | null) => {
  if (!currentStepIndex) {
    return [];
  }

  for (let i = currentStepIndex; i >= 0; i--) {
    if (currentStepIndex === steps.length) {
      return [];
    }
    const stackStep = steps[i].customElement;
    if (stackStep && stackStep.type === "stackStatus") {
      return stackStep.stackPoints.map((el: Point) => el.label);
    }
  }
  return [];
};

export default function Triangulation() {
  const [selectedPolygonType, setSelectedPolygonType] = useState(Axis.y);

  // Returns the visualization steps or an error
  const computeVisualizationSteps = (points: Point[]) => {
    const pointsForAlgorithm = determinePointsForAlgorithm(points);
    if (points.length < 3) {
      throw new Error("Este nevoie de minim 2 puncte pentru a determina triangularea.");
    }
    if (!checkValidPolygon(points)) {
      throw new Error("Punctele nu formeaza un poligon valid!");
    }
    if (!isPolygonMonotone(pointsForAlgorithm, selectedPolygonType)) {
      throw new Error(`Poligonul nu e ${selectedPolygonType}-monoton!`);
    }
    const visualizationSteps = computeTriangulationSteps(pointsForAlgorithm, selectedPolygonType);
    return visualizationSteps;
  };

  const extraExplanation = ({ steps, currentStepIndex }: ExplanationsExtraProps) => {
    return <Stack elements={getLastStackStatus(steps, currentStepIndex)} />;
  };

  const PolygonTypeSelector = () => (
    <Menu
      menuButton={
        <Button
          content={`${selectedPolygonType}-monoton`}
          dropdownBtn={true}
          tooltip="Tipul de poligon"
          showTooltip={true}
        />
      }
      transition
    >
      {Object.values(Axis).map((axis) => (
        <MenuItem
          key={axis}
          className={axis === selectedPolygonType ? "active" : ""}
          onClick={() => setSelectedPolygonType(axis)}
        >
          {`${axis}-monoton`}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Triangulare"
      mode={selectedPolygonType === Axis.x ? CanvasMode.xMonotonePolygon : CanvasMode.yMonotonePolygon}
      ExplanationsExtra={extraExplanation}
    >
      <PolygonTypeSelector />
    </VisualizationEngine>
  );
}
