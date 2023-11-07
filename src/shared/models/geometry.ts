export interface SimplePoint {
  x: number;
  y: number;
}

export interface Point extends SimplePoint {
  label: string;
  color: string;
  size?: number;
}

export interface ILine {
  startPoint: Point;
  endPoint: Point;
  color: string;
  dash?: number[];
}

export type Axis = "x" | "y";

export const DEFAULT_POINT_SIZE = 5;
export const defaultDash = [5, 3];

export const convertPointBetweenAlgorithmAndCanvas = (point: Point) => {
  return {
    ...point,
    y: -point.y,
  };
};

export const arePointsEqual = (p1: Point, p2: Point) => {
  return p1.x === p2.x && p1.y === p2.y;
}

// determine the position of targetPoint with respect to the oriented segment [firstPoint, endPoint]
export const calculateOrientationForNormalPoints = (firstPoint: Point, targetPoint: Point, endPoint: Point) => {
  // 2 = left,  1 = right, 0 = collinear
  const val =
    (targetPoint.x - firstPoint.x) * (endPoint.y - firstPoint.y) -
    (endPoint.x - firstPoint.x) * (targetPoint.y - firstPoint.y);
  if (val == 0) return 0;
  return val > 0 ? 2 : 1;
};
