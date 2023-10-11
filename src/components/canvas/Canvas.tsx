import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import { ILine, Point } from "../../shared/models/geometry";
import { GREY_COLOR, distanceBetweenPoints, generateRandomNumber, getNextPointLetter } from "../../shared/util";
import "./Canvas.scss";
import PointComponent from "./Point";
import OverlayText from "./overlay-text/OverlayText";
import { uniqueId } from "lodash";
import LineComponent from "./Line";
import { KonvaEventObject } from "konva/lib/Node";

interface CanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  lines: ILine[];
}

export default function Canvas({ points, setPoints, lines }: CanvasProps) {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
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

  return (
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
  );
}
