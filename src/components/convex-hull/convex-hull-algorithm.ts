import randomColor from "randomcolor";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import {
  calculateOrientationForNormalPoints,
  convertPointBetweenAlgorithmAndCanvas,
  DEFAULT_POINT_SIZE,
  findAngle,
  FOCUSED_POINT_SIZE,
  ILine,
  Point,
  SimplePoint,
} from "../../shared/models/geometry";
import { getLinesFromPoints, GREEN_COLOR, GREY_COLOR, ORANGE_COLOR, RED_COLOR, shuffleArray } from "../../shared/util";

type ConvexHullPart = "lower" | "upper";

interface PartialConvexHull {
  points: Point[];
  edges: ILine[];
  htmlLabel: string;
}

const getFinalConvexHullPart = (partVisualizationSteps: VisualizationStep[]) => {
  const lastLowerConvexHullStep = partVisualizationSteps[partVisualizationSteps.length - 1];
  return lastLowerConvexHullStep.graphicDrawingsStepList![0].element.map((point: Point) =>
    convertPointBetweenAlgorithmAndCanvas(point)
  );
};

export const computeGrahamScanSteps = (sortedPoints: Point[]) => {
  const lowerConvexHullSteps = determineConvexHullPart(sortedPoints, "lower");
  const upperConvexHullSteps = determineConvexHullPart(sortedPoints, "upper");

  const lowerConvexHull = getFinalConvexHullPart(lowerConvexHullSteps);
  const upperConvexHull = getFinalConvexHullPart(upperConvexHullSteps);
  const lastStep: VisualizationStep = {
    explanation: "Acoperirea convexa este completa.",
    graphicDrawingsStepList: [
      {
        type: "finalStep",
        element: [...lowerConvexHull, ...upperConvexHull],
      },
    ],
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

  const visualizationStep = {
    explanation: stepExplanation,
    graphicDrawingsStepList: [
      ...pointsResetToInitialColor(points),
      {
        type: "updateConvexHullList",
        element: convexHullPart.slice(),
      },
    ],
  } as VisualizationStep;
  algorithmGraphicIndications.push(visualizationStep);

  for (let i = 2; i < points.length; i++) {
    let visualizationStep = {
      explanation: "Punctul " + points[i].label + " este adaugat in lista.",
      graphicDrawingsStepList: [
        {
          type: "point",
          element: points[i],
          color: ORANGE_COLOR,
        },
      ],
    } as VisualizationStep;
    algorithmGraphicIndications.push(visualizationStep);

    while (convexHullPart.length >= 2) {
      const secondLastPoint = convexHullPart[convexHullPart.length - 2];
      const lastPoint = convexHullPart[convexHullPart.length - 1];
      const orientation = calculateOrientationForNormalPoints(secondLastPoint, lastPoint, points[i]);
      if (orientation == 2) {
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
          graphicDrawingsStepList: [
            {
              type: "updateConvexHullList",
              element: temporaryConvexHullPart,
            },
          ],
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
        const visualizationStep = {
          explanation: stepExplanation,
          graphicDrawingsStepList: [
            {
              type: "updateConvexHullList",
              element: temporaryConvexHullPart,
            },
            {
              type: "line",
              element: [secondLastPoint, lastPoint],
              style: "dash",
              color: RED_COLOR,
            },
            {
              type: "line",
              element: [lastPoint, points[i]],
              style: "dash",
              color: RED_COLOR,
            },
            {
              type: "point",
              element: lastPoint,
              color: RED_COLOR,
            },
          ],
        };
        algorithmGraphicIndications.push(visualizationStep);
      }
    }
    convexHullPart.push(points[i]);

    let messageConvexHullList = `Frontiera ${part === "lower" ? "inferioara" : "superioara"} contine punctele `;
    for (let i = 0; i < convexHullPart.length; i++) {
      messageConvexHullList += convexHullPart[i].label;
      if (i != convexHullPart.length - 1) {
        messageConvexHullList += ", ";
      } else {
        messageConvexHullList += ". ";
      }
    }
    visualizationStep = {
      explanation: messageConvexHullList,
      graphicDrawingsStepList: [
        {
          type: "updateConvexHullList",
          element: convexHullPart.slice(),
        },
      ],
    } as VisualizationStep;
    algorithmGraphicIndications.push(visualizationStep);
  }

  return algorithmGraphicIndications;
};

const getIndexOfExtremePoint = (pointsOnCanvas: Point[], position: "left" | "right") => {
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
  let visualizationStep: VisualizationStep = {
    explanation:
      "Acoperirea convexa se initializeaza cu cel mai mic punct in ordine lexicografica, punctul " +
      currentPoint.label +
      ". ",
    graphicDrawingsStepList: [
      {
        type: "point",
        element: currentPoint,
        color: GREEN_COLOR,
        size: 6,
      },
    ],
  };
  algorithmGraphicIndications.push(visualizationStep);

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
        {
          type: "line",
          element: [currentPoint, pivotPoint],
          color: ORANGE_COLOR,
        },
        {
          type: "point",
          element: currentPoint,
          color: GREEN_COLOR,
        },
        {
          type: "point",
          element: pivotPoint,
          color: ORANGE_COLOR,
          size: 6,
        },
      ],
    };
    algorithmGraphicIndications.push(visualizationStep);

    for (let i = 0; i < pointsOnCanvas.length; i++) {
      const testedPoint = pointsOnCanvas[i];
      visualizationStep = {
        explanation: "Punctul " + testedPoint.label + " este ales pentru a fi comparat",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: testedPoint,
            color: RED_COLOR,
            size: 6,
          },
        ],
      };
      algorithmGraphicIndications.push(visualizationStep);

      const orientation = calculateOrientationForNormalPoints(currentPoint, pivotPoint, testedPoint);
      if (orientation == 1) {
        visualizationStep = {
          explanation:
            "Punctul " +
            testedPoint.label +
            " se afla la dreapta muchiei " +
            currentPoint.label +
            pivotPoint.label +
            ", deci devine noul pivot. ",
          graphicDrawingsStepList: [
            {
              type: "updateConvexHullList",
              element: convexHullPoints.slice(),
            },
            {
              type: "line",
              element: [currentPoint, testedPoint],
              color: ORANGE_COLOR,
            },
            {
              type: "point",
              element: currentPoint,
              color: GREEN_COLOR,
            },
            {
              type: "point",
              element: testedPoint,
              color: ORANGE_COLOR,
              size: 6,
            },
          ],
        };
        algorithmGraphicIndications.push(visualizationStep);
        pivotPoint = testedPoint;
        pivotIndex = i;
      } else {
        visualizationStep = {
          explanation:
            "Punctul " +
            testedPoint.label +
            " nu se afla la dreapta muchiei " +
            currentPoint.label +
            pivotPoint.label +
            ", deci nu devine noul pivot. ",
          graphicDrawingsStepList: [
            {
              type: "updateConvexHullList",
              element: convexHullPoints.slice(),
            },
            {
              type: "line",
              element: [currentPoint, pivotPoint],
              color: ORANGE_COLOR,
            },
            {
              type: "point",
              element: currentPoint,
              color: GREEN_COLOR,
            },
            {
              type: "point",
              element: pivotPoint,
              color: ORANGE_COLOR,
              size: 6,
            },
          ],
        };
        algorithmGraphicIndications.push(visualizationStep);
      }
    }

    if (convexHullPoints[0].x == pivotPoint.x && convexHullPoints[0].y == pivotPoint.y) {
      valid = false;
    } else {
      convexHullPoints.push(pivotPoint);
      currentPoint = pivotPoint;
      currentPointIndex = pivotIndex;
      visualizationStep = {
        explanation: "Punctul " + pivotPoint.label + " se adauga in acoperirea convexa. ",
        graphicDrawingsStepList: [
          {
            type: "updateConvexHullList",
            element: convexHullPoints.slice(),
          },
        ],
      };
      algorithmGraphicIndications.push(visualizationStep);
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
  visualizationStep = {
    explanation: messageConvexHullList,
    graphicDrawingsStepList: [
      {
        type: "updateConvexHullList",
        element: convexHullPoints.slice(),
      },
    ],
  };
  algorithmGraphicIndications.push(visualizationStep);

  return algorithmGraphicIndications;
};

const chanPartialHullVisualizationSteps = (partialHulls: PartialConvexHull[]): VisualizationStep[] => {
  return partialHulls.map(({ points, htmlLabel }) => {
    return {
      explanation: `Se formeaza submultimea ${htmlLabel} cu ${points.length} element${points.length === 1 ? "" : "e"}.`,
      graphicDrawingsStepList: points.map((point) => ({
        type: "point",
        element: point,
        color: point.color,
        size: DEFAULT_POINT_SIZE,
      })),
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
        .graphicDrawingsStepList![0].element as Point[];
      convexHullEdges = getLinesFromPoints(pointsOnConvexHull, pointsOnConvexHull[0].color);
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
    graphicDrawingsStepList: partialHull.edges.map((edge) => ({
      type: "line",
      element: [edge.startPoint, edge.endPoint],
      color: edge.startPoint.color,
    })),
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
    graphicDrawingsStepList: [{ type: "updateState" }, ...pointsResetToInitialColor(points)],
  });
  result.push(...chanPartialHullVisualizationSteps(partialHulls));
  result.push(...chanJarvisMarchVisualizationSteps(partialHulls));

  return result;
};

const visualizationStepMaxAnglePoint = (point: Point, startPoint: Point, endPoint: Point, subsetLabel: string) => {
  return {
    explanation: `Din submultimea ${subsetLabel}, punctul ${point.label} formeaza unghiul maxim cu punctele ${startPoint.label} si ${endPoint.label}`,
    graphicDrawingsStepList: [
      {
        type: "point",
        element: point,
        color: RED_COLOR,
        size: FOCUSED_POINT_SIZE,
      },
    ],
  };
};

const pointsResetToInitialColor = (points: Point[]): Drawing[] => {
  return points.map((p) => ({
    type: "point",
    element: p,
    color: p.color,
  }));
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
      graphicDrawingsStepList: [
        {
          type: "point",
          element: point,
          color: GREEN_COLOR,
          size: FOCUSED_POINT_SIZE,
        },
      ],
    },
    {
      explanation: `Punctul ${point.label} este adaugat in lista de puncte.`,
      graphicDrawingsStepList: [
        ...pointsResetToInitialColor(q),
        {
          type: "point",
          element: endPoint,
          color: GREEN_COLOR,
        },
        {
          type: "point",
          element: point,
          color: GREEN_COLOR,
        },
        {
          type: "line",
          element: [endPoint, point],
          color: GREEN_COLOR,
        },
      ],
    },
  ];
};

const chanAlgorithmInitialPointsStep = (p1: Point) => ({
  explanation: `Sunt adaugate in lista punctele P0(0, -inf) si ${p1.label} (cel mai din dreapta punct).`,
  graphicDrawingsStepList: [
    {
      type: "point",
      element: p1,
      color: GREEN_COLOR,
      size: FOCUSED_POINT_SIZE,
    },
  ],
});

const convexHullDrawingFromPoints = (points: Point[]): Drawing[] => {
  return [
    ...points.map((p) => ({
      type: "point",
      element: p,
      color: GREEN_COLOR,
    })),
    ...getLinesFromPoints(points).map((line) => ({
      type: "line",
      element: [line.startPoint, line.endPoint],
      color: GREEN_COLOR,
    })),
  ];
};

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
        { type: "updateState" },
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
