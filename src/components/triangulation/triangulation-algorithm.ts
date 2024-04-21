import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import {
  Axis,
  ILine,
  Point,
  arePointsEqual,
  calculateOrientationForNormalPoints,
  convertPointBetweenAlgorithmAndCanvas,
} from "../../shared/models/geometry";
import {
  BLUE_COLOR,
  GREEN_COLOR,
  GREY_COLOR,
  LIGHT_GREEN_COLOR,
  ORANGE_COLOR,
  RED_COLOR,
  comparatorPointsByYDescending,
  getLinesFromPoints,
  isPointInList,
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
// the points are assumed to be in trigonometric order
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

// the legacy method for checking if a polygon is y-monotone
export const checkYMonotone = (points: Point[], leftChain: Point[], rightChain: Point[]) => {
  let indexMinPoint = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[indexMinPoint].y) {
      indexMinPoint = i;
    }
  }
  rightChain.push(points[indexMinPoint]);

  let ascending = true;
  for (let i = 1; i < points.length; i++) {
    const currentIndex = (i + indexMinPoint) % points.length;
    const previous = currentIndex == 0 ? points.length - 1 : currentIndex - 1;
    //daca parcurgerea este in jos/scad, dar punctul curent are coordonata mai mare decat precedentul
    // returnez False deoarece am intalnit deja punctul maxim cand am schimbat directia (nu poate exista altul)
    if (points[previous].y < points[currentIndex].y && ascending == false) return false;

    // daca urc si intalnesc un punct care are coordonata y < precedentul, inseamna ca schimb directia (parcurgere in jos)
    // nu returnez False deoarece punctele sunt parcurse trigonometric deci poate am dat de punctul maxim
    if (points[previous].y > points[currentIndex].y && ascending == true) ascending = false;

    if (ascending) {
      rightChain.push(points[currentIndex]);
    } else {
      leftChain.push(points[currentIndex]);
    }
  }
  return true;
};

const isInteriorDiagonal = (
  currentPoint: Point,
  pointOnTopOfStack: Point,
  topOfStackPoint: Point,
  leftChain: Point[]
) => {
  const inLeftChain = isPointInList(currentPoint, leftChain) && isPointInList(pointOnTopOfStack, leftChain);
  const orientation = calculateOrientationForNormalPoints(currentPoint, pointOnTopOfStack, topOfStackPoint);

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
        color: GREEN_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: pointsStack[1],
        color: GREEN_COLOR,
        size: 6,
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

const extractTopOfStackStep = (lastPointFromStack: Point) => {
  return {
    explanation: "Se extrage un varf din stiva. ",
    graphicDrawingsStepList: [
      {
        type: "point",
        element: lastPointFromStack,
        color: RED_COLOR,
        size: 6,
      },
    ],
  };
};

const interiorDiagonalStep = (currentPoint: Point, lastPointFromStack: Point) => {
  return {
    explanation: `Se extrage varful ${lastPointFromStack.label} din stiva pentru ca formeaza cu ${currentPoint.label} diagonala interioara poligonului. `,
    graphicDrawingsStepList: [
      {
        type: "addDiagonal",
        element: [currentPoint, lastPointFromStack],
      },
      {
        type: "line",
        element: [currentPoint, lastPointFromStack],
        color: LIGHT_GREEN_COLOR,
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
    ],
  };
};

const insertPointBackInStackStep = (currentPoint: Point, stackPoint: Point, stackPointPosition: "first" | "last") => {
  const stackPointPositionMessage = stackPointPosition === "last" ? "ultimul" : "primul";

  return {
    explanation: `Se insereaza inapoi in stiva ${stackPointPositionMessage} varf extras, ${stackPoint.label} si varful curent ${currentPoint.label}. `, //TODO: remove space
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
    ],
  };
};

const pointsInDifferentChainsStep = (currentPoint: Point, pointsStack: Point[]) => {
  return {
    explanation: `Punctul curent, ${currentPoint.label}, si punctul din varful stivei, ${
      pointsStack[pointsStack.length - 1].label
    }, sunt in lanturi diferite. `,
    graphicDrawingsStepList: [
      {
        type: "addDiagonal",
        element: [currentPoint, pointsStack[pointsStack.length - 1]],
      },
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

const addDiagonalDifferentChainsStep = (currentPoint: Point, otherPoint: Point) => {
  return {
    explanation: `Se extrage din stiva varful ${otherPoint.label} si se adauga noua diagonala: ${currentPoint.label}${otherPoint.label}. `,
    graphicDrawingsStepList: [
      {
        type: "addDiagonal",
        element: [currentPoint, otherPoint],
      },
      {
        type: "line",
        element: [currentPoint, otherPoint],
        color: GREEN_COLOR,
      },
      {
        type: "point",
        element: otherPoint,
        color: RED_COLOR,
        size: 6,
      },
      {
        type: "point",
        element: currentPoint,
        color: ORANGE_COLOR,
        size: 6,
      },
    ],
  };
};

const firstPointInStackStep = (firstPointInStack: Point) => {
  return {
    explanation: `Se extrage din stiva varful ${firstPointInStack.label}, dar fiind ultimul, nu se adauga diagonala. `,
    graphicDrawingsStepList: [
      {
        type: "point",
        element: firstPointInStack,
        color: RED_COLOR,
        size: 6,
      },
    ],
  };
};

const finalSteps = (pointsStack: Point[], sortedPolygonPoints: Point[]) => {
  const steps: VisualizationStep[] = [];

  const lastPointInSortedList = sortedPolygonPoints[sortedPolygonPoints.length - 1];
  for (let i = 1; i < pointsStack.length - 1; i++) {
    const step = {
      message: `Se adauga diagonale de la ultimul varf din lista, ${lastPointInSortedList.label}, la varful stivei (exceptand primul ̧si ultimul). `,
      graphicDrawingsStepList: [
        {
          type: "addDiagonal",
          element: [lastPointInSortedList, pointsStack[i - 1]], //FIXME: this was j before, changed randomly to i - 1
        },
        {
          type: "line",
          element: [lastPointInSortedList, pointsStack[i]],
          color: BLUE_COLOR,
        },
      ] as Drawing[],
    };
    if (i == pointsStack.length - 2) {
      step.graphicDrawingsStepList.push({ type: "redrawCanvasElements" });
    }

    steps.push(step);
  }

  return steps;
};

const makeStackPointsLightGreenStep = (pointsStack: Point[], oneOfLastTwoPoints: boolean) => {
  const step: VisualizationStep = {
    graphicDrawingsStepList: [
      {
        type: "redrawCanvasElements",
      },
    ],
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

  const leftChain: Point[] = [];
  const rightChain: Point[] = [];
  // determine the left and right chains
  checkYMonotone(points, leftChain, rightChain);

  if (points.length == 3) {
    algorithmGraphicIndications.push({ explanation: "Poligonul dat este deja un triunghi." });
    return algorithmGraphicIndications;
  }

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
      algorithmGraphicIndications.push(extractTopOfStackStep(lastPointFromStack));

      while (
        pointsStack.length > 0 &&
        isInteriorDiagonal(currentPoint, lastPointFromStack, pointsStack[pointsStack.length - 1], leftChain)
      ) {
        lastPointFromStack = pointsStack.pop()!;
        algorithmGraphicIndications.push(interiorDiagonalStep(currentPoint, lastPointFromStack));
      }

      pointsStack.push(lastPointFromStack, currentPoint);
      algorithmGraphicIndications.push(insertPointBackInStackStep(currentPoint, lastPointFromStack, "last"));
    } else {
      algorithmGraphicIndications.push(pointsInDifferentChainsStep(currentPoint, pointsStack));

      const pointOnTopOfStack = pointsStack[pointsStack.length - 1];
      for (let j = pointsStack.length - 1; j > 0; j--) {
        algorithmGraphicIndications.push(addDiagonalDifferentChainsStep(currentPoint, pointsStack[j]));
      }

      pointsStack.pop();
      algorithmGraphicIndications.push(firstPointInStackStep(pointsStack[0]));

      pointsStack = [pointOnTopOfStack, currentPoint];
      algorithmGraphicIndications.push(insertPointBackInStackStep(currentPoint, pointOnTopOfStack, "first"));
    }

    algorithmGraphicIndications.push(makeStackPointsLightGreenStep(pointsStack, i >= points.length - 2));
  }

  algorithmGraphicIndications.push(...finalSteps(pointsStack, sortedPolygonPoints));

  return algorithmGraphicIndications;
};
