import { DrawingFactory, VisualizationStep } from "../../shared/models/algorithm";
import {
  Axis,
  ILine,
  Point,
  PointsOrientation,
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
  comparatorPointsByXAscending,
  comparatorPointsByYDescending,
  getLinesFromPoints,
  isPointInList,
  pointsResetToInitialColor,
  sortList,
} from "../../shared/util";
import { Language } from "../../shared/i18n";
import { getTranslation } from "../../shared/i18n/algorithmTranslations";

export const computeTriangulationSteps = (points: Point[], polygonType: Axis, lang: Language) => {
  const algorithmGraphicIndications: VisualizationStep[] = [];

  if (points.length == 3) {
    algorithmGraphicIndications.push({ explanation: getTranslation(lang, "polygonAlreadyTriangle") });
    return algorithmGraphicIndications;
  }

  let firstChain: Point[] = [];
  let secondChain: Point[] = [];
  [firstChain, secondChain] = splitPolygonInChains(points, polygonType);

  const sortedPolygonPoints = sortList(
    points,
    polygonType === Axis.x ? comparatorPointsByXAscending : comparatorPointsByYDescending
  );
  algorithmGraphicIndications.push({ explanation: sortStepExplanation(sortedPolygonPoints, polygonType, lang) });

  let pointsStack = [sortedPolygonPoints[0], sortedPolygonPoints[1]];
  algorithmGraphicIndications.push(initializeStackStep(pointsStack, lang));

  for (let i = 2; i < points.length - 1; i++) {
    const currentPoint = sortedPolygonPoints[i];

    const inSameList =
      (isPointInList(currentPoint, firstChain) && isPointInList(pointsStack[pointsStack.length - 1], firstChain)) ||
      (isPointInList(currentPoint, secondChain) && isPointInList(pointsStack[pointsStack.length - 1], secondChain));
    if (inSameList) {
      algorithmGraphicIndications.push(pointAndTopOfStackInSameChainStep(currentPoint, pointsStack, lang));

      let lastPointFromStack = pointsStack.pop()!;
      algorithmGraphicIndications.push(extractTopOfStackStep(pointsStack, lastPointFromStack, lang));

      while (
        pointsStack.length > 0 &&
        isInteriorDiagonal(currentPoint, lastPointFromStack, pointsStack[pointsStack.length - 1], firstChain)
      ) {
        lastPointFromStack = pointsStack.pop()!;
        algorithmGraphicIndications.push(interiorDiagonalStep(pointsStack, currentPoint, lastPointFromStack, lang));
      }

      pointsStack.push(lastPointFromStack, currentPoint);
      algorithmGraphicIndications.push(
        insertPointBackInStackStep(pointsStack, currentPoint, lastPointFromStack, "last", lang)
      );
    } else {
      algorithmGraphicIndications.push(pointsInDifferentChainsStep(currentPoint, pointsStack, lang));

      const pointOnTopOfStack = pointsStack[pointsStack.length - 1];
      while (pointsStack.length > 1) {
        const topOfStack = pointsStack.pop()!;
        algorithmGraphicIndications.push(addDiagonalDifferentChainsStep(pointsStack, currentPoint, topOfStack, lang));
      }

      const topOfStack = pointsStack.pop()!;
      algorithmGraphicIndications.push(firstPointInStackStep(pointsStack, topOfStack, lang));

      pointsStack = [pointOnTopOfStack, currentPoint];
      algorithmGraphicIndications.push(
        insertPointBackInStackStep(pointsStack, currentPoint, pointOnTopOfStack, "first", lang)
      );
    }

    algorithmGraphicIndications.push(makeStackPointsLightGreenStep(points, pointsStack, i >= points.length - 2));
  }

  algorithmGraphicIndications.push(...finalSteps(pointsStack, sortedPolygonPoints, lang));

  return algorithmGraphicIndications;
};

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
  if (axis === Axis.x) {
    return currPoint.x < nextPoint.x && currPoint.x < prevPoint.x;
  } else {
    return currPoint.y < nextPoint.y && currPoint.y < prevPoint.y;
  }
};

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

const isFirstPointGreater = (p1: Point, p2: Point, axis: Axis) => {
  return axis === Axis.x ? p1.x > p2.x : p1.y > p2.y;
};

export const splitPolygonInChains = (points: Point[], polygonType: Axis) => {
  const firstChain: Point[] = [];
  const secondChain: Point[] = [];
  const greatestCoordPoint = points.reduce((prev, current) =>
    prev && isFirstPointGreater(prev, current, polygonType) ? prev : current
  );
  const smallestCoordPoint = points.reduce((prev, current) =>
    prev && !isFirstPointGreater(prev, current, polygonType) ? prev : current
  );
  const firstPoint = polygonType === Axis.x ? smallestCoordPoint : greatestCoordPoint;
  const endPoint = polygonType === Axis.x ? greatestCoordPoint : smallestCoordPoint;
  const firstPointIdx = points.findIndex((p) => arePointsEqual(p, firstPoint))!;
  let hitBottom = false;

  firstChain.push(firstPoint);

  for (let i = 1; i < points.length; i++) {
    const currentIndex = (i + firstPointIdx) % points.length;

    if (!hitBottom) {
      firstChain.push(points[currentIndex]);
    } else {
      secondChain.push(points[currentIndex]);
    }

    if (arePointsEqual(points[currentIndex], endPoint) && !hitBottom) {
      hitBottom = true;
    }
  }

  if (secondChain.length) {
    if (isFirstPointGreater(firstChain[1], secondChain[0], polygonType === Axis.x ? Axis.y : Axis.x)) {
      return [secondChain, firstChain];
    }
    return [firstChain, secondChain];
  }

  if (isFirstPointGreater(firstChain[0], firstChain[1], polygonType === Axis.x ? Axis.y : Axis.x)) {
    return [firstChain, secondChain];
  }
  return [secondChain, firstChain];
};

const isInteriorDiagonal = (
  currentPoint: Point,
  lastPointFromStack: Point,
  topOfStackPoint: Point,
  firstChain: Point[]
) => {
  const inFirstChain = isPointInList(currentPoint, firstChain) && isPointInList(lastPointFromStack, firstChain);
  const orientation = calculateOrientationForNormalPoints(currentPoint, lastPointFromStack, topOfStackPoint);

  if (inFirstChain) {
    return orientation === PointsOrientation.Right;
  } else {
    return orientation === PointsOrientation.Left;
  }
};

const sortStepExplanation = (sortedPoints: Point[], axis: Axis, lang: Language) => {
  const order = axis === Axis.x ? getTranslation(lang, "ascending") : getTranslation(lang, "descending");
  const pointsList = sortedPoints.map((p) => p.label).join(", ");
  return getTranslation(lang, "verticesSorted", { order, axis, points: pointsList });
};

const initializeStackStep = (pointsStack: Point[], lang: Language): VisualizationStep => {
  return {
    explanation: getTranslation(lang, "initializeStack"),
    graphicDrawingsStepList: [
      DrawingFactory.point(pointsStack[0], LIGHT_GREEN_COLOR, "focused"),
      DrawingFactory.point(pointsStack[1], LIGHT_GREEN_COLOR, "focused"),
    ],
    customElement: {
      type: "stackStatus",
      stackPoints: [...pointsStack],
    },
  };
};

const pointAndTopOfStackInSameChainStep = (currentPoint: Point, pointsStack: Point[], lang: Language) => {
  return {
    explanation: getTranslation(lang, "currentAndTopSameChain", {
      current: currentPoint.label,
      top: pointsStack[pointsStack.length - 1].label,
    }),
    graphicDrawingsStepList: [
      DrawingFactory.point(currentPoint, ORANGE_COLOR, "focused"),
      DrawingFactory.point(pointsStack[pointsStack.length - 1], ORANGE_COLOR, "focused"),
    ],
  };
};

const extractTopOfStackStep = (pointsStack: Point[], lastPointFromStack: Point, lang: Language): VisualizationStep => {
  return {
    explanation: getTranslation(lang, "extractTop", { label: lastPointFromStack.label }),
    graphicDrawingsStepList: [DrawingFactory.point(lastPointFromStack, RED_COLOR, "focused")],
    customElement: {
      type: "stackStatus",
      stackPoints: [...pointsStack],
    },
  };
};

const interiorDiagonalStep = (
  pointsStack: Point[],
  currentPoint: Point,
  lastPointFromStack: Point,
  lang: Language
): VisualizationStep => {
  return {
    explanation: getTranslation(lang, "extractedForDiagonal", {
      extracted: lastPointFromStack.label,
      current: currentPoint.label,
    }),
    graphicDrawingsStepList: [
      DrawingFactory.lineFromPoints(currentPoint, lastPointFromStack, GREEN_COLOR),
      DrawingFactory.point(lastPointFromStack, RED_COLOR, "focused"),
      DrawingFactory.point(currentPoint, ORANGE_COLOR, "focused"),
    ],
    customElement: {
      type: "stackStatus",
      stackPoints: [...pointsStack],
    },
  };
};

const insertPointBackInStackStep = (
  pointsStack: Point[],
  currentPoint: Point,
  stackPoint: Point,
  stackPointPosition: "first" | "last",
  lang: Language
): VisualizationStep => {
  const position =
    stackPointPosition === "last" ? getTranslation(lang, "lastPosition") : getTranslation(lang, "firstPosition");

  return {
    explanation: getTranslation(lang, "insertBackInStack", {
      position,
      vertex: stackPoint.label,
      current: currentPoint.label,
    }),
    graphicDrawingsStepList: [
      DrawingFactory.point(stackPoint, LIGHT_GREEN_COLOR, "focused"),
      DrawingFactory.point(currentPoint, LIGHT_GREEN_COLOR, "focused"),
    ],
    customElement: {
      type: "stackStatus",
      stackPoints: [...pointsStack],
    },
  };
};

const pointsInDifferentChainsStep = (currentPoint: Point, pointsStack: Point[], lang: Language) => {
  return {
    explanation: getTranslation(lang, "differentChains", {
      current: currentPoint.label,
      top: pointsStack[pointsStack.length - 1].label,
    }),
    graphicDrawingsStepList: [
      DrawingFactory.lineFromPoints(currentPoint, pointsStack[pointsStack.length - 1], ORANGE_COLOR, "dash"),
      DrawingFactory.point(currentPoint, ORANGE_COLOR, "focused"),
      DrawingFactory.point(pointsStack[pointsStack.length - 1], LIGHT_GREEN_COLOR, "focused"),
    ],
  };
};

const addDiagonalDifferentChainsStep = (
  pointsStack: Point[],
  currentPoint: Point,
  topOfStackPoint: Point,
  lang: Language
): VisualizationStep => {
  return {
    explanation: getTranslation(lang, "extractAndAddDiagonal", {
      vertex: topOfStackPoint.label,
      diagonal: currentPoint.label + topOfStackPoint.label,
    }),
    graphicDrawingsStepList: [
      DrawingFactory.lineFromPoints(currentPoint, topOfStackPoint, GREEN_COLOR),
      DrawingFactory.point(topOfStackPoint, RED_COLOR, "focused"),
      DrawingFactory.point(currentPoint, ORANGE_COLOR, "focused"),
    ],
    customElement: {
      type: "stackStatus",
      stackPoints: [...pointsStack],
    },
  };
};

const firstPointInStackStep = (pointsStack: Point[], extractedPoint: Point, lang: Language): VisualizationStep => {
  return {
    explanation: getTranslation(lang, "extractLastNoDiagonal", { vertex: extractedPoint.label }),
    graphicDrawingsStepList: [DrawingFactory.point(extractedPoint, RED_COLOR, "focused")],
    customElement: {
      type: "stackStatus",
      stackPoints: [...pointsStack],
    },
  };
};

const finalSteps = (pointsStack: Point[], sortedPolygonPoints: Point[], lang: Language) => {
  const steps: VisualizationStep[] = [];
  const lastPointInSortedList = sortedPolygonPoints[sortedPolygonPoints.length - 1];

  if (pointsStack.length > 3) {
    steps.push({
      explanation: getTranslation(lang, "addDiagonalsFromLast", { vertex: lastPointInSortedList.label }),
    });
  }
  for (let i = 1; i < pointsStack.length - 1; i++) {
    steps.push({
      explanation: getTranslation(lang, "addDiagonal", {
        diagonal: lastPointInSortedList.label + pointsStack[i].label,
      }),
      graphicDrawingsStepList: [DrawingFactory.lineFromPoints(lastPointInSortedList, pointsStack[i], GREEN_COLOR)],
    });
  }

  steps.push({
    explanation: getTranslation(lang, "triangulationComplete"),
  });

  return steps;
};

const makeStackPointsLightGreenStep = (points: Point[], pointsStack: Point[], oneOfLastTwoPoints: boolean) => {
  const step: VisualizationStep = {
    graphicDrawingsStepList: [...pointsResetToInitialColor(points)],
  };
  if (!oneOfLastTwoPoints) {
    for (let j = 0; j < pointsStack.length; j++) {
      step.graphicDrawingsStepList!.push(DrawingFactory.point(pointsStack[j], LIGHT_GREEN_COLOR, "focused"));
    }
  }

  return step;
};
