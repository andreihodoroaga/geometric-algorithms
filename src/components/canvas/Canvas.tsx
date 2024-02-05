import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import { ILine, Point } from "../../shared/models/geometry";
import {
  GREY_COLOR,
  distanceBetweenPoints,
  generateRandomNumber,
  getLinesFromPoints,
  getNextPointLetter,
} from "../../shared/util";
import "./Canvas.scss";
import PointComponent from "./Point";
import OverlayText from "./overlay-text/OverlayText";
import { find, isEqual, uniqueId } from "lodash";
import LineComponent from "./Line";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { CanvasDimensions, getAxesLines, getAxesBoundaryPoints, getCenteredPoint } from "./helpers";

interface CanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  lines: ILine[];
  setLines: React.Dispatch<React.SetStateAction<ILine[]>>;
  polygonMode?: boolean;
  hasOverlayText?: boolean;
  axes?: boolean;
  originInCenter?: boolean;
  disabled?: boolean;
  axisMultiplier?: number;
  shouldReset?: boolean;
  onReset?: () => void;
}

export default function Canvas({
  points,
  setPoints,
  lines,
  setLines,
  polygonMode,
  hasOverlayText = true,
  axes = false,
  originInCenter = false,
  disabled = false,
  axisMultiplier,
  shouldReset,
  onReset,
}: CanvasProps) {
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: 0,
  });
  const [showOverlayText, setShowOverlayText] = useState(hasOverlayText);
  const [closedPolygon, setClosedPolygon] = useState(false);
  const [axesLines, setAxesLines] = useState<ILine[]>([]);
  const [axesPoints, setAxesPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (shouldReset && onReset) {
      setShowOverlayText(true);
      setPoints([]);
      setLines([]);
      onReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReset])

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

  // There is an implicit assumption that if the axes are shown, then
  // the origin is in the middle (aka originInCenter=true) and axisMultiplier is set
  useEffect(() => {
    if (!axisMultiplier) {
      return;
    }
    if (axes) {
      setAxesLines(getAxesLines(canvasDimensions));
      setAxesPoints(getAxesBoundaryPoints(canvasDimensions, axisMultiplier));
    } else {
      setAxesLines([]);
    }
  }, [canvasDimensions, axes, axisMultiplier]);

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
  };

  const addPolygonLine = (newPoint: Point) => {
    const lastPoint = points[points.length - 1];
    const nextPoint = checkClosePoint(newPoint) ?? newPoint;

    if (find(points, (point) => point.label === nextPoint.label)) {
      if (!isEqual(nextPoint, points[0])) {
        return;
      }
      setClosedPolygon(true);
    }

    const newLine: ILine = {
      startPoint: lastPoint,
      endPoint: nextPoint,
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
    if (closedPolygon || disabled) {
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

  const getCenteredPoints = (points: Point[]) => {
    return points.map((point) => getCenteredPoint(point, canvasDimensions));
  };

  const getPointsToShow = () => {
    const pointsToShow = originInCenter ? getCenteredPoints(points) : points;
    return pointsToShow.map((point) => <PointComponent point={point} key={uniqueId()} />);
  };

  const getCenteredLines = (lines: ILine[]) => {
    return lines.map((line) => ({
      ...line,
      startPoint: getCenteredPoint(line.startPoint, canvasDimensions),
      endPoint: getCenteredPoint(line.endPoint, canvasDimensions),
    }));
  };

  const getLinesToShow = () => {
    const linesToShow = originInCenter ? getCenteredLines(lines) : lines;
    return linesToShow.map((line) => <LineComponent line={line} key={uniqueId()} />);
  };

  return (
    <div className="canvas-component">
      <Stage width={canvasDimensions.width} height={canvasDimensions.height} onClick={(e) => handleCanvasClick(e)}>
        <Layer>
          {axesPoints.map((point) => (
            <PointComponent point={point} key={uniqueId()} />
          ))}
          {axesLines.map((line) => (
            <LineComponent line={line} key={uniqueId()} />
          ))}
          {getPointsToShow()}
          {getLinesToShow()}
        </Layer>
      </Stage>
      {showOverlayText && (
        <OverlayText polygonMode={polygonMode} generate={polygonMode ? generateRandomPolygon : generateRandomPoints} />
      )}
    </div>
  );
}
