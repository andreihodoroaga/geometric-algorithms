import { useState } from "react";
import Canvas from "../canvas/Canvas";
import "./convex-hull.scss";
import { Point } from "../../shared/models/geometry";
import { comparatorPointsByXAscending, sortList } from "../../shared/util";
import { determineLowConvexHull } from "./convex-hull-algorithm";
import { VisualizationStep } from "../../shared/models/algorithm";

export default function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);
  const [lowConvexHullSteps, setLowConvexHullSteps] = useState<
    VisualizationStep[]
  >([]);

  // points for canvas: origin in top left (and y increasing as you go down)
  // points for algorithm: origin in bottom left (so the alg. gets the points as we see them)
  const determinePointsForAlgorithm = (points: Point[]) => {
    const newPoints: Point[] = [];

    points.forEach((point) => {
      const newPoint = {
        ...point,
        y: -point.y,
      };
      newPoints.push(newPoint);
    });

    return newPoints;
  };

  const startAlgorithm = () => {
    const pointsForAlgorithm = determinePointsForAlgorithm(points);
    const sortedPointsForAlgorithm = sortList(
      pointsForAlgorithm,
      comparatorPointsByXAscending
    );

    setLowConvexHullSteps(determineLowConvexHull(sortedPointsForAlgorithm));
  };

  return (
    <>
      <div className="canvas-wrapper">
        <Canvas
          points={points}
          setPoints={setPoints}
          visualizationSteps={lowConvexHullSteps}
        />
        <button onClick={startAlgorithm}>Start Graham Scan</button>
      </div>
    </>
  );
}
