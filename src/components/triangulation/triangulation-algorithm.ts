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

const triangulateYMonotonePolygon = (points: Point[]) => {
  const algorithmGraphicIndications: VisualizationStep[] = [];
  const numberOfPoints = points.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let step: any; // FIXME: remove any

  const leftChain: Point[] = [];
  const rightChain: Point[] = [];
  // determine the left and right chains
  checkYMonotone(points, leftChain, rightChain);

  if (numberOfPoints == 3) {
    step = { explanation: "Poligonul dat este deja un triunghi." };
    algorithmGraphicIndications.push(step);
    return algorithmGraphicIndications;
  }
  const sortedPolygonPoints = sortList(points, comparatorPointsByYDescending);
  let message = "Varfurile se ordoneaza descrescător după y (dacă ordinea este egală, se folosește abscisa): ";
  for (let i = 0; i < sortedPolygonPoints.length; i++) {
    if (i > 0) message = message + ", ";
    message = message + sortedPolygonPoints[i].label;
  }
  step = { explanation: message };
  algorithmGraphicIndications.push(step);

  let pointsStack = [sortedPolygonPoints[0], sortedPolygonPoints[1]];
  let pointsLettersStack = [pointsStack[0].label, pointsStack[1].label];
  step = {
    explanation: "Se initializeaza stiva cu primele 2 varfuri. ",
    stackStatus: pointsLettersStack.slice(),
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
  algorithmGraphicIndications.push(step);

  for (let i = 2; i < numberOfPoints - 1; i++) {
    const currentPoint = sortedPolygonPoints[i];

    const inSameList =
      (isPointInList(currentPoint, leftChain) && isPointInList(pointsStack[pointsStack.length - 1], leftChain)) ||
      (isPointInList(currentPoint, rightChain) && isPointInList(pointsStack[pointsStack.length - 1], rightChain));
    if (inSameList) {
      step = {
        explanation:
          "Punctul curent, " +
          currentPoint.label +
          ", si punctul din varful stivei, " +
          pointsStack[pointsStack.length - 1].label +
          ", sunt in acelasi lant. ",
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
      algorithmGraphicIndications.push(step);

      let lastPointFromStack = pointsStack[pointsStack.length - 1];
      pointsStack.pop();
      pointsLettersStack.pop();
      step = {
        explanation: "Se extrage un varf din stiva. ",
        stackStatus: pointsLettersStack.slice(),
        graphicDrawingsStepList: [
          {
            type: "point",
            element: lastPointFromStack,
            color: RED_COLOR,
            size: 6,
          },
        ],
      };
      algorithmGraphicIndications.push(step);

      while (
        pointsStack.length > 0 &&
        isDiagonalInterior(currentPoint, lastPointFromStack, pointsStack[pointsStack.length - 1], leftChain)
      ) {
        lastPointFromStack = pointsStack[pointsStack.length - 1];
        pointsStack.pop();
        pointsLettersStack.pop();
        step = {
          explanation:
            "Se extrage varful " +
            lastPointFromStack.label +
            " din stiva pentru ca formeaza cu " +
            currentPoint.label +
            " diagonala interioara poligonului. ",
          stackStatus: pointsLettersStack.slice(),
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
        algorithmGraphicIndications.push(step);
      }

      pointsStack.push(lastPointFromStack);
      pointsStack.push(currentPoint);
      pointsLettersStack.push(lastPointFromStack.label);
      pointsLettersStack.push(currentPoint.label);
      step = {
        explanation:
          "Se insereaza inapoi in stiva ultimul varf extras, " +
          lastPointFromStack.label +
          " si varful curent " +
          currentPoint.label +
          ". ",
        stackStatus: pointsLettersStack.slice(),
        graphicDrawingsStepList: [
          {
            type: "point",
            element: lastPointFromStack,
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
      algorithmGraphicIndications.push(step);
    } else {
      step = {
        explanation:
          "Punctul curent, " +
          currentPoint.label +
          ", si punctul din varful stivei, " +
          pointsStack[pointsStack.length - 1].label +
          ", sunt in lanturi diferite. ",
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
      algorithmGraphicIndications.push(step);

      const pointOnTopOfStack = pointsStack[pointsStack.length - 1];
      for (let j = pointsStack.length - 1; j > 0; j--) {
        pointsLettersStack.pop();
        step = {
          explanation:
            "Se extrage din stiva varful " +
            pointsStack[j].label +
            " si se adauga noua diagonala: " +
            currentPoint.label +
            pointsStack[j].label +
            ". ",
          stackStatus: pointsLettersStack.slice(),
          graphicDrawingsStepList: [
            {
              type: "addDiagonal",
              element: [currentPoint, pointsStack[j]],
            },
            {
              type: "line",
              element: [currentPoint, pointsStack[j]],
              color: GREEN_COLOR,
            },
            {
              type: "point",
              element: pointsStack[j],
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
        algorithmGraphicIndications.push(step);
      }

      const firstPointInStack = pointsStack[0];
      pointsStack.pop();
      pointsLettersStack.pop();
      step = {
        explanation:
          "Se extrage din stiva varful " + firstPointInStack.label + ", dar fiind ultimul, nu se adauga diagonala. ",
        stackStatus: pointsLettersStack.slice(),
        graphicDrawingsStepList: [
          {
            type: "point",
            element: firstPointInStack,
            color: RED_COLOR,
            size: 6,
          },
        ],
      };
      algorithmGraphicIndications.push(step);

      pointsStack = [pointOnTopOfStack, currentPoint];
      pointsLettersStack = [pointsStack[0].label, pointsStack[1].label];
      step = {
        explanation:
          "Se insereaza inapoi in stiva primul varf extras, " +
          pointOnTopOfStack.label +
          " si varful curent " +
          currentPoint.label +
          ". ",
        stackStatus: pointsLettersStack.slice(),
        graphicDrawingsStepList: [
          {
            type: "point",
            element: pointOnTopOfStack,
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
      algorithmGraphicIndications.push(step);
    }

    step = {
      graphicDrawingsStepList: [
        {
          type: "redrawCanvasElements",
        },
      ],
    };
    if (i < numberOfPoints - 2) {
      for (let i = 0; i < pointsStack.length; i++) {
        step.graphicDrawingsStepList.push({
          type: "point",
          element: pointsStack[i],
          color: LIGHT_GREEN_COLOR,
          size: 6,
        });
      }
    }
    algorithmGraphicIndications.push(step);
  }

  const lastPointInSortedList = sortedPolygonPoints[sortedPolygonPoints.length - 1];
  for (let i = 1; i < pointsStack.length - 1; i++) {
    step = {
      message:
        "Se adauga diagonale de la ultimul varf din lista, " +
        lastPointInSortedList.label +
        ", la varful stivei (exceptand primul ̧si ultimul). ",
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
      ],
    };
    if (i == pointsStack.length - 2) {
      step.graphicDrawingsStepList.push({ type: "redrawCanvasElements" });
    }
    algorithmGraphicIndications.push(step);
  }

  return algorithmGraphicIndications;
};

const isDiagonalInterior = (
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
