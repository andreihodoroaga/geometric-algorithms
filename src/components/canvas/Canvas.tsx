import { KonvaEventObject } from "konva/lib/Node";
import { useCallback, useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import { Point } from "../../shared/models/geometry";
import {
  distanceBetweenPoints,
  generateRandomNumber,
  getNextPointLetter,
} from "../../shared/util";
import "./Canvas.scss";
import PointComponent from "./Point";
import OverlayText from "./overlay-text/OverlayText";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";

interface CanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  visualizationSteps: VisualizationStep[];
}

// A reusable component to be used in every algorithm
export default function Canvas({
  points,
  setPoints,
  visualizationSteps,
}: CanvasProps) {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showOverlayText, setShowOverlayText] = useState(true);
  const [explanations, setExplanations] = useState<string[]>([]);

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
    // it is usually dangerous to call functions from "outside" useEffect, but useCallback should do the trick
    showVisualizationSteps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizationSteps]);

  const showVisualizationSteps = useCallback(() => {
    visualizationSteps.forEach((step) => {
      setExplanations([...explanations, step.explanation]);
      addStepDrawings(step.graphicDrawingsStepList);
    });
  }, [visualizationSteps, explanations]);

  const addStepDrawings = (drawings: Drawing[]) => {
    console.log(drawings);

    // do smth with each drawing
  };

  const generateRandomPoints = () => {
    const points: Point[] = [];

    for (let i = 0; i < 10; i++) {
      const x = generateRandomNumber(20, canvasDimensions.width - 20);
      const y = generateRandomNumber(20, canvasDimensions.height - 20);
      const label = getNextPointLetter(
        points[i - 1] ? points[i - 1].label : ""
      );
      points.push({ x, y, label });
    }

    setShowOverlayText(false);
    setPoints(points);
  };

  const addPoint = (e: KonvaEventObject<MouseEvent>) => {
    const newPoint = {
      ...e.target.getStage()!.getPointerPosition(),
      label: getNextPointLetter(
        points.length > 0 ? points[points.length - 1].label : ""
      ),
    } as Point;

    for (const point of points) {
      if (distanceBetweenPoints(point, newPoint) < 20) return;
    }

    setShowOverlayText(false);
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  return (
    <div className="canvas-component">
      <Stage
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onClick={(e) => addPoint(e)}
      >
        <Layer>
          {points.map((point) => (
            <PointComponent
              point={point}
              key={point.x.toString() + point.y.toString()}
            />
          ))}
        </Layer>
      </Stage>
      {showOverlayText && (
        <OverlayText generateRandomPoints={generateRandomPoints} />
      )}
    </div>
  );
}
