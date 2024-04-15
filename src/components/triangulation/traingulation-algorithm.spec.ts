import { Point } from "../../shared/models/geometry";
import { computeTriangulationSteps } from "./triangulation-algorithm";

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

describe("Triangulation algorithm", () => {
  it("should have only one step if the polygon is a triangle", () => {
    const points = generateMockPoints(3);
    const visualizationSteps = computeTriangulationSteps(points);
    expect(visualizationSteps.length).toBe(1);
  });
});
