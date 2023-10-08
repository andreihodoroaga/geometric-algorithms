import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import {
  DEFAULT_POINT_SIZE,
  ILine,
  Point,
  convertPointBetweenAlgorithmAndCanvas,
  defaultDash,
  pointsArray,
} from "../../shared/models/geometry";
import {
  GREEN_COLOR,
  GREY_COLOR,
  ORANGE_COLOR,
  distanceBetweenPoints,
  generateRandomNumber,
  getNextPointLetter,
  getPairsFromArray,
} from "../../shared/util";
import "./Canvas.scss";
import PointComponent from "./Point";
import OverlayText from "./overlay-text/OverlayText";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import { uniqueId } from "lodash";
import LineComponent from "./Line";

interface CanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  computeVisualizationSteps: () => VisualizationStep[];
  setExplanations: React.Dispatch<React.SetStateAction<string[]>>;
  algorithmStarted: boolean;
}

// A reusable component to be used in every algorithm
export default function Canvas({
  points,
  setPoints,
  computeVisualizationSteps,
  setExplanations,
  algorithmStarted,
}: CanvasProps) {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showOverlayText, setShowOverlayText] = useState(true);
  const [lines, setLines] = useState<ILine[]>([]);

  // Set the canvas width and height
  useEffect(() => {
    const handleResize = () => {
      const canvasParentElement = document.querySelector(".canvas-component");
      if (canvasParentElement) {
        const { width, height } = canvasParentElement.getBoundingClientRect();
        setCanvasDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (algorithmStarted) {
      startAlgorithm();
    }
  }, [algorithmStarted]);

  function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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
            points: pointsArray(startPoint, endPoint),
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
          setLines(getLinesFromPoints(element));
        }
      }
    }
  };

  const generateRandomPoints = () => {
    const points: Point[] = [];

    for (let i = 0; i < 10; i++) {
      const x = generateRandomNumber(20, canvasDimensions.width - 20);
      const y = generateRandomNumber(20, canvasDimensions.height - 20);
      const label = getNextPointLetter(points[i - 1] ? points[i - 1].label : "");
      points.push({ x, y, label, color: GREY_COLOR });
    }

    setShowOverlayText(false);
    setPoints(points);
  };

  const addPoint = (e: KonvaEventObject<MouseEvent>) => {
    const newPoint = {
      ...e.target.getStage()!.getPointerPosition(),
      label: getNextPointLetter(points.length > 0 ? points[points.length - 1].label : ""),
      color: GREY_COLOR,
    } as Point;

    for (const point of points) {
      if (distanceBetweenPoints(point, newPoint) < 20) return;
    }

    setShowOverlayText(false);
    setPoints((prevPoints) => [...prevPoints, newPoint]);
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

    setLines(getLinesFromPoints(canvasPoints));
  };

  const getLinesFromPoints = (points: Point[]) => {
    const pointPairs = getPairsFromArray(points);

    const lines = pointPairs.map(
      (pointPair) =>
        ({
          points: pointsArray(pointPair[0], pointPair[1]),
          color: GREEN_COLOR,
        } as ILine)
    );

    return lines;
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
    const steps = computeVisualizationSteps();

    for (const step of steps) {
      setExplanations((explanations) => [...explanations, step.explanation]);
      // at every new step we should keep on the canvas only some points / lines
      // for now, keeping only the green points and lines + orange points (jarvis march) should do
      cleanUpCanvas();
      addStepDrawings(step.graphicDrawingsStepList);
      await timeout(1000);
    }
  };

  return (
    <>
      <div className="canvas-component">
        <Stage width={canvasDimensions.width} height={canvasDimensions.height} onClick={(e) => addPoint(e)}>
          <Layer>
            {points.map((point) => (
              <PointComponent point={point} key={uniqueId()} />
            ))}
            {lines.map((line) => (
              <LineComponent line={line} key={uniqueId()} />
            ))}
          </Layer>
        </Stage>
        {showOverlayText && <OverlayText generateRandomPoints={generateRandomPoints} />}
      </div>
    </>
  );
}
