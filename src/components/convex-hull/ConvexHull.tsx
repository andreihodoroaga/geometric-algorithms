import { useState } from "react";
import Canvas from "../canvas/Canvas";
import "./ConvexHull.scss";
import { Point } from "../../shared/models/geometry";
import { comparatorPointsByXAscending, sortList } from "../../shared/util";
import { computeGrahamScanSteps } from "./convex-hull-algorithm";
import Explanations from "../explanations/Explanations";
import Button from "../button/Button";

export default function ConvexHull() {
  const [points, setPoints] = useState<Point[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [algorithmStarted, setAlgorithmStarted] = useState(false);

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

    const grahamScanSteps = computeGrahamScanSteps(sortedPointsForAlgorithm);
    return grahamScanSteps;
  };

  return (
    <>
      <div className="canvas-wrapper">
        <Canvas
          points={points}
          setPoints={setPoints}
          computeVisualizationSteps={computeVisualizationSteps}
          setExplanations={setExplanations}
          algorithmStarted={algorithmStarted}
        />
      </div>
      <div className="explanations-wrapper">
        <Explanations explanations={explanations} />
      </div>
      <div className="panel-wrapper">
        <Button onClick={() => setAlgorithmStarted(true)} content={"Start"} extraClass="primary" />
      </div>
    </>
  );
}
