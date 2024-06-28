import { uniqueId } from "lodash";
import { Drawing, DrawingFactory, VisualizationStep } from "../../shared/models/algorithm";
import {
  ICircle,
  ILine,
  IParabolaForAlg,
  IParabolaForAlgWithoutId,
  Point,
  SimplePoint,
  closestPoint,
  distance,
  getIntersectionBetweenRays,
  getIntersectionBetweenRaysHorizontal,
  getIntersectionPointsBetweenHorizontalParabolas,
  getIntersectionPointsBetweenParabolas,
  getParabolaFromEndPoints,
  getParabolaFromXCoordinates,
  getParabolaFromYCoordinates,
  isPointInsideTheCanvas,
} from "../../shared/models/geometry";
import {
  GREY_COLOR,
  ORANGE_COLOR,
  comparatorPointsByXAscending,
  comparatorPointsByYDescending,
  getPointsWithIncreasedDistanceBetweenCloseOnes,
  sortList,
} from "../../shared/util";
import { CanvasDimensions } from "../canvas/helpers";

export enum Orientation {
  Vertical = "Verticala",
  Horizontal = "Orizontala",
}

// startPoint will always be the "midpoint" (the common point with the other half edge )
type IVoronoiHalfEdge = ILine & {
  upperArcId: string;
  lowerArcId: string;
};

type CircleEvent = ICircle & {
  upperHalfEdge: IVoronoiHalfEdge;
  lowerHalfEdge: IVoronoiHalfEdge;
};

const getNewParabolaWithOldId = (
  oldParabola: IParabolaForAlg,
  newParabola: IParabolaForAlgWithoutId
): IParabolaForAlg => {
  return {
    ...newParabola,
    id: oldParabola.id,
    color: oldParabola.color,
  };
};

const getHalfEdge = (midPoint: SimplePoint, endPoint: SimplePoint) => {
  return {
    startPoint: {
      ...midPoint,
      color: GREY_COLOR,
      label: "",
    },
    endPoint: {
      ...endPoint,
      color: GREY_COLOR,
      label: "",
    },
    color: GREY_COLOR,
  };
};

const getVoronoiHalfEdgesSiteEvent = (
  p1: IParabolaForAlg,
  p2: IParabolaForAlg,
  p3: IParabolaForAlg
): IVoronoiHalfEdge[] => {
  const midPoint = {
    x: (p2.startPoint.x + p2.endPoint.x) / 2,
    y: (p2.startPoint.y + p2.endPoint.y) / 2,
  };

  return [
    {
      upperArcId: p1.id,
      lowerArcId: p2.id,
      ...getHalfEdge(midPoint, p2.startPoint),
    },
    {
      upperArcId: p2.id,
      lowerArcId: p3.id,
      ...getHalfEdge(midPoint, p2.endPoint),
    },
  ];
};

// note that the voronoi edges might not be "equal" in the sense that one of them
// could have suffered updates to the start / end point (e.g. when the sweep line moves slightly)
const areVoronoiEdgesTheSame = (edge1: IVoronoiHalfEdge, edge2: IVoronoiHalfEdge) => {
  return edge1.lowerArcId === edge2.lowerArcId && edge1.upperArcId === edge2.upperArcId;
};

const removeFalseCircleEvents = (circleEvents: CircleEvent[], voronoiHalfEdges: IVoronoiHalfEdge[]) => {
  return circleEvents.filter((circleEvent) => {
    return (
      voronoiHalfEdges.find((edge) => areVoronoiEdgesTheSame(edge, circleEvent.upperHalfEdge)) &&
      voronoiHalfEdges.find((edge) => areVoronoiEdgesTheSame(edge, circleEvent.lowerHalfEdge))
    );
  });
};

const handleIntersectionsOfNewParabola = (
  beachLine: IParabolaForAlg[],
  i: number,
  newParabola: IParabolaForAlg,
  voronoiHalfEdges: IVoronoiHalfEdge[],
  sweepLineX: number
) => {
  const intersectionPoints = getIntersectionPointsBetweenParabolas(beachLine[i], newParabola);

  const upperParabola = getParabolaFromEndPoints(
    beachLine[i].startPoint,
    intersectionPoints[0],
    beachLine[i].focus,
    sweepLineX
  );

  const lowerParabola = getParabolaFromEndPoints(
    intersectionPoints[1],
    beachLine[i].endPoint,
    beachLine[i].focus,
    sweepLineX
  );

  // replace the ids of the existing half edges that are formed by the arc that is going to be split
  const newUpperArcId = uniqueId();
  const newLowerArcId = uniqueId();
  for (let j = 0; j < voronoiHalfEdges.length; j++) {
    if (voronoiHalfEdges[j].upperArcId == beachLine[i].id) {
      voronoiHalfEdges[j] = {
        ...voronoiHalfEdges[j],
        upperArcId: newLowerArcId,
      };
    } else if (voronoiHalfEdges[j].lowerArcId == beachLine[i].id) {
      voronoiHalfEdges[j] = {
        ...voronoiHalfEdges[j],
        lowerArcId: newUpperArcId,
      };
    }
  }

  beachLine[i] = {
    id: newUpperArcId,
    ...upperParabola,
  };
  beachLine.splice(i + 1, 0, {
    id: uniqueId(),
    ...getParabolaFromEndPoints(intersectionPoints[0], intersectionPoints[1], newParabola.focus, sweepLineX),
  });
  beachLine.splice(i + 2, 0, {
    id: newLowerArcId,
    ...lowerParabola,
  });
};

const handleIntersectionsOfNewParabolaHorizontal = (
  beachLine: IParabolaForAlg[],
  i: number,
  newParabola: IParabolaForAlg,
  voronoiHalfEdges: IVoronoiHalfEdge[],
  sweepLineY: number
) => {
  const intersectionPoints = getIntersectionPointsBetweenHorizontalParabolas(beachLine[i], newParabola);

  const upperParabola = getParabolaFromEndPoints(
    beachLine[i].startPoint,
    intersectionPoints[0],
    beachLine[i].focus,
    sweepLineY,
    Orientation.Horizontal
  );

  const lowerParabola = getParabolaFromEndPoints(
    intersectionPoints[1],
    beachLine[i].endPoint,
    beachLine[i].focus,
    sweepLineY,
    Orientation.Horizontal
  );

  // replace the ids of the existing half edges that are formed by the arc that is going to be split
  const newUpperArcId = uniqueId();
  const newLowerArcId = uniqueId();
  for (let j = 0; j < voronoiHalfEdges.length; j++) {
    if (voronoiHalfEdges[j].upperArcId == beachLine[i].id) {
      voronoiHalfEdges[j] = {
        ...voronoiHalfEdges[j],
        upperArcId: newLowerArcId,
      };
    } else if (voronoiHalfEdges[j].lowerArcId == beachLine[i].id) {
      voronoiHalfEdges[j] = {
        ...voronoiHalfEdges[j],
        lowerArcId: newUpperArcId,
      };
    }
  }

  beachLine[i] = {
    id: newUpperArcId,
    ...upperParabola,
  };
  beachLine.splice(i + 1, 0, {
    id: uniqueId(),
    ...getParabolaFromEndPoints(
      intersectionPoints[0],
      intersectionPoints[1],
      newParabola.focus,
      sweepLineY,
      Orientation.Horizontal
    ),
  });
  beachLine.splice(i + 2, 0, {
    id: newLowerArcId,
    ...lowerParabola,
  });
};

const addCircleEvents = (
  circleEvents: CircleEvent[],
  beachLine: IParabolaForAlg[],
  voronoiHalfEdges: IVoronoiHalfEdge[],
  stepExplanations: string[],
  orientation = Orientation.Vertical
) => {
  for (let i = 1; i < beachLine.length - 1; i++) {
    const upperHalfEdge = voronoiHalfEdges.find((edge) => edge.lowerArcId == beachLine[i].id);
    const lowerHalfEdge = voronoiHalfEdges.find((edge) => edge.upperArcId == beachLine[i].id);

    if (!upperHalfEdge || !lowerHalfEdge) {
      continue;
    }

    // no better way to check if the circle event has already been added
    if (
      circleEvents.find(
        (ev) =>
          ev.upperHalfEdge.upperArcId === upperHalfEdge.upperArcId &&
          ev.upperHalfEdge.lowerArcId === upperHalfEdge.lowerArcId &&
          ev.lowerHalfEdge.upperArcId === lowerHalfEdge.upperArcId &&
          ev.lowerHalfEdge.lowerArcId === lowerHalfEdge.lowerArcId
      )
    ) {
      continue;
    }

    const pointOfIntersection =
      orientation === Orientation.Vertical
        ? getIntersectionBetweenRays(upperHalfEdge, lowerHalfEdge)
        : getIntersectionBetweenRaysHorizontal(upperHalfEdge, lowerHalfEdge);
    if (pointOfIntersection) {
      const radius = distance(beachLine[i].focus, pointOfIntersection);
      const circleEvent = { upperHalfEdge, lowerHalfEdge, center: pointOfIntersection, radius };
      const middleArcIdx = arcToBeRemovedIdx(beachLine, circleEvent);
      beachLine[middleArcIdx].color = ORANGE_COLOR;

      circleEvents.push(circleEvent);
      stepExplanations.push(circleEventDetectedExplanation([...beachLine], i));
    }
  }
};

const handleCircleEvents = (
  circleEvents: CircleEvent[],
  beachLine: IParabolaForAlg[],
  voronoiHalfEdges: IVoronoiHalfEdge[],
  completeEdges: ILine[],
  sweepLineCoord: number,
  stepExplanations: string[],
  orientation = Orientation.Vertical
) => {
  for (let i = 0; i < circleEvents.length; i++) {
    const circleEventDone =
      orientation === Orientation.Vertical
        ? circleEvents[i].center.x + circleEvents[i].radius <= sweepLineCoord
        : circleEvents[i].center.y - circleEvents[i].radius >= sweepLineCoord;
    if (circleEventDone) {
      const arcToRemoveIdx = arcToBeRemovedIdx(beachLine, circleEvents[i]);

      // remove the two complete edges, making sure their endpoints are in the center of the triangle
      // this handles the problem that after a step of the sweep line, the parabolas may grow a bit past that point
      const edgeWithUpperArcIdIdx = voronoiHalfEdges.findIndex(
        (edge) => edge.upperArcId === beachLine[arcToRemoveIdx].id
      )!;
      completeEdges.push({
        ...voronoiHalfEdges[edgeWithUpperArcIdIdx],
        endPoint: {
          ...voronoiHalfEdges[edgeWithUpperArcIdIdx].endPoint,
          ...circleEvents[i].center,
        },
      });
      voronoiHalfEdges.splice(edgeWithUpperArcIdIdx, 1);

      const edgeWithLowerArcIdIdx = voronoiHalfEdges.findIndex(
        (edge) => edge.lowerArcId === beachLine[arcToRemoveIdx].id
      )!;
      completeEdges.push({
        ...voronoiHalfEdges[edgeWithLowerArcIdIdx],
        endPoint: {
          ...voronoiHalfEdges[edgeWithLowerArcIdIdx].endPoint,
          ...circleEvents[i].center,
        },
      });
      voronoiHalfEdges.splice(edgeWithLowerArcIdIdx, 1);

      voronoiHalfEdges.push({
        startPoint: {
          ...circleEvents[i].center,
          label: "",
          color: "",
        },
        endPoint: {
          ...circleEvents[i].center,
          label: "",
          color: "",
        },
        color: GREY_COLOR,
        upperArcId: circleEvents[i].upperHalfEdge.upperArcId,
        lowerArcId: circleEvents[i].lowerHalfEdge.lowerArcId,
      });
      stepExplanations.push(circleEventCompletedExplanation(beachLine[arcToRemoveIdx]));
      beachLine.splice(arcToRemoveIdx, 1);
    }
  }
};

// since the beachline is ordered by the y-coordinate, we can just recompute each parabola and determine the new intersections
const updateBeachLineWithNewDirectrix = (
  beachLine: IParabolaForAlg[],
  sweepLineX: number,
  lowerBoundYCanvas: number
) => {
  const oldIntersectionPoint = beachLine[0].endPoint;
  const newUpperParabola = getParabolaFromYCoordinates(beachLine[0].focus, sweepLineX, 0, lowerBoundYCanvas);
  const newLowerParabola = getParabolaFromYCoordinates(beachLine[1].focus, sweepLineX, 0, lowerBoundYCanvas);
  const newIntersectionPoint = closestPoint(
    oldIntersectionPoint,
    getIntersectionPointsBetweenParabolas(newUpperParabola, newLowerParabola)
  );
  beachLine[0] = getNewParabolaWithOldId(
    beachLine[0],
    getParabolaFromEndPoints(newUpperParabola.startPoint, newIntersectionPoint, beachLine[0].focus, sweepLineX)
  );

  for (let i = 1; i < beachLine.length - 1; i++) {
    const oldIntersectionPoint = beachLine[i].endPoint;
    const newUpperParabola = getParabolaFromYCoordinates(beachLine[i].focus, sweepLineX, 0, lowerBoundYCanvas);
    const newLowerParabola = getParabolaFromYCoordinates(beachLine[i + 1].focus, sweepLineX, 0, lowerBoundYCanvas);
    const newIntersectionPoint = closestPoint(
      oldIntersectionPoint,
      getIntersectionPointsBetweenParabolas(newUpperParabola, newLowerParabola)
    );
    beachLine[i] = getNewParabolaWithOldId(
      beachLine[i],
      getParabolaFromEndPoints(beachLine[i - 1].endPoint, newIntersectionPoint, beachLine[i].focus, sweepLineX)
    );
  }

  const lastIdx = beachLine.length - 1;
  const oldIntersectionPointEnd = beachLine[lastIdx].startPoint;
  const newUpperParabolaEnd = getParabolaFromYCoordinates(
    beachLine[lastIdx - 1].focus,
    sweepLineX,
    0,
    lowerBoundYCanvas
  );
  const newLowerParabolaEnd = getParabolaFromYCoordinates(beachLine[lastIdx].focus, sweepLineX, 0, lowerBoundYCanvas);
  const newIntersectionPointEnd = closestPoint(
    oldIntersectionPointEnd,
    getIntersectionPointsBetweenParabolas(newUpperParabolaEnd, newLowerParabolaEnd)
  );
  beachLine[lastIdx] = getNewParabolaWithOldId(
    beachLine[lastIdx],
    getParabolaFromEndPoints(
      newIntersectionPointEnd,
      newLowerParabolaEnd.endPoint,
      beachLine[lastIdx].focus,
      sweepLineX
    )
  );
};

// since the beachline is ordered by the y-coordinate, we can just recompute each parabola and determine the new intersections
const updateHorizontalBeachLineWithNewDirectrix = (
  beachLine: IParabolaForAlg[],
  sweepLineY: number,
  upperBoundXCanvas: number
) => {
  const oldIntersectionPoint = beachLine[0].endPoint;
  const newUpperParabola = getParabolaFromXCoordinates(beachLine[0].focus, sweepLineY, 0, upperBoundXCanvas);
  const newLowerParabola = getParabolaFromXCoordinates(beachLine[1].focus, sweepLineY, 0, upperBoundXCanvas);
  const newIntersectionPoint = closestPoint(
    oldIntersectionPoint,
    getIntersectionPointsBetweenHorizontalParabolas(newUpperParabola, newLowerParabola)
  );
  beachLine[0] = getNewParabolaWithOldId(
    beachLine[0],
    getParabolaFromEndPoints(
      newUpperParabola.startPoint,
      newIntersectionPoint,
      beachLine[0].focus,
      sweepLineY,
      Orientation.Horizontal
    )
  );

  for (let i = 1; i < beachLine.length - 1; i++) {
    const oldIntersectionPoint = beachLine[i].endPoint;
    const newUpperParabola = getParabolaFromXCoordinates(beachLine[i].focus, sweepLineY, 0, upperBoundXCanvas);
    const newLowerParabola = getParabolaFromXCoordinates(beachLine[i + 1].focus, sweepLineY, 0, upperBoundXCanvas);
    const newIntersectionPoint = closestPoint(
      oldIntersectionPoint,
      getIntersectionPointsBetweenHorizontalParabolas(newUpperParabola, newLowerParabola)
    );
    beachLine[i] = getNewParabolaWithOldId(
      beachLine[i],
      getParabolaFromEndPoints(
        beachLine[i - 1].endPoint,
        newIntersectionPoint,
        beachLine[i].focus,
        sweepLineY,
        Orientation.Horizontal
      )
    );
  }

  const lastIdx = beachLine.length - 1;
  const oldIntersectionPointEnd = beachLine[lastIdx].startPoint;
  const newUpperParabolaEnd = getParabolaFromXCoordinates(
    beachLine[lastIdx - 1].focus,
    sweepLineY,
    0,
    upperBoundXCanvas
  );
  const newLowerParabolaEnd = getParabolaFromXCoordinates(beachLine[lastIdx].focus, sweepLineY, 0, upperBoundXCanvas);
  const newIntersectionPointEnd = closestPoint(
    oldIntersectionPointEnd,
    getIntersectionPointsBetweenHorizontalParabolas(newUpperParabolaEnd, newLowerParabolaEnd)
  );
  beachLine[lastIdx] = getNewParabolaWithOldId(
    beachLine[lastIdx],
    getParabolaFromEndPoints(
      newIntersectionPointEnd,
      newLowerParabolaEnd.endPoint,
      beachLine[lastIdx].focus,
      sweepLineY,
      Orientation.Horizontal
    )
  );
};

const updateVoronoiHalfEdges = (beachLine: IParabolaForAlg[], voronoiHalfEdges: IVoronoiHalfEdge[]) => {
  for (let i = 1; i < beachLine.length; i++) {
    for (let j = 0; j < voronoiHalfEdges.length; j++) {
      if (
        voronoiHalfEdges[j].upperArcId === beachLine[i - 1].id &&
        voronoiHalfEdges[j].lowerArcId === beachLine[i].id
      ) {
        voronoiHalfEdges[j] = {
          ...voronoiHalfEdges[j],
          endPoint: { ...beachLine[i - 1].endPoint, label: "", color: GREY_COLOR },
        };
        break;
      }
    }
  }
};

// in case there is a circle event close before or after the sweepLine, move the sweepLine exactly there for better precision
const getSweepLineNextPosition = (sweepLineX: number, sweepLineUpdateStep: number, circleEvents: CircleEvent[]) => {
  const sortedCircleEvents = [...circleEvents].sort((ev1, ev2) => ev1.center.x - ev2.center.x);
  for (let i = 0; i < sortedCircleEvents.length; i++) {
    const rightBoundX = sortedCircleEvents[i].center.x + sortedCircleEvents[i].radius;
    if (
      (rightBoundX >= sweepLineX + sweepLineUpdateStep / 2 && rightBoundX < sweepLineX + sweepLineUpdateStep) ||
      (rightBoundX >= sweepLineX + sweepLineUpdateStep && rightBoundX < sweepLineX + (sweepLineUpdateStep * 3) / 2)
    ) {
      return rightBoundX;
    }
  }

  return sweepLineX + sweepLineUpdateStep;
};

const isBeachLineOutOfSight = (beachLine: IParabolaForAlg[], canvasDimensions: CanvasDimensions) => {
  if (beachLine.length === 0) {
    return false;
  }

  for (const arc of beachLine) {
    if (
      isPointInsideTheCanvas(arc.startPoint, canvasDimensions) ||
      isPointInsideTheCanvas(arc.endPoint, canvasDimensions)
    ) {
      return false;
    }
  }
  return true;
};

const arcToBeRemovedIdx = (beachLine: IParabolaForAlg[], circleEvent: CircleEvent) => {
  return beachLine.findIndex(
    (arc) => arc.id === circleEvent.upperHalfEdge.lowerArcId && arc.id === circleEvent.lowerHalfEdge.upperArcId
  ); // the two id's we are checking against arc.id should be equal by definition, but doesn't hurt to do an extra check
};

const siteEventExplanation = (parabola: IParabolaForAlg) =>
  `Eveniment de tip locatie: se adauga parabola punctului ${parabola.focus.label}.`;

const circleEventDetectedExplanation = (beachLine: IParabolaForAlg[], i: number) =>
  `Eveniment de tip cerc detectat: se adauga cercul asociat muchiilor formate de parabolele punctelor ${
    beachLine[i - 1].focus.label
  } si ${beachLine[i].focus.label}, respectiv ${beachLine[i].focus.label} si ${beachLine[i + 1].focus.label}.`;

const circleEventCompletedExplanation = (parabolaToBeRemoved: IParabolaForAlg) =>
  `Eveniment de tip cerc complet: dispare parabola asociata punctului ${parabolaToBeRemoved.focus.label} si apare un varf al diagramei.`;

const newFortuneAlgorithmStep = (
  beachLine: IParabolaForAlg[],
  completeEdges: ILine[],
  voronoiHalfEdges: IVoronoiHalfEdge[],
  circleEvents: CircleEvent[],
  stepExplanations: string[],
  canvasDimensions: CanvasDimensions,
  sweepLineValue: number, // x-coord for vertical orientation and y for horizontal
  orientation = Orientation.Vertical
) => {
  const parabolaDrawings: Drawing[] = [];
  beachLine.forEach((arc) => {
    // some will be arcs actually, but can be represented as a (partial) parabola
    parabolaDrawings.push(DrawingFactory.parabola(arc));
  });

  const voronoiLineDrawings: Drawing[] = [];
  [...completeEdges, ...voronoiHalfEdges].forEach((line) => {
    voronoiLineDrawings.push(DrawingFactory.line(line));
  });

  const circleDrawings: Drawing[] = [];
  circleEvents.forEach((circleEvent) => {
    const circle = {
      center: circleEvent.center,
      radius: circleEvent.radius,
    };
    circleDrawings.push(DrawingFactory.circle(circle, GREY_COLOR));
  });

  let startPointLine: Point;
  let endPointLine: Point;
  if (orientation === Orientation.Vertical) {
    startPointLine = { x: sweepLineValue, y: -canvasDimensions.height - 1, label: "", color: GREY_COLOR };
    endPointLine = { x: sweepLineValue, y: 1, label: "", color: GREY_COLOR };
  } else {
    startPointLine = { x: -1, y: sweepLineValue, label: "", color: GREY_COLOR };
    endPointLine = { x: canvasDimensions.width + 1, y: sweepLineValue, label: "", color: GREY_COLOR };
  }

  return {
    graphicDrawingsStepList: [
      DrawingFactory.clearCanvas,
      DrawingFactory.lineFromPoints(startPointLine, endPointLine, GREY_COLOR),
      ...parabolaDrawings,
      ...voronoiLineDrawings,
      ...circleDrawings,
    ],
    explanations: stepExplanations,
  };
};

const cleanUpAlgorithmEnd = (visualizationSteps: VisualizationStep[]) => {
  if (visualizationSteps.length >= 1) {
    const lastStep = visualizationSteps[visualizationSteps.length - 1];
    visualizationSteps.push({
      ...lastStep,
      graphicDrawingsStepList: [
        ...(lastStep.graphicDrawingsStepList?.filter((step) => step.type !== "circle" && step.type !== "parabola") ??
          []),
      ],
      explanation: "Algoritm finalizat",
    });
  }
};

export const computeFortuneAlgorithmSteps = (
  points: Point[],
  canvasDimensions: CanvasDimensions,
  orientation: Orientation
) => {
  if (orientation === Orientation.Vertical) {
    return computeFortuneAlgorithmStepsVerticalLineSweep(points, canvasDimensions);
  }
  return computeFortuneAlgorithmStepsHorizontalLineSweep(points, canvasDimensions);
};

export const computeFortuneAlgorithmStepsHorizontalLineSweep = (
  points: Point[],
  canvasDimensions: CanvasDimensions
) => {
  const visualizationSteps: VisualizationStep[] = [];
  const beachLine: IParabolaForAlg[] = [];
  const voronoiHalfEdges: IVoronoiHalfEdge[] = [];
  const completeEdges: ILine[] = [];
  let circleEvents: CircleEvent[] = [];
  const sortedPoints = sortList(getPointsWithIncreasedDistanceBetweenCloseOnes(points), comparatorPointsByYDescending);
  let lastPointPassedIdx = 0;
  let sweepLineY = 0;
  const sweepLineUpdateStep = 1;

  while (sweepLineY > -canvasDimensions.height || !isBeachLineOutOfSight(beachLine, canvasDimensions)) {
    const stepExplanations: string[] = [];

    // recompute beachline after each step
    if (beachLine.length == 1) {
      // it's important to compute parabolas to be as "big" as the canvas on the x-axis
      // in order to determine intersections correctly
      beachLine[0] = getParabolaFromXCoordinates(sortedPoints[0], sweepLineY, 0, canvasDimensions.width);
    } else if (beachLine.length > 1) {
      updateHorizontalBeachLineWithNewDirectrix(beachLine, sweepLineY, canvasDimensions.width);
      updateVoronoiHalfEdges(beachLine, voronoiHalfEdges);
    }

    // handle site events
    while (lastPointPassedIdx < sortedPoints.length && sortedPoints[lastPointPassedIdx].y > sweepLineY) {
      if (lastPointPassedIdx == 0) {
        const firstParabola = getParabolaFromXCoordinates(sortedPoints[0], sweepLineY, 0, canvasDimensions.width);
        beachLine.push(firstParabola);
        stepExplanations.push(siteEventExplanation(firstParabola));
      } else {
        const newParabola = getParabolaFromXCoordinates(
          sortedPoints[lastPointPassedIdx],
          sweepLineY,
          0,
          canvasDimensions.width
        );
        stepExplanations.push(siteEventExplanation(newParabola));
        // given that the beachline is sorted, consider only the first parabola the new one intersects
        for (let i = 0; i < beachLine.length; i++) {
          if (beachLine[i].startPoint.x < newParabola.focus.x && beachLine[i].endPoint.x > newParabola.focus.x) {
            handleIntersectionsOfNewParabolaHorizontal(beachLine, i, newParabola, voronoiHalfEdges, sweepLineY);
            voronoiHalfEdges.push(...getVoronoiHalfEdgesSiteEvent(beachLine[i], beachLine[i + 1], beachLine[i + 2]));
            circleEvents = removeFalseCircleEvents(circleEvents, voronoiHalfEdges);
            break;
          }
        }
      }

      lastPointPassedIdx += 1;
    }

    addCircleEvents(circleEvents, beachLine, voronoiHalfEdges, stepExplanations, Orientation.Horizontal);
    handleCircleEvents(
      circleEvents,
      beachLine,
      voronoiHalfEdges,
      completeEdges,
      sweepLineY,
      stepExplanations,
      Orientation.Horizontal
    );
    circleEvents = removeFalseCircleEvents(circleEvents, voronoiHalfEdges);

    visualizationSteps.push(
      newFortuneAlgorithmStep(
        beachLine,
        completeEdges,
        voronoiHalfEdges,
        circleEvents,
        stepExplanations,
        canvasDimensions,
        sweepLineY,
        Orientation.Horizontal
      )
    );
    // sweepLineX = getSweepLineNextPosition(sweepLineX, sweepLineUpdateStep, circleEvents);
    sweepLineY -= sweepLineUpdateStep;
  }

  // delete parabolas and circles that might still be visible when the algorithm ends
  cleanUpAlgorithmEnd(visualizationSteps);

  return visualizationSteps;
};

export const computeFortuneAlgorithmStepsVerticalLineSweep = (points: Point[], canvasDimensions: CanvasDimensions) => {
  const visualizationSteps: VisualizationStep[] = [];
  const beachLine: IParabolaForAlg[] = [];
  const voronoiHalfEdges: IVoronoiHalfEdge[] = [];
  const completeEdges: ILine[] = [];
  let circleEvents: CircleEvent[] = [];
  const sortedPoints = sortList(getPointsWithIncreasedDistanceBetweenCloseOnes(points), comparatorPointsByXAscending);
  let lastPointPassedIdx = 0;
  let sweepLineX = 0;
  const sweepLineUpdateStep = 1;

  while (sweepLineX < canvasDimensions.width || !isBeachLineOutOfSight(beachLine, canvasDimensions)) {
    const stepExplanations = [];

    // recompute beachline after each step
    if (beachLine.length == 1) {
      // it's important to compute parabolas to be as "big" as the canvas on the y-axis
      // in order to determine intersections correctly
      beachLine[0] = getParabolaFromYCoordinates(sortedPoints[0], sweepLineX, 0, -canvasDimensions.height);
    } else if (beachLine.length > 1) {
      updateBeachLineWithNewDirectrix(beachLine, sweepLineX, -canvasDimensions.height);
      updateVoronoiHalfEdges(beachLine, voronoiHalfEdges);
    }

    // handle site events
    while (lastPointPassedIdx < sortedPoints.length && sortedPoints[lastPointPassedIdx].x < sweepLineX) {
      if (lastPointPassedIdx == 0) {
        const firstParabola = getParabolaFromYCoordinates(sortedPoints[0], sweepLineX, 0, -canvasDimensions.height);
        beachLine.push(firstParabola);
        stepExplanations.push(siteEventExplanation(firstParabola));
      } else {
        const newParabola = getParabolaFromYCoordinates(
          sortedPoints[lastPointPassedIdx],
          sweepLineX,
          0,
          -canvasDimensions.height
        );
        stepExplanations.push(siteEventExplanation(newParabola));

        // given that the beachline is sorted, consider only the first parabola the new one intersects
        for (let i = 0; i < beachLine.length; i++) {
          if (beachLine[i].startPoint.y > newParabola.focus.y && beachLine[i].endPoint.y < newParabola.focus.y) {
            handleIntersectionsOfNewParabola(beachLine, i, newParabola, voronoiHalfEdges, sweepLineX);
            voronoiHalfEdges.push(...getVoronoiHalfEdgesSiteEvent(beachLine[i], beachLine[i + 1], beachLine[i + 2]));
            circleEvents = removeFalseCircleEvents(circleEvents, voronoiHalfEdges);
            break;
          }
        }
      }

      lastPointPassedIdx += 1;
    }

    addCircleEvents(circleEvents, beachLine, voronoiHalfEdges, stepExplanations);
    handleCircleEvents(circleEvents, beachLine, voronoiHalfEdges, completeEdges, sweepLineX, stepExplanations);
    circleEvents = removeFalseCircleEvents(circleEvents, voronoiHalfEdges);

    visualizationSteps.push(
      newFortuneAlgorithmStep(
        beachLine,
        completeEdges,
        voronoiHalfEdges,
        circleEvents,
        stepExplanations,
        canvasDimensions,
        sweepLineX
      )
    );
    sweepLineX = getSweepLineNextPosition(sweepLineX, sweepLineUpdateStep, circleEvents);
  }

  // delete parabolas and circles that might still be visible when the algorithm ends
  cleanUpAlgorithmEnd(visualizationSteps);

  return visualizationSteps;
};
