import { Vector2d } from "konva/lib/types";
import { Point, SimplePoint } from "./models/geometry";
import {
  generateRandomNumber,
  distanceBetweenPoints,
  getNextPointLetter,
  sortList,
  comparatorPointsByYDescending,
  comparatorPointsByXAscending,
  getPairsFromArray,
  getLinesFromPoints,
  timeout,
  isPointInList,
  getPointsWithIncreasedDistanceBetweenCloseOnes,
  shuffleArray,
  pointsResetToInitialColor,
  getTargetPoint,
  getPointFromSimplePoint,
  GREY_COLOR,
} from "./util";

// Sample data for testing
const pointA: Point = { x: 0, y: 0, color: "", label: "" };
const pointB: Point = { x: 3, y: 4, color: "", label: "" };

describe("Utility functions", () => {
  test("generateRandomNumber generates number within range", () => {
    const start = 1;
    const end = 10;
    for (let i = 0; i < 100; i++) {
      const num = generateRandomNumber(start, end);
      expect(num).toBeGreaterThanOrEqual(start);
      expect(num).toBeLessThanOrEqual(end);
    }
  });

  test("distanceBetweenPoints calculates correct distance", () => {
    expect(distanceBetweenPoints(pointA, pointB)).toBe(5);
  });

  test("getNextPointLetter returns next letter correctly", () => {
    expect(getNextPointLetter("")).toBe("A");
    expect(getNextPointLetter("A")).toBe("B");
    expect(getNextPointLetter("Z")).toBe("AA");
    expect(getNextPointLetter("AA")).toBe("AB");
    expect(getNextPointLetter("AZ")).toBe("BA");
    expect(getNextPointLetter("ZZ")).toBe("AAA");
  });

  test("sortList sorts points correctly by Y descending", () => {
    const points: Point[] = [pointA, pointB];
    const sortedPoints = sortList(points, comparatorPointsByYDescending);
    expect(sortedPoints[0]).toBe(pointB);
    expect(sortedPoints[1]).toBe(pointA);
  });

  test("sortList sorts points correctly by X ascending", () => {
    const points: Point[] = [pointB, pointA];
    const sortedPoints = sortList(points, comparatorPointsByXAscending);
    expect(sortedPoints[0]).toBe(pointA);
    expect(sortedPoints[1]).toBe(pointB);
  });

  test("getPairsFromArray returns correct pairs", () => {
    const array = [1, 2, 3, 4];
    const pairs = getPairsFromArray(array);
    expect(pairs).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
  });

  test("getLinesFromPoints returns correct lines", () => {
    const points: Point[] = [pointA, pointB];
    const lines = getLinesFromPoints(points, GREY_COLOR, true);
    expect(lines).toEqual([
      { startPoint: pointA, endPoint: pointB, color: GREY_COLOR },
      { startPoint: pointB, endPoint: pointA, color: GREY_COLOR },
    ]);
  });

  test("timeout resolves after given time", async () => {
    const start = Date.now();
    await timeout(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  });

  test("isPointInList checks if point is in list", () => {
    const points: Point[] = [pointA, pointB];
    expect(isPointInList(pointA, points)).toBe(true);
    expect(isPointInList({ x: 1, y: 1, color: "", label: "" }, points)).toBe(false);
  });

  test("getPointsWithIncreasedDistanceBetweenCloseOnes increases distance", () => {
    const points: SimplePoint[] = [
      { x: 0, y: 0 },
      { x: 0.05, y: 0 },
    ];
    const updatedPoints = getPointsWithIncreasedDistanceBetweenCloseOnes(points);
    expect(updatedPoints[0].x).not.toBe(updatedPoints[1].x);
  });

  test("shuffleArray shuffles the array", () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffleArray(array);
    expect(shuffledArray).not.toEqual(array);
  });

  test("pointsResetToInitialColor resets points color", () => {
    const points: Point[] = [
      { ...pointA, color: "red" },
      { ...pointB, color: "blue" },
    ];
    const resetPoints = pointsResetToInitialColor(points);
    expect(resetPoints[0].color).toBe("red");
    expect(resetPoints[1].color).toBe("blue");
  });

  test("getTargetPoint finds the correct point based on cursor location", () => {
    const points: Point[] = [pointA, pointB];
    const cursorLocation: Vector2d = { x: 0, y: 0 };
    expect(getTargetPoint(points, cursorLocation)).toBe(pointA);
    expect(getTargetPoint(points, { x: 10, y: 10 })).toBeUndefined();
  });

  test("getPointFromSimplePoint converts correctly", () => {
    const simplePoint: SimplePoint = { x: 1, y: 1 };
    const point = getPointFromSimplePoint(simplePoint, "red", "A");
    expect(point).toEqual({ x: 1, y: 1, color: "red", label: "A" });
  });
});
