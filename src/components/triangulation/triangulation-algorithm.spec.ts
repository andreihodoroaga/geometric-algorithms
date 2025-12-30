import { Axis } from "../../shared/models/geometry";
import { generateMockPoints, mockPointsFromSimplePoints } from "../../shared/test-util";
import { computeTriangulationSteps, splitPolygonInChains } from "./triangulation-algorithm";

describe("Triangulation algorithm", () => {
  it("should have only one step if the polygon is a triangle", () => {
    const points = generateMockPoints(3);
    const visualizationSteps = computeTriangulationSteps(points, Axis.y, "en");
    expect(visualizationSteps.length).toBe(1);
  });

  describe("splitPolygonInChains logic - y monotone case", () => {
    it("general case", () => {
      const points = mockPointsFromSimplePoints([
        { x: 0, y: 8 },
        { x: 0, y: 0 },
        { x: 6, y: 1 },
        { x: 5, y: 2 },
        { x: 4, y: 4 },
        { x: 3.5, y: 6 },
      ]);
      const [leftChain, rightChain] = splitPolygonInChains(points, Axis.y);

      expect(leftChain).toEqual(points.slice(0, 2));
      expect(rightChain).toEqual(points.slice(2));
    });

    it("points in trigonometric order", () => {
      const points = mockPointsFromSimplePoints([
        { x: 4, y: 8 },
        { x: 0, y: 4 },
        { x: 2, y: 1 },
        { x: 6, y: 0 },
        { x: 8, y: 4 },
      ]);
      const [leftChain, rightChain] = splitPolygonInChains(points, Axis.y);

      expect(leftChain).toEqual(points.slice(0, 4));
      expect(rightChain).toEqual([points[4]]);
    });

    it("points in clockwise order", () => {
      const points = mockPointsFromSimplePoints([
        { x: 4, y: 8 },
        { x: 8, y: 4 },
        { x: 6, y: 0 },
        { x: 2, y: 1 },
        { x: 0, y: 4 },
      ]);
      const [leftChain, rightChain] = splitPolygonInChains(points, Axis.y);

      expect(leftChain).toEqual(points.slice(3));
      expect(rightChain).toEqual(points.slice(0, 3));
    });

    it("the left chain contains all points", () => {
      const points = mockPointsFromSimplePoints([
        { x: 8, y: 8 },
        { x: 4, y: 5 },
        { x: 5, y: 4 },
        { x: 4, y: 3 },
        { x: 6, y: 1 },
      ]);
      const [leftChain, rightChain] = splitPolygonInChains(points, Axis.y);

      expect(leftChain).toEqual(points);
      expect(rightChain).toEqual([]);
    });

    it("the right chain contains all points", () => {
      const points = mockPointsFromSimplePoints([
        { x: 8, y: 8 },
        { x: 12, y: 5 },
        { x: 11, y: 4 },
        { x: 12, y: 3 },
        { x: 10, y: 1 },
      ]);
      const [leftChain, rightChain] = splitPolygonInChains(points, Axis.y);

      expect(leftChain).toEqual([]);
      expect(rightChain).toEqual(points);
    });
  });
});
