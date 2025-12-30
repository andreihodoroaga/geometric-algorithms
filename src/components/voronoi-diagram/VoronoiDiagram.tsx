import { Point, convertPointBetweenAlgorithmAndCanvas } from "../../shared/models/geometry";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { Orientation, computeFortuneAlgorithmSteps } from "./fortune-algorithm";
import Button from "../button/Button";
import { useState } from "react";
import { Menu, MenuItem } from "@szhsin/react-menu";
import { useLanguage } from "../../shared/i18n";

const LS_ORIENTATION_KEY = "Voronoi_Orientation";

export default function VoronoiDiagram() {
  const [orientation, setOrientation] = useState<Orientation>(
    (localStorage.getItem(LS_ORIENTATION_KEY) as Orientation) ?? Orientation.Vertical
  );
  const { t, language } = useLanguage();

  const computeVisualizationSteps = (points: Point[], canvasDimensions: CanvasDimensions) => {
    const pointsForAlg = points.map((p) => convertPointBetweenAlgorithmAndCanvas(p));
    return computeFortuneAlgorithmSteps(pointsForAlg, canvasDimensions, orientation, language);
  };

  const setOrientationInLS = (or: Orientation) => {
    setOrientation(or);
    localStorage.setItem(LS_ORIENTATION_KEY, or);
  };

  const getOrientationLabel = (or: Orientation) => {
    return or === Orientation.Vertical ? t("vertical") : t("horizontal");
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
            content={getOrientationLabel(orientation)}
            dropdownBtn={true}
            tooltip={t("sweepLineOrientation")}
            showTooltip={true}
          />
        }
        transition
      >
        {Object.values(Orientation).map((or) => (
          <MenuItem key={or} className={or === orientation ? "active" : ""} onClick={() => setOrientationInLS(or)}>
            {getOrientationLabel(or)}
          </MenuItem>
        ))}
      </Menu>
    </VisualizationEngine>
  );
}
