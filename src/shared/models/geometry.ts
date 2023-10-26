export interface Point {
  x: number;
  y: number;
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

export const DEFAULT_POINT_SIZE = 5;
export const defaultDash = [5, 3];

export const convertPointBetweenAlgorithmAndCanvas = (point: Point) => {
  return {
    ...point,
    y: -point.y,
  };
};
