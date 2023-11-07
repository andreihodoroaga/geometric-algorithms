import { useEffect, useState } from "react";
import {
  DEFAULT_POINT_SIZE,
  ILine,
  Point,
  convertPointBetweenAlgorithmAndCanvas,
  defaultDash,
} from "../../shared/models/geometry";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import { GREEN_COLOR, GREY_COLOR, ORANGE_COLOR, getLinesFromPoints, timeout } from "../../shared/util";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import Button from "../button/Button";

interface VisualizationEngineProps {
  computeVisualizationSteps: (points: Point[]) => VisualizationStep[];
  explanationsTitle: string;
  children: React.ReactNode;
  polygonMode?: boolean;
}

// A reusable component to be used in every algorithm
export default function VisualizationEngine({
  computeVisualizationSteps,
  explanationsTitle,
  children,
  polygonMode,
}: VisualizationEngineProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<ILine[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [algorithmStarted, setAlgorithmStarted] = useState(false);

  useEffect(() => {
    if (algorithmStarted) {
      startAlgorithm();
    }
  }, [algorithmStarted]);

  const addStepDrawings = (drawings: Drawing[]) => {
    for (const drawing of drawings) {
      const { type, element, style, color, size } = drawing;

      switch (type) {
        case "updateNumber":
          // element = the number of points in the convex hull
          break;
        case "updateConvexHullList": {
          convexHullUpdatedHandler(element as Point[]);
          break;
        }
        case "line": {
          let [startPoint, endPoint] = element as Point[];
          startPoint = convertPointBetweenAlgorithmAndCanvas(startPoint);
          endPoint = convertPointBetweenAlgorithmAndCanvas(endPoint);
          const newLine: ILine = {
            startPoint,
            endPoint,
            color: color!,
            ...(style === "dash" && { dash: defaultDash }),
          };
          setLines((prevLines) => [...prevLines, newLine]);
          break;
        }
        case "point": {
          const canvasPoint = convertPointBetweenAlgorithmAndCanvas(element as Point);
          updatePointStyle(canvasPoint, color!, size);
          break;
        }
        case "finalStep": {
          element.forEach((point: Point) => updatePointStyle(point, GREEN_COLOR));
          setLines(getLinesFromPoints(element, GREEN_COLOR));
          break;
        }
        default:
          break;
      }
    }
  };

  const updatePointStyle = (point: Point, color: string, size?: number) => {
    const newPoint = { ...point, color, size: size ? size : point.size };
    setPoints((points) => {
      const pointIndex = points.findIndex((p) => p.label === point.label);
      const updatedPoints = [...points];
      updatedPoints[pointIndex] = newPoint;

      return updatedPoints;
    });
  };

  const resetAllPointsColor = () => {
    setPoints((points) =>
      points.map((point) => ({
        ...point,
        color: GREY_COLOR,
      }))
    );
  };

  const convexHullUpdatedHandler = (newConvexHullPoints: Point[]) => {
    resetAllPointsColor();

    const canvasPoints = [];
    for (const point of newConvexHullPoints) {
      const canvasPoint = convertPointBetweenAlgorithmAndCanvas(point);
      canvasPoints.push(canvasPoint);
      const currentPoint = points.find((p) => p.label === canvasPoint.label);
      if (currentPoint?.color !== GREEN_COLOR) {
        updatePointStyle(canvasPoint, GREEN_COLOR);
      }
    }

    setLines(getLinesFromPoints(canvasPoints, GREEN_COLOR));
  };

  const cleanUpCanvas = () => {
    setPoints((points) =>
      points.map((p) => ({
        ...p,
        color: p.color === GREEN_COLOR || p.color === ORANGE_COLOR ? p.color : GREY_COLOR,
        size: DEFAULT_POINT_SIZE,
      }))
    );

    setLines((prevLines) =>
      prevLines
        .filter((l) => l.color === GREEN_COLOR || l.color === ORANGE_COLOR)
        .map((l) => (l.dash ? l : { ...l, dash: [] }))
    );
  };

  const startAlgorithm = async () => {
    const steps = computeVisualizationSteps(points);

    for (const step of steps) {
      setExplanations((explanations) => [...explanations, step.explanation]);
      // at every new step we should keep on the canvas only some points / lines
      // for now, keeping only the green points and lines + orange points (jarvis march) should do
      cleanUpCanvas();
      if (step.graphicDrawingsStepList) {
        addStepDrawings(step.graphicDrawingsStepList);
      }
      await timeout(1000);
    }
  };

  return (
    <>
      <div className="canvas-wrapper">
        <Canvas points={points} setPoints={setPoints} lines={lines} setLines={setLines} polygonMode={polygonMode} />
      </div>
      <div className="explanations-wrapper">
        <Explanations explanations={explanations} algorithm={explanationsTitle} />
      </div>
      <div className="panel-wrapper">
        {children}
        <Button onClick={() => setAlgorithmStarted(true)} content={"Start"} extraClass="primary" />
      </div>
    </>
  );
}
