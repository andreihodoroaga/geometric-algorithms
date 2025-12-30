import randomColor from "randomcolor";
import { Drawing, DrawingFactory, LineDrawing, PointDrawing, VisualizationStep } from "../../shared/models/algorithm";
import {
  calculateOrientationForNormalPoints,
  findAngle,
  ILine,
  LeftRight,
  Point,
  PointsOrientation,
  SimplePoint,
} from "../../shared/models/geometry";
import {
  getLinesFromPoints,
  GREEN_COLOR,
  GREY_COLOR,
  ORANGE_COLOR,
  pointsResetToInitialColor,
  RED_COLOR,
  shuffleArray,
} from "../../shared/util";
import { Language } from "../../shared/i18n";
import { getTranslation } from "../../shared/i18n/algorithmTranslations";

type ConvexHullPart = "lower" | "upper";

interface PartialConvexHull {
  points: Point[];
  edges: ILine[];
  htmlLabel: string;
}

const convexHullDrawingFromPoints = (points: Point[]): Drawing[] => {
  return [
    ...points.map((p) => DrawingFactory.point(p, GREEN_COLOR)),
    ...getLinesFromPoints(points).map((line) =>
      DrawingFactory.lineFromPoints(line.startPoint, line.endPoint, GREEN_COLOR)
    ),
  ];
};

const convexHullUpdatedSteps = (points: Point[], convexHullPoints: Point[]): Drawing[] => {
  return [
    DrawingFactory.clearCanvas,
    ...pointsResetToInitialColor(points),
    ...convexHullDrawingFromPoints(convexHullPoints),
  ];
};

const getConvexHullPartFinalDrawings = (partVisualizationSteps: VisualizationStep[]) => {
  const lastLowerConvexHullStep = partVisualizationSteps[partVisualizationSteps.length - 1];
  return lastLowerConvexHullStep.graphicDrawingsStepList!.filter(
    (pointOrLine): pointOrLine is PointDrawing | LineDrawing =>
      pointOrLine.type === "line" || (pointOrLine as PointDrawing).color === GREEN_COLOR
  );
};

export const computeGrahamScanSteps = (sortedPoints: Point[], lang: Language) => {
  const lowerConvexHullSteps = determineConvexHullPart(sortedPoints, "lower", lang);
  const upperConvexHullSteps = determineConvexHullPart(sortedPoints, "upper", lang);

  const lastStep: VisualizationStep = {
    explanation: getTranslation(lang, "convexHullComplete"),
    graphicDrawingsStepList: getConvexHullPartFinalDrawings(lowerConvexHullSteps),
  };

  return [...lowerConvexHullSteps, ...upperConvexHullSteps, lastStep];
};

export const determineConvexHullPart = (points: Point[], part: ConvexHullPart, lang: Language) => {
  if (part === "upper") {
    points = [...points].reverse();
  }

  const algorithmGraphicIndications: VisualizationStep[] = [];
  const convexHullPart = [points[0], points[1]];

  let stepExplanation =
    part === "upper"
      ? getTranslation(lang, "similarlyUpperBoundary", {
          p1: convexHullPart[0].label,
          p2: convexHullPart[1].label,
        })
      : getTranslation(lang, "pointsSortedLexLower", {
          p1: convexHullPart[0].label,
          p2: convexHullPart[1].label,
        });

  algorithmGraphicIndications.push({
    explanation: stepExplanation,
    graphicDrawingsStepList: convexHullUpdatedSteps(points, convexHullPart),
  });

  for (let i = 2; i < points.length; i++) {
    algorithmGraphicIndications.push({
      explanation: getTranslation(lang, "pointAddedToList", { label: points[i].label }),
      graphicDrawingsStepList: [DrawingFactory.point(points[i], ORANGE_COLOR)],
    });

    while (convexHullPart.length >= 2) {
      const secondLastPoint = convexHullPart[convexHullPart.length - 2];
      const lastPoint = convexHullPart[convexHullPart.length - 1];
      const orientation = calculateOrientationForNormalPoints(secondLastPoint, lastPoint, points[i]);
      if (orientation == PointsOrientation.Left) {
        const temporaryConvexHullPart = convexHullPart.slice();
        temporaryConvexHullPart.push(points[i]);
        const visualizationStep = {
          explanation: getTranslation(lang, "leftTurnNoDelete", {
            p1: secondLastPoint.label,
            p2: lastPoint.label,
            p3: points[i].label,
          }),
          graphicDrawingsStepList: convexHullUpdatedSteps(points, temporaryConvexHullPart),
        };
        algorithmGraphicIndications.push(visualizationStep);
        break;
      } else {
        stepExplanation = getTranslation(lang, "pointsAre", {
          p1: secondLastPoint.label,
          p2: lastPoint.label,
          p3: points[i].label,
        });
        if (orientation == 0) {
          stepExplanation += getTranslation(lang, "areCollinear");
        } else {
          stepExplanation += getTranslation(lang, "formRightTurn");
        }
        stepExplanation += getTranslation(lang, "soPointDeleted", { label: lastPoint.label });

        convexHullPart.pop();
        const temporaryConvexHullPart = convexHullPart.slice();
        temporaryConvexHullPart.push(points[i]);

        algorithmGraphicIndications.push({
          explanation: stepExplanation,
          graphicDrawingsStepList: [
            ...convexHullUpdatedSteps(points, temporaryConvexHullPart),
            DrawingFactory.lineFromPoints(secondLastPoint, lastPoint, RED_COLOR, "dash"),
            DrawingFactory.lineFromPoints(lastPoint, points[i], RED_COLOR, "dash"),
            DrawingFactory.point(lastPoint, RED_COLOR),
          ],
        });
      }
    }
    convexHullPart.push(points[i]);

    const pointsList = convexHullPart.map((p) => p.label).join(", ");
    const messageConvexHullList =
      part === "lower"
        ? getTranslation(lang, "lowerBoundaryContains", { points: pointsList })
        : getTranslation(lang, "upperBoundaryContains", { points: pointsList });

    algorithmGraphicIndications.push({
      explanation: messageConvexHullList,
      graphicDrawingsStepList: convexHullUpdatedSteps(points, convexHullPart),
    });
  }

  return algorithmGraphicIndications;
};

const getIndexOfExtremePoint = (pointsOnCanvas: Point[], position: LeftRight) => {
  let extremePoint = pointsOnCanvas[0];
  let extremePointIndex = 0;

  for (let i = 0; i < pointsOnCanvas.length; i++) {
    if (
      (position === "left" && pointsOnCanvas[i].x < extremePoint.x) ||
      (position === "right" && pointsOnCanvas[i].x > extremePoint.x)
    ) {
      extremePoint = pointsOnCanvas[i];
      extremePointIndex = i;
    }
  }

  return extremePointIndex;
};

export const computeJarvisMarchExecutionSteps = (pointsOnCanvas: Point[], lang: Language) => {
  const convexHullPoints = [];
  const algorithmGraphicIndications: VisualizationStep[] = [];

  const leftMostPointIndex = getIndexOfExtremePoint(pointsOnCanvas, "left");
  let currentPointIndex = leftMostPointIndex;
  let currentPoint = pointsOnCanvas[currentPointIndex];
  convexHullPoints.push(currentPoint);

  algorithmGraphicIndications.push({
    explanation: getTranslation(lang, "convexHullInitSmallest", { label: currentPoint.label }),
    graphicDrawingsStepList: [DrawingFactory.point(currentPoint, GREEN_COLOR, "focused")],
  });

  let pivotPoint;
  let pivotIndex;
  let valid = true;

  while (valid) {
    do {
      pivotIndex = Math.floor(Math.random() * pointsOnCanvas.length);
    } while (pivotIndex == currentPointIndex);

    pivotPoint = pointsOnCanvas[pivotIndex];
    let visualizationStep: VisualizationStep = {
      explanation: getTranslation(lang, "chooseArbitraryPivot", { label: pivotPoint.label }),
      graphicDrawingsStepList: [
        DrawingFactory.lineFromPoints(currentPoint, pivotPoint, ORANGE_COLOR),
        DrawingFactory.point(currentPoint, GREEN_COLOR),
        DrawingFactory.point(pivotPoint, ORANGE_COLOR, "focused"),
      ],
    };
    algorithmGraphicIndications.push(visualizationStep);

    for (let i = 0; i < pointsOnCanvas.length; i++) {
      const testedPoint = pointsOnCanvas[i];
      visualizationStep = {
        explanation: getTranslation(lang, "pointChosenForComparison", { label: testedPoint.label }),
        graphicDrawingsStepList: [DrawingFactory.point(testedPoint, RED_COLOR, "focused")],
      };
      algorithmGraphicIndications.push(visualizationStep);

      const orientation = calculateOrientationForNormalPoints(currentPoint, pivotPoint, testedPoint);
      if (orientation == PointsOrientation.Right) {
        algorithmGraphicIndications.push({
          explanation: getTranslation(lang, "pointRightOfEdgeBecomePivot", {
            point: testedPoint.label,
            edge: currentPoint.label + pivotPoint.label,
          }),
          graphicDrawingsStepList: [
            ...convexHullUpdatedSteps(pointsOnCanvas, convexHullPoints),
            DrawingFactory.lineFromPoints(currentPoint, testedPoint, ORANGE_COLOR),
            DrawingFactory.point(currentPoint, GREEN_COLOR),
            DrawingFactory.point(testedPoint, ORANGE_COLOR, "focused"),
          ],
        });

        pivotPoint = testedPoint;
        pivotIndex = i;
      } else {
        algorithmGraphicIndications.push({
          explanation: getTranslation(lang, "pointNotRightOfEdge", {
            point: testedPoint.label,
            edge: currentPoint.label + pivotPoint.label,
          }),
          graphicDrawingsStepList: [
            ...convexHullUpdatedSteps(pointsOnCanvas, convexHullPoints),
            DrawingFactory.lineFromPoints(currentPoint, pivotPoint, ORANGE_COLOR),
            DrawingFactory.point(currentPoint, GREEN_COLOR),
            DrawingFactory.point(pivotPoint, ORANGE_COLOR, "focused"),
          ],
        });
      }
    }

    if (convexHullPoints[0].x == pivotPoint.x && convexHullPoints[0].y == pivotPoint.y) {
      valid = false;
    } else {
      convexHullPoints.push(pivotPoint);
      currentPoint = pivotPoint;
      currentPointIndex = pivotIndex;

      algorithmGraphicIndications.push({
        explanation: getTranslation(lang, "pointAddedToConvexHull", { label: pivotPoint.label }),
        graphicDrawingsStepList: convexHullUpdatedSteps(pointsOnCanvas, convexHullPoints),
      });
    }
  }

  const pointsList = convexHullPoints.map((p) => p.label).join(", ");
  convexHullPoints.push(convexHullPoints[0]);

  algorithmGraphicIndications.push({
    explanation: getTranslation(lang, "convexHullFormedByPoints", { points: pointsList }),
    graphicDrawingsStepList: convexHullDrawingFromPoints(convexHullPoints),
  });

  return algorithmGraphicIndications;
};

const chanPartialHullVisualizationSteps = (partialHulls: PartialConvexHull[], lang: Language): VisualizationStep[] => {
  return partialHulls.map(({ points, htmlLabel }) => {
    return {
      explanation: getTranslation(lang, "formSubset", { label: htmlLabel, count: points.length }),
      graphicDrawingsStepList: points.map((point) => DrawingFactory.point(point, point.color)),
    };
  });
};

const chanPartialHullsPoints = (points: Point[], m: number): Point[][] => {
  const colors = ["#4e98ed", "#3f107c", "#db964c", "#a8ba21", "#cc4f83"];
  const shuffledPoints = shuffleArray(points);
  const subsets = [];
  const n = shuffledPoints.length;
  let startIndex = 0;

  while (startIndex < n) {
    const groupColor = startIndex / m < colors.length ? colors[startIndex / m] : randomColor();
    const subset = shuffledPoints.slice(startIndex, startIndex + m);
    subsets.push(subset.map((p) => ({ ...p, color: groupColor })));
    startIndex += m;
  }

  return subsets;
};

const chanPartialHulls = (partialHullsPoints: Point[][], lang: Language) => {
  const partialHulls: PartialConvexHull[] = [];

  partialHullsPoints.forEach((pointSubset, i) => {
    let convexHullEdges: ILine[] = [];

    if (pointSubset.length > 1) {
      const jarvisMarchExecutionSteps = computeJarvisMarchExecutionSteps(pointSubset, lang);
      const pointsOnConvexHull = jarvisMarchExecutionSteps[jarvisMarchExecutionSteps.length - 1]
        .graphicDrawingsStepList!.filter((drawing) => drawing.type === "point" && drawing.color === GREEN_COLOR)
        .map((drawing) => drawing.element) as Point[];

      convexHullEdges = getLinesFromPoints(pointsOnConvexHull);
    }

    partialHulls.push({
      points: pointSubset,
      edges: convexHullEdges,
      htmlLabel: htmlLabelWithColor(`P${i + 1}`, pointSubset[0].color),
    });
  });

  return partialHulls;
};

const chanJarvisMarchVisualizationSteps = (partialHulls: PartialConvexHull[], lang: Language) => {
  return partialHulls.map((partialHull) => ({
    explanation: getTranslation(lang, "convexHullDeterminedUsing", { label: partialHull.htmlLabel }),
    graphicDrawingsStepList: partialHull.edges.map((edge) =>
      DrawingFactory.lineFromPoints(edge.startPoint, edge.endPoint, edge.startPoint.color)
    ),
  }));
};

const pointThatFormsMaxAngle = (partialHullPoints: Point[], prevPk: SimplePoint, nextPk: SimplePoint) => {
  return partialHullPoints.reduce((acc, curr) => {
    const maxAngle = findAngle(prevPk, nextPk, acc);
    const nextAngle = findAngle(prevPk, nextPk, curr);
    return maxAngle > nextAngle ? acc : curr;
  });
};

const initialChanAlgorithmSteps = (
  partialHulls: PartialConvexHull[],
  points: Point[],
  m: number,
  lang: Language
) => {
  const result: VisualizationStep[] = [];

  result.push({
    explanation: getTranslation(lang, "setPartitionedRandomly", { m }),
    graphicDrawingsStepList: [DrawingFactory.clearCanvas, ...pointsResetToInitialColor(points)],
  });
  result.push(...chanPartialHullVisualizationSteps(partialHulls, lang));
  result.push(...chanJarvisMarchVisualizationSteps(partialHulls, lang));

  return result;
};

const visualizationStepMaxAnglePoint = (
  point: Point,
  startPoint: Point,
  endPoint: Point,
  subsetLabel: string,
  lang: Language
) => {
  return {
    explanation: getTranslation(lang, "fromSubsetMaxAngle", {
      subset: subsetLabel,
      point: point.label,
      p1: startPoint.label,
      p2: endPoint.label,
    }),
    graphicDrawingsStepList: [DrawingFactory.point(point, RED_COLOR, "focused")],
  };
};

const htmlLabelWithColor = (label: string, color: string) => {
  return `<span style="color: ${color}">${label}</span>`;
};

const visualizationStepsMaxAngleSubsets = (
  point: Point,
  startPoint: Point,
  endPoint: Point,
  q: Point[],
  lang: Language
): VisualizationStep[] => {
  const maxAnglePointLabelsStr = q.map((p) => p.label).join(", ");

  return [
    {
      explanation: getTranslation(lang, "amongPointsMaxAngle", {
        points: maxAnglePointLabelsStr,
        point: point.label,
        p1: startPoint.label,
        p2: endPoint.label,
      }),
      graphicDrawingsStepList: [DrawingFactory.point(point, GREEN_COLOR, "focused")],
    },
    {
      explanation: getTranslation(lang, "pointAddedToPointsList", { label: point.label }),
      graphicDrawingsStepList: [
        ...pointsResetToInitialColor(q),
        DrawingFactory.point(endPoint, GREEN_COLOR),
        DrawingFactory.point(point, GREEN_COLOR),
        DrawingFactory.lineFromPoints(endPoint, point, GREEN_COLOR),
      ],
    },
  ];
};

const chanAlgorithmInitialPointsStep = (p1: Point, lang: Language) => ({
  explanation: getTranslation(lang, "addedP0AndRightmost", { label: p1.label }),
  graphicDrawingsStepList: [DrawingFactory.point(p1, GREEN_COLOR, "focused")],
});

const chanSubstepFinalVisualizationComplete = (
  points: Point[],
  convexHullPoints: Point[],
  p1: Point,
  lang: Language
): VisualizationStep[] => {
  return [
    {
      explanation: getTranslation(lang, "newPointEqualsInitial", { label: p1.label }),
    },
    {
      graphicDrawingsStepList: [
        DrawingFactory.clearCanvas,
        ...pointsResetToInitialColor(points),
        ...convexHullDrawingFromPoints(convexHullPoints),
      ],
    },
  ];
};

const chanSubstepFinalVisualizationIncomplete = (m: number, lang: Language) => {
  return [
    {
      explanation: getTranslation(lang, "iterationNotAllFound", { m }),
    },
  ];
};

const chanAlgorithmSubstep = (
  points: Point[],
  partialHulls: PartialConvexHull[],
  m: number,
  lang: Language
) => {
  const visualizationSteps: VisualizationStep[] = [];
  const p0 = {
    x: 0,
    y: -10000,
    label: "P0",
    color: GREY_COLOR,
  };
  const p1 = points[getIndexOfExtremePoint(points, "right")];
  const p: Point[] = [p0, p1];

  visualizationSteps.push(chanAlgorithmInitialPointsStep(p1, lang));

  for (let k = 1; k <= m; k++) {
    const q: Point[] = [];

    for (let i = 0; i < partialHulls.length; i++) {
      const qi = pointThatFormsMaxAngle(partialHulls[i].points, p[k - 1], p[k]);
      q.push(qi);

      visualizationSteps.push(visualizationStepMaxAnglePoint(qi, p[k - 1], p[k], partialHulls[i].htmlLabel, lang));
    }

    const pkNext = pointThatFormsMaxAngle(q, p[k - 1], p[k]);
    p.push(pkNext);

    visualizationSteps.push(...visualizationStepsMaxAngleSubsets(pkNext, p[k - 1], p[k], q, lang));

    if (pkNext.label === p1.label) {
      visualizationSteps.push(...chanSubstepFinalVisualizationComplete(points, p.slice(1), p1, lang));
      return [p, visualizationSteps];
    }
  }

  visualizationSteps.push(...chanSubstepFinalVisualizationIncomplete(m, lang));
  return [null, visualizationSteps];
};

export const computeChanExecutionSteps = (points: Point[], lang: Language) => {
  const visualizationSteps: VisualizationStep[] = [];

  let t = 1;
  let running = true;

  while (running) {
    const m = Math.min(2 ** (t + 1), points.length);

    const partialHullsPoints = chanPartialHullsPoints(points, m);
    const partialHulls = chanPartialHulls(partialHullsPoints, lang);

    const [convexHullPoints, substepsVisualizationSteps] = chanAlgorithmSubstep(points, partialHulls, m, lang);
    if (convexHullPoints) {
      running = false;
    }

    visualizationSteps.push(...initialChanAlgorithmSteps(partialHulls, points, m, lang));
    visualizationSteps.push(...(substepsVisualizationSteps as VisualizationStep[]));

    t++;
  }

  return visualizationSteps;
};
