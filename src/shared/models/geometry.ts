import { uniqueId } from "lodash";
import { CanvasDimensions } from "../../components/canvas/helpers";

export interface SimplePoint {
  x: number;
  y: number;
}

export interface Point extends SimplePoint {
  label: string;
  color: string;
  size?: number;
  labelPosition?: {
    x: number;
    y: number;
  };
}

export interface ILine {
  startPoint: Point;
  endPoint: Point;
  color: string;
  dash?: number[];
}

// assumed to be a vertical parabola everywhere in the code
export interface IParabola {
  startPoint: SimplePoint;
  endPoint: SimplePoint;
  controlPoint: SimplePoint;
  color?: string;
}

export interface IParabolaForAlg extends IParabola {
  focus: Point;
  directrixX: number;
  id: string;
}

export type IParabolaForAlgWithoutId = Omit<IParabolaForAlg, "id">;

export interface ICircle {
  center: SimplePoint;
  radius: number;
}

export type Axis = "x" | "y";

export const DEFAULT_POINT_SIZE = 5;
export const FOCUSED_POINT_SIZE = 6;
export const defaultDash = [5, 3];

export const convertPointBetweenAlgorithmAndCanvas = (point: Point) => {
  return {
    ...point,
    y: -point.y,
  };
};

export const convertSimplePointBetweenAlgorithmAndCanvas = (point: SimplePoint) => {
  return {
    ...point,
    y: -point.y,
  };
};

export const arePointsEqual = (p1: Point, p2: Point) => {
  return p1.label === p2.label && p1.x === p2.x && p1.y === p2.y;
};

export const isPointInsideTheCanvas = (point: SimplePoint, canvasDimensions: CanvasDimensions) => {
  return point.x > 0 && point.x < canvasDimensions.width && point.y < 0 && point.y > -canvasDimensions.height;
};

// determine the position of targetPoint with respect to the oriented segment [firstPoint, endPoint]
export const calculateOrientationForNormalPoints = (firstPoint: Point, targetPoint: Point, endPoint: Point) => {
  // 2 = left,  1 = right, 0 = collinear
  const val =
    (targetPoint.x - firstPoint.x) * (endPoint.y - firstPoint.y) -
    (endPoint.x - firstPoint.x) * (targetPoint.y - firstPoint.y);
  if (val == 0) return 0;
  return val > 0 ? 2 : 1;
};

// calculates the angle at B
export const findAngle = (A: SimplePoint, B: SimplePoint, C: SimplePoint) => {
  if ((A.x === B.x && A.y === B.y) || (B.x === C.x && B.y === C.y) || (A.x === C.x && A.y === C.y)) {
    return 0; // TODO: properly handle this case
  }
  const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
};

// finds the derivative from x=(y-k)^2+h w.r.t. x
const getParabolaSlopeAtX = (x: number, a: number, h: number, chooseSmallerY: boolean) => {
  const derivative = 1 / (2 * a * Math.sqrt((x - h) / a));
  if (chooseSmallerY) {
    return derivative;
  }
  return -derivative;
};

export const getControlPoint = (
  startPoint: SimplePoint,
  endPoint: SimplePoint,
  focus: SimplePoint,
  directrixX: number
) => {
  const distVertexDirectrix = (1 / 2) * (directrixX - focus.x);
  const a = -(1 / (4 * distVertexDirectrix));
  const h = (focus.x + directrixX) / 2;

  const x1 = startPoint.x;
  const y1 = startPoint.y;
  const x2 = endPoint.x;
  const y2 = endPoint.y;

  const chooseSmallerYStartPoint = startPoint.y > focus.y;
  const chooseSmallerYEndPoint = endPoint.y > focus.y;
  const m1 = getParabolaSlopeAtX(x1, a, h, chooseSmallerYStartPoint);
  const m2 = getParabolaSlopeAtX(x2, a, h, chooseSmallerYEndPoint);

  // y - y1 = m1 * (x - x1) => y = y1 + m1*x - m1*x1
  // y - y2 = m2 * (x - x2) => y = y2 + m2*x - m2*x2
  // (m1 - m2)x = y2 - m2 * x2 - y1 + m1 * x1

  const x = (y2 - m2 * x2 - y1 + m1 * x1) / (m1 - m2);
  const y = y1 + m1 * x - m1 * x1;

  return { x, y };
};

// returns a parabola with start points at the specified y-coordinates
export const getParabolaFromYCoordinates = (
  focus: Point,
  sweepLineX: number,
  startPointY = 0,
  endPointY = 0
): IParabolaForAlg => {
  const distVertexDirectrix1 = (1 / 2) * (sweepLineX - focus.x);
  const a = -(1 / (4 * distVertexDirectrix1));
  const h = (focus.x + sweepLineX) / 2;
  const k = focus.y;

  const x1 = getVerticalParabolaX(a, startPointY, k, h);
  const x2 = getVerticalParabolaX(a, endPointY, k, h);

  const startPoint = {
    x: x1,
    y: startPointY,
  };

  const endPoint = {
    x: x2,
    y: endPointY,
  };

  const controlPoint = getControlPoint(startPoint, endPoint, focus, sweepLineX);

  return {
    focus,
    directrixX: sweepLineX,
    startPoint,
    endPoint,
    controlPoint,
    id: uniqueId(),
  };
};

export const getParabolaFromEndPoints = (
  startPoint: SimplePoint,
  endPoint: SimplePoint,
  focus: Point,
  sweepLineX: number
): IParabolaForAlgWithoutId => {
  const controlPoint = getControlPoint(startPoint, endPoint, focus, sweepLineX);

  return {
    focus,
    directrixX: sweepLineX,
    startPoint,
    endPoint,
    controlPoint,
  };
};

const getVerticalParabolaX = (a: number, y: number, k: number, h: number) => {
  return a * (y - k) ** 2 + h;
};

// solves a1(y - k1)^2 + h1 = a2(y - k2)^2 + h2 and returns the point with greater y-coord first
export const getIntersectionPointsBetweenParabolas = (p1: IParabolaForAlg, p2: IParabolaForAlg): SimplePoint[] => {
  const distVertexDirectrix1 = (1 / 2) * (p1.directrixX - p1.focus.x);
  const a1 = -(1 / (4 * distVertexDirectrix1));
  const distVertexDirectrix2 = (1 / 2) * (p2.directrixX - p2.focus.x);
  const a2 = -(1 / (4 * distVertexDirectrix2));
  const h1 = (p1.focus.x + p1.directrixX) / 2;
  const h2 = (p2.focus.x + p2.directrixX) / 2;
  const k1 = p1.focus.y;
  const k2 = p2.focus.y;

  const b = 2 * (a2 * k2 - a1 * k1);
  const delta = b ** 2 - 4 * (a1 - a2) * (a1 * k1 ** 2 - a2 * k2 ** 2 + h1 - h2);
  const y1 = (-b + Math.sqrt(delta)) / (2 * (a1 - a2));
  const y2 = (-b - Math.sqrt(delta)) / (2 * (a1 - a2));

  const x1 = getVerticalParabolaX(a1, y1, k1, h1);
  const x2 = getVerticalParabolaX(a2, y2, k2, h2);

  return [
    {
      x: x1,
      y: y1,
    },
    {
      x: x2,
      y: y2,
    },
  ];
};

export const distance = (point1: SimplePoint, point2: SimplePoint): number => {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

export const closestPoint = (reference: SimplePoint, points: SimplePoint[]): SimplePoint => {
  if (points.length < 2) {
    throw new Error("Array must contain at least two points");
  }

  let closest = points[0];
  let minDistance = distance(reference, closest);

  for (let i = 1; i < points.length; i++) {
    const currentDistance = distance(reference, points[i]);
    if (currentDistance < minDistance) {
      minDistance = currentDistance;
      closest = points[i];
    }
  }

  return closest;
};

// it is assumed that the startPoint of the rays is their origin,
// extending in the direction of the endPoint
export const getIntersectionBetweenRays = (ray1: ILine, ray2: ILine): SimplePoint | null => {
  if (ray1.startPoint.x === ray2.startPoint.x && ray1.startPoint.y === ray2.startPoint.y) {
    return null;
  }

  const dir1 = {
    x: ray1.endPoint.x - ray1.startPoint.x,
    y: ray1.endPoint.y - ray1.startPoint.y,
  };
  const dir2 = {
    x: ray2.endPoint.x - ray2.startPoint.x,
    y: ray2.endPoint.y - ray2.startPoint.y,
  };

  // Check if the rays are parallel (= 0) or diverging (< 0)
  const det = dir1.x * dir2.y - dir1.y * dir2.x;
  if (det <= 0) {
    return null;
  }

  const angle = Math.acos(
    (dir1.x * dir2.x + dir1.y * dir2.y) / (Math.sqrt(dir1.x ** 2 + dir1.y ** 2) * Math.sqrt(dir2.x ** 2 + dir2.y ** 2))
  );

  // If angle is less than 180 degrees, rays intersect
  if (angle < Math.PI) {
    const t =
      (dir2.x * (ray1.startPoint.y - ray2.startPoint.y) - dir2.y * (ray1.startPoint.x - ray2.startPoint.x)) / det;
    const intersectionX = ray1.startPoint.x + t * dir1.x;
    const intersectionY = ray1.startPoint.y + t * dir1.y;
    return { x: intersectionX, y: intersectionY };
  }

  return null;
};
