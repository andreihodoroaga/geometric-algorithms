import { useEffect, useState } from "react";
import { Layer, Stage } from "react-konva";
import {
  Axis,
  HOVERED_POINT_SIZE,
  ICircle,
  ILine,
  IParabola,
  Point,
  TrapezoidForCanvas,
} from "../../shared/models/geometry";
import {
  GREY_COLOR,
  distanceBetweenPoints,
  getLinesFromPoints,
  getNextPointLetter,
  getTargetPoint,
  getPointFromSimplePoint,
  DARK_GREY_COLOR,
} from "../../shared/util";
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
import Parabola from "./Parabola";
import CircleComponent from "./Circle";
import TrapezoidComponent from "./Trapezoid";

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
  trapezoids?: TrapezoidForCanvas[];
  setTrapezoids?: React.Dispatch<React.SetStateAction<TrapezoidForCanvas[]>>;
  mode?: CanvasMode;
  hasOverlayText?: boolean;
  axes?: boolean;
  originInCenter?: boolean;
  disabled?: boolean;
  axisMultiplier?: number;
  shouldReset?: boolean;
  onReset?: () => void;
}

const usePointHoverEffect = (points: Point[]) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const addPointHoverEffect = (e: KonvaEventObject<MouseEvent>) => {
    const pointerPosition = e.target.getStage()?.getPointerPosition();
    const hoveredPoint = getTargetPoint(points, pointerPosition);
    if (hoveredPoint) {
      setHoveredPointIndex(points.indexOf(hoveredPoint));
      document.body.style.cursor = "pointer";
    } else {
      setHoveredPointIndex(null);
      document.body.style.cursor = "default";
    }
  };

  return { addPointHoverEffect, hoveredPointIndex };
};

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
  trapezoids,
  setTrapezoids,
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
  const [dragPoint, setDragPoint] = useState<Point | undefined>(undefined);
  const [previewLine, setPreviewLine] = useState<ILine | undefined>(undefined);
  const { addPointHoverEffect, hoveredPointIndex } = usePointHoverEffect(points);

  useEffect(() => {
    if (shouldReset && onReset) {
      setShowOverlayText(true);
      setPoints([]);
      setLines([]);
      setCircles?.([]);
      setParabolas?.([]);
      setTrapezoids?.([]);
      setClosedPolygon(false);
      onReset();
      setPreviewLine(undefined);
      setDragPoint(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReset]);

  useEffect(() => {
    if (points.length) {
      setShowOverlayText(false);
    }
  }, [points]);

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

    setPoints(points);
  };

  const generateRandomXMonotonePolygon = () => generateRandomMonotonePolygon(Axis.x);
  const generateRandomYMonotonePolygon = () => generateRandomMonotonePolygon(Axis.y);

  const generateRandomMonotonePolygon = (type = Axis.y) => {
    const points = getRandomPointsMonotonePolygon(canvasDimensions, type);
    setPoints(points);
    setLines(getLinesFromPoints(points, GREY_COLOR, true));
    setClosedPolygon(true);
  };

  const generateRandomSegments = () => {
    const { points, segments } = generateRandomNonIntersectingSegments(canvasDimensions);
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

  const isPolygonMode = () => mode === CanvasMode.xMonotonePolygon || mode === CanvasMode.yMonotonePolygon;

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    if (closedPolygon || disabled) {
      return;
    }

    const newPoint = getNextPoint(e.target.getStage()!.getPointerPosition()!);

    if (isPolygonMode() && points.length > 0) {
      addSegmentOnCanvas(newPoint, true);
    }
    if (mode === CanvasMode.segments && points.length % 2 == 1) {
      addSegmentOnCanvas(newPoint);
    }
    if (checkClosePoint(newPoint)) {
      return;
    }

    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  const getCenteredPoints = (points: Point[]) => {
    return points.map((point) => getCenteredPoint(point, canvasDimensions));
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (disabled) {
      return;
    }

    if (!isPolygonMode() || !closedPolygon) {
      handleCanvasClick(e);
    }

    setDragPoint(getTargetPoint(points, e.target.getStage()?.getPointerPosition()));
    setPreviewLine(undefined);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (disabled) {
      return;
    }

    addPointHoverEffect(e);

    if ((isPolygonMode() && !closedPolygon && points.length) || (mode === CanvasMode.segments && points.length % 2)) {
      setPreviewLine({
        startPoint: points[points.length - 1],
        endPoint: getPointFromSimplePoint(e.target.getStage()!.getPointerPosition()!),
        color: GREY_COLOR,
      });
    }

    if (dragPoint) {
      movePoint(dragPoint, e.target.getStage()!.getPointerPosition()!);
    }
  };

  const handleMouseUp = () => {
    setDragPoint(undefined);
  };

  const movePoint = (point: Point, newPosition: Vector2d) => {
    const newPoint = {
      ...point,
      ...newPosition,
    };
    setPoints((points) => points.map((p) => (p.label === point.label ? newPoint : p)));
    setLines((lines) =>
      lines.map((line) => {
        if (line.startPoint.label === point.label) {
          return { ...line, startPoint: newPoint };
        }
        if (line.endPoint.label === point.label) {
          return { ...line, endPoint: newPoint };
        }
        return line;
      })
    );
  };

  const getPointsToShow = () => {
    const pointsToShow = originInCenter ? getCenteredPoints(points) : points;
    return pointsToShow.map((p, idx) => {
      const point = idx !== hoveredPointIndex ? p : { ...p, color: DARK_GREY_COLOR, size: HOVERED_POINT_SIZE };
      return <PointComponent point={point} key={uniqueId()} />;
    });
  };

  const getCenteredLines = (lines: ILine[]) => {
    return lines.map((line) => ({
      ...line,
      startPoint: getCenteredPoint(line.startPoint, canvasDimensions),
      endPoint: getCenteredPoint(line.endPoint, canvasDimensions),
    }));
  };

  const getAxisPointsToShow = () => axesPoints.map((point) => <PointComponent point={point} key={uniqueId()} />);

  const getLinesToShow = () => {
    const linesToShow = originInCenter ? getCenteredLines(lines) : lines;
    return [...linesToShow, ...axesLines, previewLine].map(
      (line) => line && <LineComponent line={line} key={uniqueId()} />
    );
  };

  const generateMethod =
    mode === CanvasMode.points
      ? generateRandomPoints
      : mode === CanvasMode.segments
      ? generateRandomSegments
      : mode === CanvasMode.xMonotonePolygon
      ? generateRandomXMonotonePolygon
      : generateRandomYMonotonePolygon;

  return (
    <div className="canvas-component">
      <Stage
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {getAxisPointsToShow()}
          {getPointsToShow()}
          {getLinesToShow()}
          {parabolas?.map((parabola) => (
            <Parabola parabola={parabola} key={uniqueId()} color={parabola.color} />
          ))}
          {circles?.map((circle) => (
            <CircleComponent circle={circle} key={uniqueId()} />
          ))}
          {trapezoids?.map((trapezoid) => (
            <TrapezoidComponent trapezoid={trapezoid} key={uniqueId()} />
          ))}
        </Layer>
      </Stage>
      {showOverlayText && <OverlayText mode={mode} generate={generateMethod} />}
    </div>
  );
}
