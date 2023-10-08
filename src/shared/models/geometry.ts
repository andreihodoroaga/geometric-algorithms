export interface Point {
  x: number;
  y: number;
  label: string;
  color: string;
  size?: number;
}

export interface ILine {
  points: number[];
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

export const pointsArray = (p1: Point, p2: Point) => {
  return [p1.x, p1.y, p2.x, p2.y];
};
