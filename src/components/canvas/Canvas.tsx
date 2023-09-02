import { Layer, Stage } from "react-konva";
import "./Canvas.scss";
import { useEffect, useState } from "react";
import OverlayText from "./overlay-text/OverlayText";
import { KonvaEventObject } from "konva/lib/Node";
import { distanceBetweenPoints, generateRandomNumber, getNextPointLetter } from "../../shared/util";
import { Point } from "../../shared/models/geometry";
import PointComponent from "./Point";
import { determineLowConvexHull } from "../convex-hull/convex-hull-algorithm";

// A reusable component to be used in every algorithm
export default function Canvas() {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [points, setPoints] = useState<Point[]>([]);
  const [showOverlayText, setShowOverlayText] = useState(true);

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

  const generateRandomPoints = () => {
    const points: Point[] = [];
    
    for (let i = 0; i < 10; i++) {
      const x = generateRandomNumber(20, canvasDimensions.width - 20);
      const y = generateRandomNumber(20, canvasDimensions.height - 20);
      const label = getNextPointLetter(points[i - 1] ? points[i - 1].label : "");
      points.push({ x, y, label });
    }

    console.log(points);
    // translate points to an axis with origin in the middle of the canvas
    console.log(determineLowConvexHull(points));
    
    
    setShowOverlayText(false);
    setPoints(points);
  };

  const addPoint = (e: KonvaEventObject<MouseEvent>) => {    
    const newPoint = {
      ...e.target.getStage()!.getPointerPosition(),
      label: getNextPointLetter(points.length > 0 ? points[points.length - 1].label : ""),
    } as Point;
    
    for (const point of points) {
      if (distanceBetweenPoints(point, newPoint) < 20)
        return;
    }

    setShowOverlayText(false);
    setPoints((prevPoints) => [
      ...prevPoints,
      newPoint,
    ]);
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
            <PointComponent point={point} key={point.x.toString() + point.y.toString()}/>
          ))}
        </Layer>
      </Stage>
      {showOverlayText && (
        <OverlayText generateRandomPoints={generateRandomPoints} />
      )}
    </div>
  );
}
