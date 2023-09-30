import { useState } from "react";
import Canvas from "../canvas/Canvas";
import "./ConvexHull.scss";
import { Point } from "../../shared/models/geometry";
import { comparatorPointsByXAscending, sortList } from "../../shared/util";
import { determineConvexHullPart } from "./convex-hull-algorithm";
import Explanations from "../explanations/Explanations";

export default function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);

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
    <div className="convex-hull-container">
      <div className="canvas-wrapper">
        <Canvas
          points={points}
          setPoints={setPoints}
          computeVisualizationSteps={computeVisualizationSteps}
          setExplanations={setExplanations}
        />
      </div>
      <div className="explanations-wrapper">
        <Explanations explanations={explanations} />
      </div>
    </div>
  );
}
