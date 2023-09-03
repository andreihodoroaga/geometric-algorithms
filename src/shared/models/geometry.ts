export interface Point {
  x: number;
  y: number;
  label: string;
  color: string;
}

export interface ILine {
  points: number[];
  color: string;
  dash?: number[];
}

export const pointsArray = (p1: Point, p2: Point) => {
  return [p1.x, p1.y, p2.x, p2.y];
};
