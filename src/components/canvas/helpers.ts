import { Axis, ILine, Point } from "../../shared/models/geometry";
import { BLACK_COLOR, GREY_COLOR, LIGHT_GREY_COLOR, generateRandomNumber, getNextPointLetter } from "../../shared/util";
import { checkSegmentsIntersect } from "../triangulation/triangulation-algorithm";

export type CanvasDimensions = {
  width: number;
  height: number;
};

export enum CanvasMode {
  yMonotonePolygon = "poligon y-monoton",
  xMonotonePolygon = "poligon x-monoton",
  points = "puncte",
  segments = "segmente",
}

export const getAxesLines = (canvasDimensions: CanvasDimensions) => {
  const xAxis: ILine = {
    startPoint: {
      x: -10,
      y: canvasDimensions.height / 2,
      label: "",
      color: GREY_COLOR,
    },
    endPoint: {
      x: canvasDimensions.width + 10,
      y: canvasDimensions.height / 2,
      label: "",
      color: GREY_COLOR,
    },
    color: BLACK_COLOR,
  };
  const yAxis: ILine = {
    startPoint: {
      x: canvasDimensions.width / 2,
      y: canvasDimensions.height + 10,
      label: "",
      color: GREY_COLOR,
    },
    endPoint: {
      x: canvasDimensions.width / 2,
      y: -10,
      label: "",
      color: GREY_COLOR,
    },
    color: BLACK_COLOR,
  };

  return [xAxis, yAxis];
};

export const getCenteredPoint = (point: Point, canvasDimensions: CanvasDimensions) => {
  return {
    ...point,
    x: point.x + canvasDimensions.width / 2,
    y: canvasDimensions.height / 2 - point.y,
  };
};

// Show the x and y top boundaries on the axes
export const getAxesBoundaryPoints = (canvasDimensions: CanvasDimensions, axisMultiplier: number) => {
  const xAxisPoint = {
    x: canvasDimensions.width - 5,
    y: canvasDimensions.height / 2,
    label: `(${Math.floor(canvasDimensions.width / 2 / axisMultiplier)},0)`,
    color: LIGHT_GREY_COLOR,
    labelPosition: {
      x: -28,
      y: 5,
    },
  };

  const yAxisPoint = {
    x: canvasDimensions.width / 2,
    y: 5,
    label: `(0,${Math.floor(canvasDimensions.height / 2 / axisMultiplier)})`,
    color: LIGHT_GREY_COLOR,
    labelPosition: {
      x: 5,
      y: -5,
    },
  };

  return [xAxisPoint, yAxisPoint];
};

export const generateNextRandomPoint = (
  lowerBoundX: number,
  upperBoundX: number,
  lowerBoundY: number,
  upperBoundY: number,
  currentPoints: Point[]
): Point => {
  const x = generateRandomNumber(lowerBoundX, upperBoundX);
  const y = generateRandomNumber(lowerBoundY, upperBoundY);
  const label = getNextPointLetter(
    currentPoints[currentPoints.length - 1] ? currentPoints[currentPoints.length - 1].label : ""
  );

  return { x, y, label, color: GREY_COLOR };
};

// the algorithm is not truly random, in the sense that it generates some points in
// the left half of the canvas (for the y-monotone case, that is) and then some points in the right half
// while making sure that it remains y-monotone (it does so by splitting the canvas in vertical intervals
// and choosing a point in each such interval)
export const getRandomPointsMonotonePolygon = (canvasDimensions: CanvasDimensions, type: Axis) => {
  const points: Point[] = [];

  const lowerBound = 20;
  const upperBound = type == Axis.x ? canvasDimensions.width - 20 : canvasDimensions.height - 20;
  const pointsNum = 10;
  const intervalSize = (upperBound - lowerBound) / pointsNum;

  const intervalEndPoints = [lowerBound];
  for (let i = 1; i <= pointsNum; i++) {
    intervalEndPoints.push(lowerBound + intervalSize * i);
  }

  for (let i = 0; i < 2 * pointsNum; i++) {
    // skip some of the points (to add some randomness :)
    const prob = Math.random();
    if (prob > 0.7) {
      continue;
    }

    // in the case of x-monotone, first half is the upper half, else it is the left half
    const isFirstHalf = i < pointsNum;
    const startX = isFirstHalf ? 20 : canvasDimensions.width / 2 - 10;
    const endX = isFirstHalf ? canvasDimensions.width / 2 - 10 : canvasDimensions.width - 20;
    const startY = isFirstHalf ? 20 : canvasDimensions.height / 2 - 10;
    const endY = isFirstHalf ? canvasDimensions.height / 2 - 10 : canvasDimensions.height - 20;
    const index = isFirstHalf ? i : 2 * pointsNum - 1 - i;

    const nextPoint = generateNextRandomPoint(
      type == Axis.x ? intervalEndPoints[index] : startX,
      type == Axis.x ? intervalEndPoints[index + 1] : endX,
      type == Axis.x ? startY : intervalEndPoints[index],
      type == Axis.x ? endY : intervalEndPoints[index + 1],
      points
    );
    points.push(nextPoint);
  }

  return points;
};

export const generateRandomNonIntersectingSegments = (canvasDimensions: CanvasDimensions) => {
  const points: Point[] = [];
  // the number of points must be even (each pair of consecutive points will make up a segment)
  const numPoints = 15 * 2;

  for (let i = 0; i < numPoints; i++) {
    points.push(generateNextRandomPoint(20, canvasDimensions.width - 20, 20, canvasDimensions.height - 20, points));
  }

  const segments = [];
  const finalPoints = [];
  for (let i = 0; i < numPoints; i += 2) {
    const newSegment: ILine = {
      startPoint: points[i],
      endPoint: points[i + 1],
      color: GREY_COLOR,
    };

    let intersectsExistingSegment = false;
    segments.forEach((segment) => {
      intersectsExistingSegment ||= checkSegmentsIntersect(
        segment.startPoint,
        segment.endPoint,
        newSegment.startPoint,
        newSegment.endPoint
      );
    });

    if (!intersectsExistingSegment) {
      const startPointNewLabel = getNextPointLetter(
        finalPoints.length ? finalPoints[finalPoints.length - 1].label : ""
      );
      const endPointNewLabel = getNextPointLetter(startPointNewLabel);
      newSegment.startPoint = { ...newSegment.startPoint, label: startPointNewLabel };
      newSegment.endPoint = { ...newSegment.endPoint, label: endPointNewLabel };

      finalPoints.push(newSegment.startPoint, newSegment.endPoint);
      segments.push(newSegment);
    }
  }

  return { points: finalPoints, segments };
};
