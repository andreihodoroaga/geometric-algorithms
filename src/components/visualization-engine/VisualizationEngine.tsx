import { useEffect, useState } from "react";
import {
  DEFAULT_POINT_SIZE,
  ILine,
  Point,
  convertPointBetweenAlgorithmAndCanvas,
  defaultDash,
} from "../../shared/models/geometry";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import { GREEN_COLOR, GREY_COLOR, ORANGE_COLOR, getLinesFromPoints } from "../../shared/util";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import Button from "../button/Button";

// at each step only the green points and lines should remain
const clearPointsFromCanvas = (points: Point[]) => {
  return points.map((point) =>
    point.color === GREEN_COLOR
      ? point
      : {
          ...point,
          color: GREY_COLOR,
          size: DEFAULT_POINT_SIZE,
        }
  );
};

const clearLinesFromCanvas = (lines: ILine[]) => {
  return lines.map((line) =>
    [GREEN_COLOR, ORANGE_COLOR].includes(line.color)
      ? line
      : {
          ...line,
          color: GREY_COLOR,
        }
  );
};

interface VisualizationEngineProps {
  computeVisualizationSteps: (points: Point[]) => VisualizationStep[];
  explanationsTitle: string;
  children: React.ReactNode;
  polygonMode?: boolean;
}

// A component to be used in every algorithm
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
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [steps, setSteps] = useState<VisualizationStep[]>([]);

  useEffect(() => {
    if (algorithmStarted) {
      setAlgorithmStarted(false);
      setCurrentStepIndex(0);
      setSteps(computeVisualizationSteps(points));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmStarted]);

  useEffect(() => {
    if (currentStepIndex === null) {
      return;
    }

    if (currentStepIndex >= steps.length) {
      return;
    }
    const currentStep = steps[currentStepIndex!];

    async function drawCurrentStep() {
      if (currentStep.explanation) {
        setExplanations((explanations) => [...explanations, currentStep.explanation!]);
      }
      if (currentStep.graphicDrawingsStepList) {
        addStepDrawings(currentStep.graphicDrawingsStepList);
      }
    }
    drawCurrentStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  const addStepDrawings = (drawings: Drawing[]) => {
    setPoints(clearPointsFromCanvas(points));
    setLines(clearLinesFromCanvas(lines));

    for (const drawing of drawings) {
      const { type, element, style, color, size } = drawing;

      switch (type) {
        case "updateConvexHullList": {
          convexHullUpdatedHandler(element as Point[]);
          break;
        }
        case "line": {
          let [startPoint, endPoint] = element as Point[];
          startPoint = convertPointBetweenAlgorithmAndCanvas(startPoint);
          endPoint = convertPointBetweenAlgorithmAndCanvas(endPoint);
          addLine(startPoint, endPoint, color!, style === "dash");
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

  const addLine = (startPoint: Point, endPoint: Point, color: string, dash?: boolean) => {
    const newLine: ILine = {
      startPoint,
      endPoint,
      color: color!,
      ...(dash && { dash: defaultDash }),
    };
    setLines((prevLines) => [...prevLines, newLine]);
  };

  const updatePointStyle = (point: Point, color: string, size?: number) => {
    const newPoint = { ...point, color, size: size ?? DEFAULT_POINT_SIZE };
    setPoints((points) => {
      const pointIndex = points.findIndex((p) => p.label === point.label);
      const updatedPoints = [...points];
      updatedPoints[pointIndex] = newPoint;

      return updatedPoints;
    });
  };

  const convexHullUpdatedHandler = (newConvexHullPoints: Point[]) => {
    const canvasPoints = [];
    for (const point of newConvexHullPoints) {
      const canvasPoint = convertPointBetweenAlgorithmAndCanvas(point);
      canvasPoints.push(canvasPoint);
      updatePointStyle(canvasPoint, GREEN_COLOR);
    }

    setLines(getLinesFromPoints(canvasPoints, GREEN_COLOR));
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
        <Button onClick={() => setCurrentStepIndex((currIdx) => currIdx! + 1)} content={"Next"} extraClass="primary" />
      </div>
    </>
  );
}
