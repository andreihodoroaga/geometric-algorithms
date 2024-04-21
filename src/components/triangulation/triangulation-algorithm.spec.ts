import { Point, SimplePoint } from "../../shared/models/geometry";
import { computeTriangulationSteps, leftAndRightChains } from "./triangulation-algorithm";

const generateMockPoints = (size: number) => {
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

const mockPointsFromSimplePoints = (simplePoints: SimplePoint[]): Point[] => {
  return simplePoints.map((p) => ({
    ...p,
    color: "",
    label: "",
  }));
};

describe("Triangulation algorithm", () => {
  it("should have only one step if the polygon is a triangle", () => {
    const points = generateMockPoints(3);
    const visualizationSteps = computeTriangulationSteps(points);
    expect(visualizationSteps.length).toBe(1);
  });

  it("should determine the left and right chains correctly if the points are in trigonometric order", () => {
    const points = mockPointsFromSimplePoints([
      { x: 4, y: 8 },
      { x: 0, y: 4 },
      { x: 2, y: 1 },
      { x: 6, y: 0 },
      { x: 8, y: 4 },
    ]);
    const [leftChain, rightChain] = leftAndRightChains(points);

    expect(leftChain).toEqual(points.slice(0, 4));
    expect(rightChain).toEqual([points[4]]);
  });

  it("should determine the left and right chains correctly if the points are in clockwise order", () => {
    const points = mockPointsFromSimplePoints([
      { x: 4, y: 8 },
      { x: 8, y: 4 },
      { x: 6, y: 0 },
      { x: 2, y: 1 },
      { x: 0, y: 4 },
    ]);
    const [leftChain, rightChain] = leftAndRightChains(points);

    expect(leftChain).toEqual(points.slice(3));
    expect(rightChain).toEqual(points.slice(0, 3));
  });
});
