import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import { ICircle, ILine, IParabola, Point } from "../../shared/models/geometry";
import { GREY_COLOR, distanceBetweenPoints, getLinesFromPoints, getNextPointLetter } from "../../shared/util";
import "./Canvas.scss";
import PointComponent from "./Point";
import OverlayText from "./overlay-text/OverlayText";
import { find, isEqual, uniqueId } from "lodash";
import LineComponent from "./Line";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import {
  CanvasDimensions,
  getAxesLines,
  getAxesBoundaryPoints,
  getCenteredPoint,
  generateNextRandomPoint,
  getRandomPointsMonotonePolygon,
  CanvasMode,
  generateRandomNonIntersectingSegments,
} from "./helpers";
import { MonotoneType } from "../triangulation/triangulation-algorithm";
import Parabola from "./Parabola";
import CircleComponent from "./Circle";

interface CanvasProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  lines: ILine[];
  setLines: React.Dispatch<React.SetStateAction<ILine[]>>;
  canvasDimensions: CanvasDimensions;
  setCanvasDimensions: React.Dispatch<React.SetStateAction<CanvasDimensions>>;
  parabolas?: IParabola[];
  setParabolas?: React.Dispatch<React.SetStateAction<IParabola[]>>;
  circles?: ICircle[];
  setCircles?: React.Dispatch<React.SetStateAction<ICircle[]>>;
  mode?: CanvasMode;
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
  canvasDimensions,
  setCanvasDimensions,
  parabolas,
  setParabolas,
  circles,
  setCircles,
  mode,
  hasOverlayText = true,
  axes = false,
  originInCenter = false,
  disabled = false,
  axisMultiplier,
  shouldReset,
  onReset,
}: CanvasProps) {
  const [showOverlayText, setShowOverlayText] = useState(hasOverlayText);
  const [closedPolygon, setClosedPolygon] = useState(false);
  const [axesLines, setAxesLines] = useState<ILine[]>([]);
  const [axesPoints, setAxesPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (shouldReset && onReset) {
      setShowOverlayText(true);
      setPoints([]);
      setLines([]);
      setCircles?.([]);
      setParabolas?.([]);
      setClosedPolygon(false);
      onReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReset]);

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
  }, [setCanvasDimensions]);

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
      points.push(generateNextRandomPoint(20, canvasDimensions.width - 20, 20, canvasDimensions.height - 20, points));
    }

    setShowOverlayText(false);
    setPoints(points);
  };

  const generateRandomMonotonePolygon = (type: MonotoneType = "y") => {
    const points = getRandomPointsMonotonePolygon(canvasDimensions, type);
    setShowOverlayText(false);
    setPoints(points);
    setLines(getLinesFromPoints(points, GREY_COLOR, true));
  };

  const generateRandomSegments = () => {
    const { points, segments } = generateRandomNonIntersectingSegments(canvasDimensions);
    setShowOverlayText(false);
    setPoints(points);
    setLines(segments);
  };

  const addSegmentOnCanvas = (newPoint: Point, forPolygon = false) => {
    const lastPoint = points[points.length - 1];
    const nextPoint = checkClosePoint(newPoint) ?? newPoint;

    if (forPolygon && find(points, (point) => point.label === nextPoint.label)) {
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

    if (mode === CanvasMode.polygon && points.length > 0) {
      addSegmentOnCanvas(newPoint, true);
    }
    if (mode === CanvasMode.segments && points.length % 2 == 1) {
      addSegmentOnCanvas(newPoint);
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

  const generateMethod =
    mode === CanvasMode.points
      ? generateRandomPoints
      : mode === CanvasMode.polygon
      ? generateRandomMonotonePolygon
      : generateRandomSegments;

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
          {parabolas?.map((parabola) => (
            <Parabola parabola={parabola} key={uniqueId()} />
          ))}
          {circles?.map((circle) => (
            <CircleComponent circle={circle} key={uniqueId()} />
          ))}
        </Layer>
      </Stage>
      {showOverlayText && <OverlayText mode={mode} generate={generateMethod} />}
    </div>
  );
}
