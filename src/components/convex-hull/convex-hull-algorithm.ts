import { VisualizationStep } from "../../shared/models/algorithm";
import { Point, convertPointBetweenAlgorithmAndCanvas } from "../../shared/models/geometry";
import { GREEN_COLOR, ORANGE_COLOR, RED_COLOR } from "../../shared/util";

type ConvexHullPart = "lower" | "upper";

const getFinalConvexHullPart = (partVisualizationSteps: VisualizationStep[]) => {
  const lastLowerConvexHullStep = partVisualizationSteps[partVisualizationSteps.length - 1];
  return lastLowerConvexHullStep.graphicDrawingsStepList[0].element.map((point: Point) =>
    convertPointBetweenAlgorithmAndCanvas(point)
  );
};

const calculateOrientationForNormalPoints = (firstPoint: Point, middlePoint: Point, endPoint: Point) => {
  // 2 = left,  1 = right, 0 = collinear
  const val =
    (middlePoint.x - firstPoint.x) * (endPoint.y - firstPoint.y) -
    (endPoint.x - firstPoint.x) * (middlePoint.y - firstPoint.y);
  if (val == 0) return 0;
  return val > 0 ? 2 : 1;
};

export const computeGrahamScanSteps = (sortedPoints: Point[]) => {
  const lowerConvexHullSteps = determineConvexHullPart(sortedPoints, "lower");
  const upperConvexHullSteps = determineConvexHullPart(sortedPoints, "upper");

  const lowerConvexHull = getFinalConvexHullPart(lowerConvexHullSteps);
  const upperConvexHull = getFinalConvexHullPart(upperConvexHullSteps);
  const lastStep = {
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
  let algorithmNumberOfPointsInConvexHull = 0;
  const convexHullPart = [points[0], points[1]];
  algorithmNumberOfPointsInConvexHull += 2;

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
      {
        type: "updateConvexHullList",
        element: convexHullPart.slice(),
      },
      {
        type: "updateNumber",
        element: algorithmNumberOfPointsInConvexHull,
      },
    ],
  } as VisualizationStep;
  algorithmGraphicIndications.push(visualizationStep);

  for (let i = 2; i < points.length; i++) {
    algorithmNumberOfPointsInConvexHull++;
    let visualizationStep = {
      explanation: "Punctul " + points[i].label + " este adaugat in lista.",
      graphicDrawingsStepList: [
        {
          type: "point",
          element: points[i],
          color: ORANGE_COLOR,
        },
        {
          type: "updateNumber",
          element: algorithmNumberOfPointsInConvexHull,
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
        algorithmNumberOfPointsInConvexHull--;
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
            {
              type: "updateNumber",
              element: algorithmNumberOfPointsInConvexHull,
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

const getIndexOfFarLeftPoint = (pointsOnCanvas: Point[]) => {
  let mostLeftPoint = pointsOnCanvas[0];
  let mostLeftPointIndex = 0;
  for (let i = 0; i < pointsOnCanvas.length; i++) {
    if (pointsOnCanvas[i].x < mostLeftPoint.x) {
      mostLeftPoint = pointsOnCanvas[i];
      mostLeftPointIndex = i;
    }
  }
  return mostLeftPointIndex;
};

export const computeJarvisMarchExecutionSteps = (pointsOnCanvas: Point[]) => {
  let algorithmNumberOfPointsInConvexHull = 0;
  const convexHullPoints = [];
  const algorithmGraphicIndications: VisualizationStep[] = [];

  const leftMostPointIndex = getIndexOfFarLeftPoint(pointsOnCanvas);
  let currentPointIndex = leftMostPointIndex;
  let currentPoint = pointsOnCanvas[currentPointIndex];
  algorithmNumberOfPointsInConvexHull++;
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
      {
        type: "updateNumber",
        element: algorithmNumberOfPointsInConvexHull,
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
      algorithmNumberOfPointsInConvexHull++;
      currentPoint = pivotPoint;
      currentPointIndex = pivotIndex;
      visualizationStep = {
        explanation: "Punctul " + pivotPoint.label + " se adauga in acoperirea convexa. ",
        graphicDrawingsStepList: [
          {
            type: "updateConvexHullList",
            element: convexHullPoints.slice(),
          },
          {
            type: "updateNumber",
            element: algorithmNumberOfPointsInConvexHull,
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
