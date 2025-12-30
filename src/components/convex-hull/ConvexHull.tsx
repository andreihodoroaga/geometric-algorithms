import "./ConvexHull.scss";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

import { useState } from "react";

import { Menu, MenuItem } from "@szhsin/react-menu";

import { Point } from "../../shared/models/geometry";
import { comparatorPointsByXAscending, determinePointsForAlgorithm, sortList } from "../../shared/util";
import Button from "../button/Button";
import { CanvasMode } from "../canvas/helpers";
import VisualizationEngine from "../visualization-engine/VisualizationEngine";
import {
  computeChanExecutionSteps,
  computeGrahamScanSteps,
  computeJarvisMarchExecutionSteps,
} from "./convex-hull-algorithm";
import { useLanguage } from "../../shared/i18n";

enum ConvexHullAlgorithms {
  GrahamScan = "Graham Scan",
  JarvisMarch = "Jarvis March",
  Chan = "Chan",
}

export default function ConvexHull() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(ConvexHullAlgorithms.GrahamScan);
  const { t, language } = useLanguage();

  const computeVisualizationSteps = (points: Point[]) => {
    if (points.length < 2) {
      throw new Error(t("needAtLeast2Points"));
    }
    const pointsForAlgorithm = determinePointsForAlgorithm(points);

    if (selectedAlgorithm === ConvexHullAlgorithms.GrahamScan) {
      const sortedPointsForAlgorithm = sortList(pointsForAlgorithm, comparatorPointsByXAscending);
      return computeGrahamScanSteps(sortedPointsForAlgorithm, language);
    } else if (selectedAlgorithm === ConvexHullAlgorithms.JarvisMarch) {
      return computeJarvisMarchExecutionSteps(pointsForAlgorithm, language);
    }
    return computeChanExecutionSteps(pointsForAlgorithm, language);
  };

  return (
    <VisualizationEngine
      computeVisualizationSteps={computeVisualizationSteps}
      explanationsTitle={selectedAlgorithm}
      mode={CanvasMode.points}
    >
      <Menu
        menuButton={
          <Button
            content={selectedAlgorithm}
            dropdownBtn={true}
            extraClass="algorithm-selector"
            tooltip={t("algorithm")}
            showTooltip={true}
          />
        }
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
