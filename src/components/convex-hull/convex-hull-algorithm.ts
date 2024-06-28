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

export const computeGrahamScanSteps = (sortedPoints: Point[]) => {
  const lowerConvexHullSteps = determineConvexHullPart(sortedPoints, "lower");
  const upperConvexHullSteps = determineConvexHullPart(sortedPoints, "upper");

  // only the last steps from the lower convex hull are needed because the ones for the upper convex hull will already be there
  const lastStep: VisualizationStep = {
    explanation: "Acoperirea convexa este completa.",
    graphicDrawingsStepList: getConvexHullPartFinalDrawings(lowerConvexHullSteps),
  };

  return [...lowerConvexHullSteps, ...upperConvexHullSteps, lastStep];
};

export const determineConvexHullPart = (points: Point[], part: ConvexHullPart) => {
  if (part === "upper") {
    points = [...points].reverse();
  }

  const algorithmGraphicIndications: VisualizationStep[] = [];
  const convexHullPart = [points[0], points[1]];

  let stepExplanation =
    "Punctele au fost sortate lexicografic. Frontiera inferioara este initializata cu punctele " +
    convexHullPart[0].label +
    " si " +
    convexHullPart[1].label +
    ". ";
  if (part === "upper") {
    stepExplanation =
      "Analog, se determina frontiera superioara, care se initializeaza cu punctele " +
      convexHullPart[0].label +
      " si " +
      convexHullPart[1].label +
      ". ";
  }

  algorithmGraphicIndications.push({
    explanation: stepExplanation,
    graphicDrawingsStepList: convexHullUpdatedSteps(points, convexHullPart),
  });

  for (let i = 2; i < points.length; i++) {
    algorithmGraphicIndications.push({
      explanation: "Punctul " + points[i].label + " este adaugat in lista.",
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
          explanation:
            "Punctele " +
            secondLastPoint.label +
            ", " +
            lastPoint.label +
            " si " +
            points[i].label +
            " formeaza un viraj la stanga, deci niciun element nu este sters. ",
          graphicDrawingsStepList: convexHullUpdatedSteps(points, temporaryConvexHullPart),
        };
        algorithmGraphicIndications.push(visualizationStep);
        break;
      } else {
        stepExplanation = "Punctele " + secondLastPoint.label + ", " + lastPoint.label + " si " + points[i].label;
        if (orientation == 0) {
          stepExplanation += " sunt coliniare";
        } else {
          stepExplanation += " formeaza un viraj la dreapta";
        }
        stepExplanation += ", deci punctul " + lastPoint.label + " este sters din lista.";

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

    let messageConvexHullList = `Frontiera ${part === "lower" ? "inferioara" : "superioara"} contine punctele `;
    for (let i = 0; i < convexHullPart.length; i++) {
      messageConvexHullList += convexHullPart[i].label;
      if (i !== convexHullPart.length - 1) {
        messageConvexHullList += ", ";
      } else {
        messageConvexHullList += ". ";
      }
    }

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

export const computeJarvisMarchExecutionSteps = (pointsOnCanvas: Point[]) => {
  const convexHullPoints = [];
  const algorithmGraphicIndications: VisualizationStep[] = [];

  const leftMostPointIndex = getIndexOfExtremePoint(pointsOnCanvas, "left");
  let currentPointIndex = leftMostPointIndex;
  let currentPoint = pointsOnCanvas[currentPointIndex];
  convexHullPoints.push(currentPoint);

  algorithmGraphicIndications.push({
    explanation:
      "Acoperirea convexa se initializeaza cu cel mai mic punct in ordine lexicografica, punctul " +
      currentPoint.label +
      ". ",
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
      explanation: "Se alege arbitrar punctul " + pivotPoint.label + " drept pivot",
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
        explanation: "Punctul " + testedPoint.label + " este ales pentru a fi comparat",
        graphicDrawingsStepList: [DrawingFactory.point(testedPoint, RED_COLOR, "focused")],
      };
      algorithmGraphicIndications.push(visualizationStep);

      const orientation = calculateOrientationForNormalPoints(currentPoint, pivotPoint, testedPoint);
      if (orientation == PointsOrientation.Right) {
        algorithmGraphicIndications.push({
          explanation:
            "Punctul " +
            testedPoint.label +
            " se afla la dreapta muchiei " +
            currentPoint.label +
            pivotPoint.label +
            ", deci devine noul pivot. ",
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
          explanation:
            "Punctul " +
            testedPoint.label +
            " nu se afla la dreapta muchiei " +
            currentPoint.label +
            pivotPoint.label +
            ", deci nu devine noul pivot. ",
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
        explanation: "Punctul " + pivotPoint.label + " se adauga in acoperirea convexa. ",
        graphicDrawingsStepList: convexHullUpdatedSteps(pointsOnCanvas, convexHullPoints),
      });
    }
  }

  let messageConvexHullList = "Acoperirea convexa este formata din punctele: ";
  for (let i = 0; i < convexHullPoints.length; i++) {
    messageConvexHullList += convexHullPoints[i].label;
    if (i != convexHullPoints.length - 1) {
      messageConvexHullList += ", ";
    } else {
      messageConvexHullList += ". ";
    }
  }
  convexHullPoints.push(convexHullPoints[0]);

  algorithmGraphicIndications.push({
    explanation: messageConvexHullList,
    graphicDrawingsStepList: convexHullDrawingFromPoints(convexHullPoints),
  });

  return algorithmGraphicIndications;
};

const chanPartialHullVisualizationSteps = (partialHulls: PartialConvexHull[]): VisualizationStep[] => {
  return partialHulls.map(({ points, htmlLabel }) => {
    return {
      explanation: `Se formeaza submultimea ${htmlLabel} cu ${points.length} element${points.length === 1 ? "" : "e"}.`,
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

const chanPartialHulls = (partialHullsPoints: Point[][]) => {
  const partialHulls: PartialConvexHull[] = [];

  partialHullsPoints.forEach((pointSubset, i) => {
    let convexHullEdges: ILine[] = [];

    if (pointSubset.length > 1) {
      // this is a hack to get the convex hull for each subset of points, a refactor would be nice
      const jarvisMarchExecutionSteps = computeJarvisMarchExecutionSteps(pointSubset);
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

const chanJarvisMarchVisualizationSteps = (partialHulls: PartialConvexHull[]) => {
  return partialHulls.map((partialHull) => ({
    explanation: `Este determinata infasuratoarea convexa a submultimii ${partialHull.htmlLabel} folosind Jarvis March.`,
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

const initialChanAlgorithmSteps = (partialHulls: PartialConvexHull[], points: Point[], m: number) => {
  const result: VisualizationStep[] = [];

  result.push({
    explanation: `Multimea de puncte este partitionata aleator in submultimi cu cel mult ${m} elemente (m = ${m}).`,
    graphicDrawingsStepList: [DrawingFactory.clearCanvas, ...pointsResetToInitialColor(points)],
  });
  result.push(...chanPartialHullVisualizationSteps(partialHulls));
  result.push(...chanJarvisMarchVisualizationSteps(partialHulls));

  return result;
};

const visualizationStepMaxAnglePoint = (point: Point, startPoint: Point, endPoint: Point, subsetLabel: string) => {
  return {
    explanation: `Din submultimea ${subsetLabel}, punctul ${point.label} formeaza unghiul maxim cu punctele ${startPoint.label} si ${endPoint.label}`,
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
  q: Point[]
): VisualizationStep[] => {
  const maxAnglePointLabelsStr = q.map((p) => p.label).join(", ");

  return [
    {
      explanation: `Dintre punctele ${maxAnglePointLabelsStr}, punctul ${point.label} formeaza unghiul maxim cu punctele ${startPoint.label} si ${endPoint.label}.`,
      graphicDrawingsStepList: [DrawingFactory.point(point, GREEN_COLOR, "focused")],
    },
    {
      explanation: `Punctul ${point.label} este adaugat in lista de puncte.`,
      graphicDrawingsStepList: [
        ...pointsResetToInitialColor(q),
        DrawingFactory.point(endPoint, GREEN_COLOR),
        DrawingFactory.point(point, GREEN_COLOR),
        DrawingFactory.lineFromPoints(endPoint, point, GREEN_COLOR),
      ],
    },
  ];
};

const chanAlgorithmInitialPointsStep = (p1: Point) => ({
  explanation: `Sunt adaugate in lista punctele P0(0, -inf) si ${p1.label} (cel mai din dreapta punct).`,
  graphicDrawingsStepList: [DrawingFactory.point(p1, GREEN_COLOR, "focused")],
});

const chanSubstepFinalVisualizationComplete = (
  points: Point[],
  convexHullPoints: Point[],
  p1: Point
): VisualizationStep[] => {
  return [
    {
      explanation: `Cum noul punct gasit este egal cu punctul initial (${p1.label}), acoperirea convexa este completa.`,
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

const chanSubstepFinalVisualizationIncomplete = (m: number) => {
  return [
    {
      explanation: `La aceasta iteratie (m = ${m}), nu au fost descoperite toate punctele de pe infasuratoare.`,
    },
  ];
};

const chanAlgorithmSubstep = (points: Point[], partialHulls: PartialConvexHull[], m: number) => {
  const visualizationSteps: VisualizationStep[] = [];
  const p0 = {
    x: 0,
    y: -10000,
    label: "P0",
    color: GREY_COLOR,
  };
  const p1 = points[getIndexOfExtremePoint(points, "right")];
  const p: Point[] = [p0, p1];

  visualizationSteps.push(chanAlgorithmInitialPointsStep(p1));

  for (let k = 1; k <= m; k++) {
    const q: Point[] = [];

    for (let i = 0; i < partialHulls.length; i++) {
      const qi = pointThatFormsMaxAngle(partialHulls[i].points, p[k - 1], p[k]);
      q.push(qi);

      visualizationSteps.push(visualizationStepMaxAnglePoint(qi, p[k - 1], p[k], partialHulls[i].htmlLabel));
    }

    const pkNext = pointThatFormsMaxAngle(q, p[k - 1], p[k]);
    p.push(pkNext);

    visualizationSteps.push(...visualizationStepsMaxAngleSubsets(pkNext, p[k - 1], p[k], q));

    if (pkNext.label === p1.label) {
      visualizationSteps.push(...chanSubstepFinalVisualizationComplete(points, p.slice(1), p1));
      return [p, visualizationSteps];
    }
  }

  visualizationSteps.push(...chanSubstepFinalVisualizationIncomplete(m));
  return [null, visualizationSteps];
};

export const computeChanExecutionSteps = (points: Point[]) => {
  const visualizationSteps: VisualizationStep[] = [];

  let t = 1;
  let running = true;

  while (running) {
    const m = Math.min(2 ** (t + 1), points.length);

    const partialHullsPoints = chanPartialHullsPoints(points, m);
    const partialHulls = chanPartialHulls(partialHullsPoints);

    const [convexHullPoints, substepsVisualizationSteps] = chanAlgorithmSubstep(points, partialHulls, m);
    if (convexHullPoints) {
      running = false;
    }

    visualizationSteps.push(...initialChanAlgorithmSteps(partialHulls, points, m));
    visualizationSteps.push(...(substepsVisualizationSteps as VisualizationStep[]));

    t++;
  }

  return visualizationSteps;
};
