import { ILine, Point, SimplePoint, convertPointBetweenAlgorithmAndCanvas } from "./models/geometry";

export const POINT_RADIUS = 5;
export const POINT_COORDINATE_MAX_VALUE = 50;
export const NUMERIC_UNIT_PIXEL_SIZE = 20;
export const CANVAS_COORDINATE_MAX_VALUE = POINT_COORDINATE_MAX_VALUE * NUMERIC_UNIT_PIXEL_SIZE;
export const RED_COLOR = "rgb(153, 24, 24)";
export const ORANGE_COLOR = "#FF4500";
export const GREEN_COLOR = "green";
export const LIGHT_GREEN_COLOR = "#52ab98";
export const BLUE_COLOR = "#2b6777";
export const LIGHT_GREY_COLOR = "#ccc";
export const GREY_COLOR = "#666";
export const BLACK_COLOR = "#444";

export const generateRandomNumber = (start: number, end: number) => {
  if (start > end) {
    throw new Error("Start value must be less than or equal to end value");
  }
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

export const distanceBetweenPoints = (point1: Point, point2: Point): number => {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

export const getNextPointLetter = (lastPointLetter: string) => {
  let nextPointLetter = "";

  if (!lastPointLetter) {
    nextPointLetter = "A";
  } else {
    if (lastPointLetter === "Z" || lastPointLetter === "z") {
      nextPointLetter =
        String.fromCharCode(lastPointLetter.charCodeAt(0) - 25) +
        String.fromCharCode(lastPointLetter.charCodeAt(0) - 25);
    } else {
      const lastChar = lastPointLetter.slice(-1);
      const sub = lastPointLetter.slice(0, -1);
      if (lastChar === "Z" || lastChar === "z") {
        nextPointLetter = getNextPointLetter(sub) + String.fromCharCode(lastChar.charCodeAt(0) - 25);
      } else {
        nextPointLetter = sub + String.fromCharCode(lastChar.charCodeAt(0) + 1);
      }
    }
  }

  return nextPointLetter;
};

type ComparatorFn = (p1: Point, p2: Point) => 1 | 0 | -1;

export const sortList = (list: Point[], comparator: ComparatorFn) => {
  const sortedList = list.slice();
  sortedList.sort(comparator);
  return sortedList;
};

export const comparatorPointsByYDescending: ComparatorFn = (firstPoint: Point, secondPoint: Point) => {
  if (firstPoint.y > secondPoint.y) return -1;
  if (firstPoint.y < secondPoint.y) return 1;
  if (firstPoint.x < secondPoint.x) return -1;
  if (firstPoint.x > secondPoint.x) return 1;
  return 0;
};

export const comparatorPointsByXAscending: ComparatorFn = (firstPoint: Point, secondPoint: Point) => {
  if (firstPoint.x < secondPoint.x) return -1;
  if (firstPoint.x > secondPoint.x) return 1;
  if (firstPoint.y < secondPoint.y) return -1;
  if (firstPoint.y > secondPoint.y) return 1;
  return 0;
};

export const getPairsFromArray = <T>(arr: T[]) => {
  const outputArr = [];

  for (let i = 0; i < arr.length - 1; i++) {
    outputArr.push([arr[i], arr[i + 1]]);
  }

  return outputArr;
};

export const getLinesFromPoints = (points: Point[], color = GREY_COLOR, polygon = false) => {
  const pointPairs = getPairsFromArray(points);

  const lines = pointPairs.map(
    (pointPair) =>
      ({
        startPoint: pointPair[0],
        endPoint: pointPair[1],
        color,
      } as ILine)
  );

  if (polygon) {
    lines.push({
      startPoint: points[points.length - 1],
      endPoint: points[0],
      color,
    });
  }

  return lines;
};

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isPointInList = (point: Point, points: Point[]) => {
  for (let i = 0; i < points.length; i++) {
    if (points[i].x == point.x && points[i].y == point.y) {
      return true;
    }
  }
  return false;
};

// points for canvas: origin in top left (and y increasing as you go down)
// points for algorithm: origin in bottom left (so the alg. gets the points as we see them)
export const determinePointsForAlgorithm = (points: Point[]) => {
  return points.map((point) => convertPointBetweenAlgorithmAndCanvas(point));
};

export const getPointsWithIncreasedDistanceBetweenCloseOnes = <T extends SimplePoint>(points: T[]) => {
  const updatedPoints = points.slice();

  for (let i = 0; i < updatedPoints.length - 1; i++) {
    for (let j = i + 1; j < updatedPoints.length; j++) {
      if (Math.abs(updatedPoints[i].x - updatedPoints[j].x) < 0.1) {
        if (updatedPoints[i].x >= updatedPoints[j].x) {
          updatedPoints[i].x += 0.1;
        } else {
          updatedPoints[j].x += 0.1;
        }
      }
    }
  }

  return updatedPoints;
};
