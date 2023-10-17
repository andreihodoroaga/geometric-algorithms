import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import { ILine, Point, pointsArray } from "../../shared/models/geometry";
import { GREY_COLOR, distanceBetweenPoints, generateRandomNumber, getLinesFromPoints, getNextPointLetter } from "../../shared/util";
import "./Canvas.scss";
import PointComponent from "./Point";
import OverlayText from "./overlay-text/OverlayText";
import { find, isEqual, uniqueId } from "lodash";
import LineComponent from "./Line";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";

interface CanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  lines: ILine[];
  setLines: React.Dispatch<React.SetStateAction<ILine[]>>;
  polygonMode?: boolean;
}

export default function Canvas({ points, setPoints, lines, setLines, polygonMode }: CanvasProps) {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showOverlayText, setShowOverlayText] = useState(true);
  const [closedPolygon, setClosedPolygon] = useState(false);

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
    return points;
  };

  const generateRandomPolygon = () => {
    const points = generateRandomPoints();
    setLines(getLinesFromPoints(points, GREY_COLOR, true));
  }

  const addPolygonLine = (newPoint: Point) => {
    const lastPoint = points[points.length - 1];
    const nextPoint = checkClosePoint(newPoint) ?? newPoint;    

    if (find(points, point => point.label === nextPoint.label)) {
      if (!isEqual(nextPoint, points[0])) {
        return;
      }
      setClosedPolygon(true);
    }

    const newLine: ILine = {
      points: pointsArray(lastPoint, nextPoint),
      color: GREY_COLOR,
    };
    setLines((prevLines) => [...prevLines, newLine]);
  };

  const checkClosePoint = (newPoint: Point) => {
    for (const point of points) {
      if (distanceBetweenPoints(point, newPoint) < 20) {
        return point;
      }
    }
    return null;
  };

  const getNextPoint = (position: Vector2d) => {
    return {
      ...position,
      label: getNextPointLetter(points.length > 0 ? points[points.length - 1].label : ""),
      color: GREY_COLOR,
    } as Point;
  };

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    if (closedPolygon) {
      return;
    }

    const newPoint = getNextPoint(e.target.getStage()!.getPointerPosition()!);

    if (polygonMode && points.length > 0) {
      addPolygonLine(newPoint);
    }
    if (checkClosePoint(newPoint)) {
      return;
    }

    setShowOverlayText(false);
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  return (
    <div className="canvas-component">
      <Stage width={canvasDimensions.width} height={canvasDimensions.height} onClick={(e) => handleCanvasClick(e)}>
        <Layer>
          {points.map((point) => (
            <PointComponent point={point} key={uniqueId()} />
          ))}
          {lines.map((line) => (
            <LineComponent line={line} key={uniqueId()} />
          ))}
        </Layer>
      </Stage>
      {showOverlayText && <OverlayText polygonMode={polygonMode} generate={polygonMode ? generateRandomPolygon : generateRandomPoints} />}
    </div>
  );
}
