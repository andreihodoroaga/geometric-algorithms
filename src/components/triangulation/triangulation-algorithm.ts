import { VisualizationStep } from "../../shared/models/algorithm";
import {
  Axis,
  ILine,
  Point,
  arePointsEqual,
  calculateOrientationForNormalPoints,
  convertPointBetweenAlgorithmAndCanvas,
} from "../../shared/models/geometry";
import {
  GREEN_COLOR,
  GREY_COLOR,
  LIGHT_GREEN_COLOR,
  ORANGE_COLOR,
  RED_COLOR,
  comparatorPointsByYDescending,
  getLinesFromPoints,
  isPointInList,
  pointsResetToInitialColor,
  sortList,
} from "../../shared/util";

export type MonotoneType = "x" | "y";

export const computeTriangulationSteps = (points: Point[]) => {
  return triangulateYMonotonePolygon(points);
};

// https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
// 0 -> collinear, <0 -> one side, >0 -> other side
// we don't really care on which side the point is (use it to determine whether two points are on the same side)
const calculateOrienationWithRespectToLine = (firstPoint: Point, targetPoint: Point, endPoint: Point) => {
  const x1 = firstPoint.x;
  const y1 = firstPoint.y;
  const x = targetPoint.x;
  const y = targetPoint.y;
  const x2 = endPoint.x;
  const y2 = endPoint.y;
  const d = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  return d === 0 ? 0 : d > 0 ? 1 : -1;
};

export const checkSegmentsIntersect = (p1: Point, q1: Point, p2: Point, q2: Point) => {
  const orientationForP1 = calculateOrienationWithRespectToLine(p2, p1, q2);
  const orientationForQ1 = calculateOrienationWithRespectToLine(p2, q1, q2);
  const orientationForP2 = calculateOrienationWithRespectToLine(p1, p2, q1);
  const orientationForQ2 = calculateOrienationWithRespectToLine(p1, q2, q1);

  if (orientationForP1 === 0 || orientationForQ1 === 0 || orientationForP2 === 0 || orientationForQ2 === 0) {
    return true;
  }
  if (orientationForP1 !== orientationForQ1 && orientationForP2 !== orientationForQ2) {
    return true;
  }
  return false;
};

const checkClosedPolygon = (lines: ILine[]) => {
  const firstPoint = lines[0].startPoint;
  const lastPoint = lines[lines.length - 1].endPoint;

  return firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y;
};

// assumes the points are in trigonometric order
export const checkValidPolygon = (points: Point[]) => {
  const lines = getLinesFromPoints(points, GREY_COLOR, true);
  if (!checkClosedPolygon(lines)) {
    return false;
  }

  for (let i = 0; i < lines.length - 2; i++) {
    for (let j = i + 2; j < lines.length; j++) {
      const p1 = convertPointBetweenAlgorithmAndCanvas(lines[i].startPoint);
      const q1 = convertPointBetweenAlgorithmAndCanvas(lines[i].endPoint);
      const p2 = convertPointBetweenAlgorithmAndCanvas(lines[j].startPoint);
      const q2 = convertPointBetweenAlgorithmAndCanvas(lines[j].endPoint);

      if (arePointsEqual(p1, p2) || arePointsEqual(p1, q2) || arePointsEqual(p2, q1) || arePointsEqual(p2, q2))
        continue;

      if (checkSegmentsIntersect(p1, q1, p2, q2)) {
        return false;
      }
    }
  }
  return true;
};

const comparePointsWithRespectToAxis = (currPoint: Point, nextPoint: Point, prevPoint: Point, axis: Axis) => {
  if (axis === "x") {
    return currPoint.x < nextPoint.x && currPoint.x < prevPoint.x;
  } else {
    return currPoint.y < nextPoint.y && currPoint.y < prevPoint.y;
  }
};

// a polygon is monotone with respect to an axis (say the x-axis)
// if it has only one vertex whose x-coordinate is smaller than both of its neighbours
// https://cs.stackexchange.com/questions/1577/how-do-i-test-if-a-polygon-is-monotone-with-respect-to-a-line
// the points are assumed to be in trigonometric order TODO: why?
export const isPolygonMonotone = (points: Point[], axis: Axis) => {
  const numberOfPoints = points.length;
  let localMins = 0;

  for (let i = 0; i < numberOfPoints; i++) {
    const currPoint = points[i];
    const nextPoint = points[(i + 1) % numberOfPoints];
    const prevPoint = points[i - 1 >= 0 ? i - 1 : numberOfPoints - 1];
    if (comparePointsWithRespectToAxis(currPoint, nextPoint, prevPoint, axis)) {
      localMins += 1;
    }
  }

  return localMins == 1;
};

// assumes points are in either trigonometric or clockwise order
export const leftAndRightChains = (points: Point[]) => {
  // the first chain will be the left one if the points are in trigonometric order
  const firstChain: Point[] = [];
  const secondChain: Point[] = [];

  const topmostPoint = points.reduce((prev, current) => (prev && prev.y > current.y ? prev : current));
  const lowestPoint = points.reduce((prev, current) => (prev && prev.y < current.y ? prev : current));

  const topmostPointIdx = points.findIndex((p) => arePointsEqual(p, topmostPoint))!;
  let hitBottom = false;
  firstChain.push(topmostPoint);
  for (let i = 1; i < points.length; i++) {
    const currentIndex = (i + topmostPointIdx) % points.length;

    if (!hitBottom) {
      firstChain.push(points[currentIndex]);
    } else {
      secondChain.push(points[currentIndex]);
    }

    if (arePointsEqual(points[currentIndex], lowestPoint) && !hitBottom) {
      hitBottom = true;
    }
  }

  // the firstChain has at least two values (the topmost and lowest points), while the secondChain can have none
  // if the first chain is the right one (when the points are in clockwise order), swap them
  if (secondChain.length) {
    if (firstChain[1].x > secondChain[0].x) {
      return [secondChain, firstChain];
    }
    return [firstChain, secondChain];
  }
  // if the firstChain contains all points, distinguish if it should be the left or right chain
  if (firstChain[0].x > firstChain[1].x) {
    // the first chain is the left chain
    return [firstChain, secondChain];
  }
  return [secondChain, firstChain];
};

const isInteriorDiagonal = (
  currentPoint: Point,
  lastPointFromStack: Point,
  topOfStackPoint: Point,
  leftChain: Point[]
) => {
  const inLeftChain = isPointInList(currentPoint, leftChain) && isPointInList(lastPointFromStack, leftChain);
  const orientation = calculateOrientationForNormalPoints(currentPoint, lastPointFromStack, topOfStackPoint);

  if (inLeftChain) {
    return orientation == 1;
  } else {
    return orientation == 2;
  }
};

const sortStepExplanation = (sortedPoints: Point[]) => {
  let message = "Varfurile se ordoneaza descrescător după y (dacă ordinea este egală, se folosește abscisa): ";

  for (let i = 0; i < sortedPoints.length; i++) {
    if (i > 0) message = message + ", ";
    message = message + sortedPoints[i].label;
  }

  return message;
};

const initializeStackStep = (pointsStack: Point[]) => {
  return {
    explanation: "Se initializeaza stiva cu primele 2 varfuri. ",
    graphicDrawingsStepList: [
      {
        type: "point",
        element: pointsStack[0],
        color: LIGHT_GREEN_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: pointsStack[1],
        color: LIGHT_GREEN_COLOR,
        size: 6,
      },
      {
        type: "stackStatus",
        element: [...pointsStack],
      },
    ],
  };
};

const pointAndTopOfStackInSameChainStep = (currentPoint: Point, pointsStack: Point[]) => {
  return {
    explanation: `Punctul curent, ${currentPoint.label}, si punctul din varful stivei, ${
      pointsStack[pointsStack.length - 1].label
    }, sunt in acelasi lant. `,
    graphicDrawingsStepList: [
      {
        type: "point",
        element: currentPoint,
        color: ORANGE_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: pointsStack[pointsStack.length - 1],
        color: ORANGE_COLOR,
        size: 6,
      },
    ],
  };
};

const extractTopOfStackStep = (pointsStack: Point[], lastPointFromStack: Point) => {
  return {
    explanation: `Se extrage varful ${lastPointFromStack.label} din stiva.`,
    graphicDrawingsStepList: [
      {
        type: "point",
        element: lastPointFromStack,
        color: RED_COLOR,
        size: 6,
      },
      {
        type: "stackStatus",
        element: [...pointsStack],
      },
    ],
  };
};

const interiorDiagonalStep = (pointsStack: Point[], currentPoint: Point, lastPointFromStack: Point) => {
  return {
    explanation: `Se extrage varful ${lastPointFromStack.label} din stiva pentru ca formeaza cu ${currentPoint.label} diagonala interioara poligonului.`,
    graphicDrawingsStepList: [
      {
        type: "line",
        element: [currentPoint, lastPointFromStack],
        color: GREEN_COLOR,
      },
      {
        type: "point",
        element: lastPointFromStack,
        color: RED_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: currentPoint,
        color: ORANGE_COLOR,
        size: 6,
      },
      {
        type: "stackStatus",
        element: [...pointsStack],
      },
    ],
  };
};

const insertPointBackInStackStep = (
  pointsStack: Point[],
  currentPoint: Point,
  stackPoint: Point,
  stackPointPosition: "first" | "last"
) => {
  const stackPointPositionMessage = stackPointPosition === "last" ? "ultimul" : "primul";

  return {
    explanation: `Se insereaza inapoi in stiva ${stackPointPositionMessage} varf extras, ${stackPoint.label} si varful curent ${currentPoint.label}.`,
    graphicDrawingsStepList: [
      {
        type: "point",
        element: stackPoint,
        color: LIGHT_GREEN_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: currentPoint,
        color: LIGHT_GREEN_COLOR,
        size: 6,
      },
      {
        type: "stackStatus",
        element: [...pointsStack],
      },
    ],
  };
};

const pointsInDifferentChainsStep = (currentPoint: Point, pointsStack: Point[]) => {
  return {
    explanation: `Punctul curent, ${currentPoint.label}, si punctul din varful stivei, ${
      pointsStack[pointsStack.length - 1].label
    }, sunt in lanturi diferite.`,
    graphicDrawingsStepList: [
      {
        type: "line",
        element: [currentPoint, pointsStack[pointsStack.length - 1]],
        color: ORANGE_COLOR,
        style: "dash",
      },
      {
        type: "point",
        element: currentPoint,
        color: ORANGE_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: pointsStack[pointsStack.length - 1],
        color: LIGHT_GREEN_COLOR,
        size: 6,
      },
    ],
  };
};

const addDiagonalDifferentChainsStep = (pointsStack: Point[], currentPoint: Point, topOfStackPoint: Point) => {
  return {
    explanation: `Se extrage din stiva varful ${topOfStackPoint.label} si se adauga noua diagonala: ${currentPoint.label}${topOfStackPoint.label}.`,
    graphicDrawingsStepList: [
      {
        type: "line",
        element: [currentPoint, topOfStackPoint],
        color: GREEN_COLOR,
      },
      {
        type: "point",
        element: topOfStackPoint,
        color: RED_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: currentPoint,
        color: ORANGE_COLOR,
        size: 6,
      },
      {
        type: "stackStatus",
        element: [...pointsStack],
      },
    ],
  };
};

const firstPointInStackStep = (pointsStack: Point[], extractedPoint: Point) => {
  return {
    explanation: `Se extrage din stiva varful ${extractedPoint.label}, dar fiind ultimul, nu se adauga diagonala.`,
    graphicDrawingsStepList: [
      {
        type: "point",
        element: extractedPoint,
        color: RED_COLOR,
        size: 6,
      },
      {
        type: "stackStatus",
        element: [...pointsStack],
      },
    ],
  };
};

const finalSteps = (pointsStack: Point[], sortedPolygonPoints: Point[]) => {
  const steps: VisualizationStep[] = [];
  const lastPointInSortedList = sortedPolygonPoints[sortedPolygonPoints.length - 1];

  if (pointsStack.length > 3) {
    steps.push({
      explanation: `Se adauga diagonale de la ultimul varf din lista, ${lastPointInSortedList.label}, la varful stivei (exceptand primul si ultimul). `,
    });
  }
  for (let i = 1; i < pointsStack.length - 1; i++) {
    steps.push({
      explanation: `Se adauga diagonala ${lastPointInSortedList.label}${pointsStack[i].label}.`,
      graphicDrawingsStepList: [
        {
          type: "line",
          element: [lastPointInSortedList, pointsStack[i]],
          color: GREEN_COLOR,
        },
      ],
    });
  }

  steps.push({
    explanation: "Triangularea este completa.",
  });

  return steps;
};

const makeStackPointsLightGreenStep = (points: Point[], pointsStack: Point[], oneOfLastTwoPoints: boolean) => {
  const step: VisualizationStep = {
    graphicDrawingsStepList: [...pointsResetToInitialColor(points)],
  };
  if (!oneOfLastTwoPoints) {
    for (let j = 0; j < pointsStack.length; j++) {
      step.graphicDrawingsStepList!.push({
        type: "point",
        element: pointsStack[j],
        color: LIGHT_GREEN_COLOR,
        size: 6,
      });
    }
  }

  return step;
};

const triangulateYMonotonePolygon = (points: Point[]) => {
  const algorithmGraphicIndications: VisualizationStep[] = [];

  if (points.length == 3) {
    algorithmGraphicIndications.push({ explanation: "Poligonul dat este deja un triunghi." });
    return algorithmGraphicIndications;
  }

  let leftChain: Point[] = [];
  let rightChain: Point[] = [];
  [leftChain, rightChain] = leftAndRightChains(points);

  const sortedPolygonPoints = sortList(points, comparatorPointsByYDescending);
  algorithmGraphicIndications.push({ explanation: sortStepExplanation(sortedPolygonPoints) });

  let pointsStack = [sortedPolygonPoints[0], sortedPolygonPoints[1]];
  algorithmGraphicIndications.push(initializeStackStep(pointsStack));

  for (let i = 2; i < points.length - 1; i++) {
    const currentPoint = sortedPolygonPoints[i];

    const inSameList =
      (isPointInList(currentPoint, leftChain) && isPointInList(pointsStack[pointsStack.length - 1], leftChain)) ||
      (isPointInList(currentPoint, rightChain) && isPointInList(pointsStack[pointsStack.length - 1], rightChain));
    if (inSameList) {
      algorithmGraphicIndications.push(pointAndTopOfStackInSameChainStep(currentPoint, pointsStack));

      let lastPointFromStack = pointsStack.pop()!;
      algorithmGraphicIndications.push(extractTopOfStackStep(pointsStack, lastPointFromStack));

      while (
        pointsStack.length > 0 &&
        isInteriorDiagonal(currentPoint, lastPointFromStack, pointsStack[pointsStack.length - 1], leftChain)
      ) {
        lastPointFromStack = pointsStack.pop()!;
        algorithmGraphicIndications.push(interiorDiagonalStep(pointsStack, currentPoint, lastPointFromStack));
      }

      pointsStack.push(lastPointFromStack, currentPoint);
      algorithmGraphicIndications.push(
        insertPointBackInStackStep(pointsStack, currentPoint, lastPointFromStack, "last")
      );
    } else {
      algorithmGraphicIndications.push(pointsInDifferentChainsStep(currentPoint, pointsStack));

      const pointOnTopOfStack = pointsStack[pointsStack.length - 1];
      while (pointsStack.length > 1) {
        const topOfStack = pointsStack.pop()!;
        algorithmGraphicIndications.push(addDiagonalDifferentChainsStep(pointsStack, currentPoint, topOfStack));
      }

      const topOfStack = pointsStack.pop()!;
      algorithmGraphicIndications.push(firstPointInStackStep(pointsStack, topOfStack));

      pointsStack = [pointOnTopOfStack, currentPoint];
      algorithmGraphicIndications.push(
        insertPointBackInStackStep(pointsStack, currentPoint, pointOnTopOfStack, "first")
      );
    }

    algorithmGraphicIndications.push(makeStackPointsLightGreenStep(points, pointsStack, i >= points.length - 2));
  }

  algorithmGraphicIndications.push(...finalSteps(pointsStack, sortedPolygonPoints));

  return algorithmGraphicIndications;
};
