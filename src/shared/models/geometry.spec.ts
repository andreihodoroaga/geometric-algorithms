import { PointsOrientation, SimplePoint, calculateOrientationForNormalPoints, findAngle } from "./geometry";

describe("models/geometry.ts", () => {
  describe("calculateOrientationForNormalPoints", () => {
    test("returns Collinear for collinear points", () => {
      const firstPoint: SimplePoint = { x: 0, y: 0 };
      const targetPoint: SimplePoint = { x: 1, y: 1 };
      const endPoint: SimplePoint = { x: 2, y: 2 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Collinear);
    });

    test("returns Left for points forming a left turn", () => {
      const firstPoint: SimplePoint = { x: 0, y: 0 };
      const targetPoint: SimplePoint = { x: 2, y: 1 };
      const endPoint: SimplePoint = { x: 1, y: 2 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Left);
    });

    test("returns Right for points forming a right turn", () => {
      const firstPoint: SimplePoint = { x: 0, y: 0 };
      const targetPoint: SimplePoint = { x: 1, y: 2 };
      const endPoint: SimplePoint = { x: 2, y: 1 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Right);
    });

    test("returns Collinear when all points are the same", () => {
      const firstPoint: SimplePoint = { x: 1, y: 1 };
      const targetPoint: SimplePoint = { x: 1, y: 1 };
      const endPoint: SimplePoint = { x: 1, y: 1 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Collinear);
    });

    test("returns Collinear when targetPoint lies on the line segment", () => {
      const firstPoint: SimplePoint = { x: 0, y: 0 };
      const targetPoint: SimplePoint = { x: 1, y: 1 };
      const endPoint: SimplePoint = { x: 2, y: 2 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Collinear);
    });

    test("returns Left when targetPoint is on the left of the line segment", () => {
      const firstPoint: SimplePoint = { x: 0, y: 0 };
      const targetPoint: SimplePoint = { x: 1, y: 0 };
      const endPoint: SimplePoint = { x: 0, y: 1 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Left);
    });

    test("returns Right when targetPoint is on the right of the line segment", () => {
      const firstPoint: SimplePoint = { x: 0, y: 0 };
      const targetPoint: SimplePoint = { x: 0, y: 1 };
      const endPoint: SimplePoint = { x: 1, y: 0 };
      expect(calculateOrientationForNormalPoints(firstPoint, targetPoint, endPoint)).toBe(PointsOrientation.Right);
    });
  });

  describe("findAngle", () => {
    it("should return 0 when any two points are the same", () => {
      const A: SimplePoint = { x: 1, y: 1 };
      const B: SimplePoint = { x: 1, y: 1 };
      const C: SimplePoint = { x: 2, y: 2 };

      expect(findAngle(A, B, C)).toBe(0);
      expect(findAngle(A, C, B)).toBe(0);
      expect(findAngle(B, C, A)).toBe(0);
    });

    it("should return the correct angle for a right triangle", () => {
      const A: SimplePoint = { x: 0, y: 0 };
      const B: SimplePoint = { x: 0, y: 1 };
      const C: SimplePoint = { x: 1, y: 1 };

      const angle = findAngle(A, B, C);
      expect(angle).toBeCloseTo(Math.PI / 2);
    });

    it("should return the correct angle for an equilateral triangle", () => {
      const A: SimplePoint = { x: 0, y: 0 };
      const B: SimplePoint = { x: 1, y: Math.sqrt(3) };
      const C: SimplePoint = { x: 2, y: 0 };

      const angle = findAngle(A, B, C);
      expect(angle).toBeCloseTo(Math.PI / 3);
    });
  });
});
