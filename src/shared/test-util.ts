import { Point, SimplePoint } from "./models/geometry";
import { getPointFromSimplePoint } from "./util";

export const generateMockPoints = (size: number) => {
  const mockPoints: Point[] = [];

  for (let i = 0; i < size; i++) {
    const mockPoint: Point = {
      x: Math.random() * 100,
      y: Math.random() * 100,
      label: `Point ${i + 1}`,
      color: "blue",
    };

    mockPoints.push(mockPoint);
  }

  return mockPoints;
};

export const mockPointsFromSimplePoints = (simplePoints: SimplePoint[]): Point[] => {
  return simplePoints.map((p) => getPointFromSimplePoint(p));
};
