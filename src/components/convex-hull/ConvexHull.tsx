import { useState } from "react";
import Canvas from "../canvas/Canvas";
import "./convex-hull.scss";
import { Point } from "../../shared/models/geometry";
import { comparatorPointsByXAscending, sortList } from "../../shared/util";
import { determineConvexHullPart } from "./convex-hull-algorithm";

export default function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);

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

  const computeVisualizationSteps = () => {
    const pointsForAlgorithm = determinePointsForAlgorithm(points);
    const sortedPointsForAlgorithm = sortList(pointsForAlgorithm, comparatorPointsByXAscending);

    const lowerConvexHullSteps = determineConvexHullPart(sortedPointsForAlgorithm, "lower");
    const upperConvexHullSteps = determineConvexHullPart(sortedPointsForAlgorithm, "upper");
    return [...lowerConvexHullSteps, ...upperConvexHullSteps];
  };

  return (
    <>
      <div className="canvas-wrapper">
        <Canvas points={points} setPoints={setPoints} computeVisualizationSteps={computeVisualizationSteps} />
      </div>
    </>
  );
}
