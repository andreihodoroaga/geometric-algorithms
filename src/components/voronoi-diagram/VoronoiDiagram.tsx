import { Point, convertPointBetweenAlgorithmAndCanvas } from "../../shared/models/geometry";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { Orientation, computeFortuneAlgorithmSteps } from "./fortune-algorithm";
import Button from "../button/Button";
import { useState } from "react";
import { Menu, MenuItem } from "@szhsin/react-menu";

const LS_ORIENTATION_KEY = "Voronoi_Orientation";

export default function VoronoiDiagram() {
  const [orientation, setOrientation] = useState<Orientation>(
    (localStorage.getItem(LS_ORIENTATION_KEY) as Orientation) ?? Orientation.Vertical
  );

  const computeVisualizationSteps = (points: Point[], canvasDimensions: CanvasDimensions) => {
    const pointsForAlg = points.map((p) => convertPointBetweenAlgorithmAndCanvas(p));
    return computeFortuneAlgorithmSteps(pointsForAlg, canvasDimensions, orientation);
  };

  const setOrientationInLS = (or: Orientation) => {
    setOrientation(or);
    localStorage.setItem(LS_ORIENTATION_KEY, or);
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle="Fortune"
      mode={CanvasMode.points}
      minAlgorithmSpeedInMs={15}
      speedUpdateStep={4}
    >
      <Menu
        menuButton={
          <Button
            content={orientation}
            dropdownBtn={true}
            tooltip="Orientarea dreptei de baleiere"
            showTooltip={true}
          />
        }
        transition
      >
        {Object.values(Orientation).map((or) => (
          <MenuItem key={or} className={or === orientation ? "active" : ""} onClick={() => setOrientationInLS(or)}>
            {or}
          </MenuItem>
        ))}
      </Menu>
    </VisualizationEngine>
  );
}
