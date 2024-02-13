import { useState } from "react";
import "./ConvexHull.scss";
import Button from "../button/Button";
import { Menu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { Point } from "../../shared/models/geometry";
import { comparatorPointsByXAscending, determinePointsForAlgorithm, sortList } from "../../shared/util";
import { computeGrahamScanSteps, computeJarvisMarchExecutionSteps } from "./convex-hull-algorithm";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import { CanvasMode } from "../canvas/helpers";

enum ConvexHullAlgorithms {
  GrahamScan = "Graham Scan",
  JarvisMarch = "Jarvis March",
}

export default function ConvexHull() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(ConvexHullAlgorithms.GrahamScan);

  const computeVisualizationSteps = (points: Point[]) => {
    const pointsForAlgorithm = determinePointsForAlgorithm(points);

    if (selectedAlgorithm === ConvexHullAlgorithms.GrahamScan) {
      const sortedPointsForAlgorithm = sortList(pointsForAlgorithm, comparatorPointsByXAscending);
      return computeGrahamScanSteps(sortedPointsForAlgorithm);
    }
    return computeJarvisMarchExecutionSteps(pointsForAlgorithm);
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle={selectedAlgorithm}
      mode={CanvasMode.points}
    >
      <Menu
        menuButton={<Button content={selectedAlgorithm} dropdownBtn={true} tooltip="Algoritm" showTooltip={true} />}
        transition
      >
        {Object.values(ConvexHullAlgorithms).map((algorithm) => (
          <MenuItem
            key={algorithm}
            className={algorithm === selectedAlgorithm ? "active" : ""}
            onClick={() => setSelectedAlgorithm(algorithm)}
          >
            {algorithm}
          </MenuItem>
        ))}
      </Menu>
    </VisualizationEngine>
  );
}
