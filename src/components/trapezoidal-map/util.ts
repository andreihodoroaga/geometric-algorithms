import { Drawing, DrawingFactory, VisualizationStep } from "../../shared/models/algorithm";
import {
  LeftRight,
  Point,
  TrapezoidForCanvas,
  calculateOrientationForNormalPoints,
  convertPointBetweenAlgorithmAndCanvas,
} from "../../shared/models/geometry";
import { BLACK_COLOR, GREY_COLOR, RED_COLOR, getEcuationCoefficients } from "../../shared/util";
import { CanvasDimensions } from "../canvas/helpers";
import {
  GraphNodeFactory,
  GraphTrapezoidNode,
  isGraphSegmentNode,
  isGraphTrapezoidNode,
  isGraphVertexNode,
  Trapezoid,
  TrapezoidalMapGraphNode,
  TrapezoidPoint,
  TrapezoidSegment,
} from "./models";

export const getSegmentsFromPoints = (points: Point[]) => {
  const segments: TrapezoidSegment[] = [];
  for (let i = 1; i < points.length; i += 2) {
    const p1 = new TrapezoidPoint(points[i - 1].x, points[i - 1].y, points[i - 1].label);
    const p2 = new TrapezoidPoint(points[i].x, points[i].y, points[i].label);
    if (p1.x < p2.x) {
      segments.push(new TrapezoidSegment(p1, p2));
    } else {
      segments.push(new TrapezoidSegment(p1, p2));
    }
  }
  return segments;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTreeDataJson = (graphNode: TrapezoidalMapGraphNode): any => {
  let indicator;
  const children: Array<{ name: string | undefined; children: unknown[] | undefined }> = [];

  if (isGraphTrapezoidNode(graphNode)) {
    indicator = "T" + graphNode.value.count;
  } else {
    if (isGraphVertexNode(graphNode)) {
      indicator = graphNode.value.letter;
    }
    if (isGraphSegmentNode(graphNode)) {
      indicator = graphNode.value.leftSegmentPoint.letter + graphNode.value.rightSegmentPoint.letter;
    }
    children.push(getTreeDataJson(graphNode.leftNode!));
    children.push(getTreeDataJson(graphNode.rightNode!));
  }

  return {
    name: indicator,
    children: children,
  };
};

export const permuteSegments = (initialSegments: TrapezoidSegment[]) => {
  const numberOfSegments = initialSegments.length;
  for (let i = 0; i < numberOfSegments; i++) {
    const randomIndex = Math.floor(Math.random() * numberOfSegments);
    const aux = initialSegments[i];
    initialSegments[i] = initialSegments[randomIndex];
    initialSegments[randomIndex] = aux;
  }
};

export const checkPointExistsOnCanvas = (endpointsOfExistingSegments: TrapezoidPoint[], newPoint: TrapezoidPoint) => {
  for (let p = 0; p < endpointsOfExistingSegments.length; p++) {
    const pointOnCanvas = endpointsOfExistingSegments[p];
    if (pointOnCanvas.x == newPoint.x && pointOnCanvas.y == newPoint.y) {
      return true;
    }
  }
  return false;
};

export const getLinesIntersection = (firstSegment: TrapezoidSegment, secondSegment: TrapezoidSegment) => {
  const firstSegmentEcuationCoef = getEcuationCoefficients(
    firstSegment.leftSegmentPoint,
    firstSegment.rightSegmentPoint
  );
  const secondSegmentEcuationCoef = getEcuationCoefficients(
    secondSegment.leftSegmentPoint,
    secondSegment.rightSegmentPoint
  );

  const A1 = firstSegmentEcuationCoef.coefX;
  const B1 = firstSegmentEcuationCoef.coefY;
  const C1 = firstSegmentEcuationCoef.coef;
  const A2 = secondSegmentEcuationCoef.coefX;
  const B2 = secondSegmentEcuationCoef.coefY;
  const C2 = secondSegmentEcuationCoef.coef;

  const det = A1 * B2 - B1 * A2;
  if (det == 0) {
    if (A1 * C2 - A2 * C1 == 0 && B1 * C2 - B2 * C1 == 0) {
      return { status: "coincid", point: null };
    }
    return { status: "paralele", point: null };
  }
  const intersectionX = (-C1 * B2 + B1 * C2) / det;
  const intersectionY = (-A1 * C2 + A2 * C1) / det;
  const intersectionPoint = new TrapezoidPoint(intersectionX, intersectionY, "");
  return { status: "intersecteaza", point: intersectionPoint };
};

const searchPointInGraph = (
  correspondingLeaf: TrapezoidalMapGraphNode,
  point: TrapezoidPoint,
  childNodesPositions: LeftRight[]
): TrapezoidalMapGraphNode | undefined => {
  if (!correspondingLeaf) {
    return;
  }

  if (isGraphTrapezoidNode(correspondingLeaf)) {
    return correspondingLeaf;
  }

  if (isGraphVertexNode(correspondingLeaf)) {
    if (point.x < correspondingLeaf.value.x) {
      childNodesPositions.push("left");
      return searchPointInGraph(correspondingLeaf.leftNode!, point, childNodesPositions);
    }
    if (point.x > correspondingLeaf.value.x) {
      childNodesPositions.push("right");
      return searchPointInGraph(correspondingLeaf.rightNode!, point, childNodesPositions);
    }
    return correspondingLeaf;
  }

  if (isGraphSegmentNode(correspondingLeaf)) {
    const orientation = calculateOrientationForNormalPoints(
      correspondingLeaf.value.leftSegmentPoint,
      correspondingLeaf.value.rightSegmentPoint,
      point
    );
    if (orientation == 1) {
      childNodesPositions.push("right");
      return searchPointInGraph(correspondingLeaf.rightNode!, point, childNodesPositions);
    }
    if (orientation == 2) {
      childNodesPositions.push("left");
      return searchPointInGraph(correspondingLeaf.leftNode!, point, childNodesPositions);
    }
    return correspondingLeaf;
  }
};

export const getIntersectedTrapezoids = (
  endpointsOfExistingSegments: TrapezoidPoint[],
  segment: TrapezoidSegment,
  childNodesPositions: LeftRight[],
  rootNode: GraphTrapezoidNode,
  canvasDimensions: CanvasDimensions
) => {
  let trapezoidOfLeftPointNode: GraphTrapezoidNode | undefined = undefined;

  const leftSegmentPoint = segment.leftSegmentPoint;
  if (checkPointExistsOnCanvas(endpointsOfExistingSegments, leftSegmentPoint)) {
    // in caz ca se face colt in stanga cu un segment deja existente,
    // din structura de cautare va rezulta un vertex, nu un trapezoid
    const proximityLineToTheRight = new TrapezoidSegment(
      new TrapezoidPoint(leftSegmentPoint.x + 0.2, -canvasDimensions.height - 1, ""),
      new TrapezoidPoint(leftSegmentPoint.x + 0.2, 1, "")
    );
    const intersectionPoint = getLinesIntersection(proximityLineToTheRight, segment).point;

    trapezoidOfLeftPointNode = searchPointInGraph(
      rootNode,
      intersectionPoint!,
      childNodesPositions
    ) as GraphTrapezoidNode;
  } else {
    trapezoidOfLeftPointNode = searchPointInGraph(
      rootNode,
      leftSegmentPoint,
      childNodesPositions
    ) as GraphTrapezoidNode;
  }

  const intersectedTrapezoids = [trapezoidOfLeftPointNode.value];
  let currentTrapezoid = intersectedTrapezoids[intersectedTrapezoids.length - 1];
  while (segment.rightSegmentPoint.x > currentTrapezoid.rightVertex.x) {
    const trapezoidRightVertex = currentTrapezoid.rightVertex;
    const orientation = calculateOrientationForNormalPoints(
      segment.leftSegmentPoint,
      segment.rightSegmentPoint,
      trapezoidRightVertex
    );
    if (orientation == 2) {
      intersectedTrapezoids.push(currentTrapezoid.downRightTrapezoid!);
    }
    if (orientation == 1) {
      intersectedTrapezoids.push(currentTrapezoid.upRightTrapezoid!);
    }
    currentTrapezoid = intersectedTrapezoids[intersectedTrapezoids.length - 1];
  }
  return intersectedTrapezoids;
};

export const extendPoint = (
  point: TrapezoidPoint,
  top: TrapezoidSegment,
  bottom: TrapezoidSegment,
  algorithmGraphicIndications: VisualizationStep[],
  canvasHeight: number
) => {
  point.extensionTop = top;
  point.extensionBottom = bottom;
  algorithmGraphicIndications.push({
    explanation: "Se adauga extensia punctului " + point.letter,
    graphicDrawingsStepList: [DrawingFactory.line(getExtensionLine(point, canvasHeight, "black")!)],
  });
};

export const divideHorizontallySameTrapezoid = (
  trapezoid: Trapezoid,
  segment: TrapezoidSegment,
  algorithmSegments: TrapezoidSegment[],
  endpointsOfExistingSegments: TrapezoidPoint[],
  algorithmGraphicIndications: VisualizationStep[],
  canvasHeight: number
) => {
  const leftTrapezoid = new Trapezoid(
    trapezoid.topEdge,
    trapezoid.bottomEdge,
    trapezoid.leftVertex,
    segment.leftSegmentPoint
  );
  const upTrapezoid = new Trapezoid(trapezoid.topEdge, segment, segment.leftSegmentPoint, segment.rightSegmentPoint);
  const downTrapezoid = new Trapezoid(
    segment,
    trapezoid.bottomEdge,
    segment.leftSegmentPoint,
    segment.rightSegmentPoint
  );
  const rightTrapezoid = new Trapezoid(
    trapezoid.topEdge,
    trapezoid.bottomEdge,
    segment.rightSegmentPoint,
    trapezoid.rightVertex
  );

  setNeighbourTrapezoids(
    leftTrapezoid,
    trapezoid.downLeftTrapezoid,
    downTrapezoid,
    trapezoid.upLeftTrapezoid,
    upTrapezoid
  );
  setNeighbourTrapezoids(
    rightTrapezoid,
    downTrapezoid,
    trapezoid.downRightTrapezoid,
    upTrapezoid,
    trapezoid.upRightTrapezoid
  );

  const leftTrapezoidNode = GraphNodeFactory.createTrapezoid(leftTrapezoid);
  leftTrapezoid.correspondingLeaf = leftTrapezoidNode;
  const upTrapezoidNode = GraphNodeFactory.createTrapezoid(upTrapezoid);
  upTrapezoid.correspondingLeaf = upTrapezoidNode;
  const downTrapezoidNode = GraphNodeFactory.createTrapezoid(downTrapezoid);
  downTrapezoid.correspondingLeaf = downTrapezoidNode;
  const rightTrapezoidNode = GraphNodeFactory.createTrapezoid(rightTrapezoid);
  rightTrapezoid.correspondingLeaf = rightTrapezoidNode;

  const segmentNode = GraphNodeFactory.createSegment(segment);
  segmentNode.leftNode = upTrapezoidNode;
  segmentNode.rightNode = downTrapezoidNode;

  const rightEndpointNode = GraphNodeFactory.createVertex(segment.rightSegmentPoint);
  rightEndpointNode.leftNode = segmentNode;
  rightEndpointNode.rightNode = rightTrapezoidNode;

  const leaf = trapezoid.correspondingLeaf!;
  leaf.label = "vertex";
  leaf.value = segment.leftSegmentPoint;
  leaf.leftNode = leftTrapezoidNode;
  leaf.rightNode = rightEndpointNode;

  const step = {
    explanation:
      "Trapezul " +
      trapezoid.count +
      " este eliminat si este inlocuit cu trapezele nou aparute: " +
      leftTrapezoid.count +
      ", " +
      upTrapezoid.count +
      ", " +
      downTrapezoid.count +
      ", " +
      rightTrapezoid.count,
    graphicDrawingsStepList: [
      ...getCurrentStateOfMapSteps(endpointsOfExistingSegments, algorithmSegments, canvasHeight),
      getTrapezoidForCanvas(leftTrapezoid, canvasHeight),
      getTrapezoidForCanvas(upTrapezoid, canvasHeight),
      getTrapezoidForCanvas(downTrapezoid, canvasHeight),
      getTrapezoidForCanvas(rightTrapezoid, canvasHeight),
    ],
  };
  algorithmGraphicIndications.push(step);
};

export const divideVerticallyFirstTrapezoid = (trapezoid: Trapezoid, segment: TrapezoidSegment) => {
  const leftTrapezoid = new Trapezoid(
    trapezoid.topEdge,
    trapezoid.bottomEdge,
    trapezoid.leftVertex,
    segment.leftSegmentPoint
  );
  const temporaryRightTrapezoid = new Trapezoid(
    trapezoid.topEdge,
    trapezoid.bottomEdge,
    segment.leftSegmentPoint,
    trapezoid.rightVertex
  );

  setNeighbourTrapezoids(leftTrapezoid, trapezoid.downLeftTrapezoid, null, trapezoid.upLeftTrapezoid, null);
  setNeighbourTrapezoids(
    temporaryRightTrapezoid,
    leftTrapezoid,
    trapezoid.downRightTrapezoid,
    leftTrapezoid,
    trapezoid.upRightTrapezoid
  );

  const leftTrapezoidNode = GraphNodeFactory.createTrapezoid(leftTrapezoid);
  leftTrapezoid.correspondingLeaf = leftTrapezoidNode;
  const temporaryRightTrapezoidNode = GraphNodeFactory.createTrapezoid(temporaryRightTrapezoid);
  temporaryRightTrapezoid.correspondingLeaf = temporaryRightTrapezoidNode;

  const leaf = trapezoid.correspondingLeaf!;
  leaf.label = "vertex";
  leaf.value = segment.leftSegmentPoint;
  leaf.leftNode = leftTrapezoidNode;
  leaf.rightNode = temporaryRightTrapezoidNode;

  return { leftTrapezoid: leftTrapezoid, rightTrapezoid: temporaryRightTrapezoid };
};

export const divideVerticallyLastTrapezoid = (trapezoid: Trapezoid, segment: TrapezoidSegment) => {
  const rightTrapezoid = new Trapezoid(
    trapezoid.topEdge,
    trapezoid.bottomEdge,
    segment.rightSegmentPoint,
    trapezoid.rightVertex
  );
  const temporaryLeftTrapezoid = new Trapezoid(
    trapezoid.topEdge,
    trapezoid.bottomEdge,
    trapezoid.leftVertex,
    segment.rightSegmentPoint
  );

  setNeighbourTrapezoids(rightTrapezoid, null, trapezoid.downRightTrapezoid, null, trapezoid.upRightTrapezoid);
  setNeighbourTrapezoids(
    temporaryLeftTrapezoid,
    trapezoid.downLeftTrapezoid,
    rightTrapezoid,
    trapezoid.upLeftTrapezoid,
    rightTrapezoid
  );

  const rightTrapezoidNode = GraphNodeFactory.createTrapezoid(rightTrapezoid);
  rightTrapezoid.correspondingLeaf = rightTrapezoidNode;
  const temporaryLeftTrapezoidNode = GraphNodeFactory.createTrapezoid(temporaryLeftTrapezoid);
  temporaryLeftTrapezoid.correspondingLeaf = temporaryLeftTrapezoidNode;

  const leaf = trapezoid.correspondingLeaf!;
  leaf.label = "vertex";
  leaf.value = segment.rightSegmentPoint;
  leaf.leftNode = temporaryLeftTrapezoidNode;
  leaf.rightNode = rightTrapezoidNode;

  return { leftTrapezoid: temporaryLeftTrapezoid, rightTrapezoid: rightTrapezoid };
};

export const setNeighbourTrapezoids = (
  trapezoidToBeUpdated: Trapezoid,
  downLeftTrapezoid: Trapezoid | null,
  downRightTrapezoid: Trapezoid | null,
  upLeftTrapezoid: Trapezoid | null,
  upRightTrapezoid: Trapezoid | null
) => {
  if (downLeftTrapezoid) {
    trapezoidToBeUpdated.downLeftTrapezoid = downLeftTrapezoid;
    downLeftTrapezoid.downRightTrapezoid = trapezoidToBeUpdated;
  }
  if (downRightTrapezoid) {
    trapezoidToBeUpdated.downRightTrapezoid = downRightTrapezoid;
    downRightTrapezoid.downLeftTrapezoid = trapezoidToBeUpdated;
  }
  if (upLeftTrapezoid) {
    trapezoidToBeUpdated.upLeftTrapezoid = upLeftTrapezoid;
    upLeftTrapezoid.upRightTrapezoid = trapezoidToBeUpdated;
  }
  if (upRightTrapezoid) {
    trapezoidToBeUpdated.upRightTrapezoid = upRightTrapezoid;
    upRightTrapezoid.upLeftTrapezoid = trapezoidToBeUpdated;
  }
};

export const updatePointExtension = (
  point: TrapezoidPoint,
  top: TrapezoidSegment | null,
  bottom: TrapezoidSegment | null,
  algorithmGraphicIndications: VisualizationStep[],
  canvasHeight: number
) => {
  point.extensionTop = top;
  point.extensionBottom = bottom;
  algorithmGraphicIndications.push({
    explanation: "Se actualizeaza extensia punctului " + point.letter,
    graphicDrawingsStepList: [DrawingFactory.line(getExtensionLine(point, canvasHeight, RED_COLOR)!)],
  });
};

export const getAllTrapezoidsFromGraph = (graphNode: TrapezoidalMapGraphNode | undefined): Set<Trapezoid> => {
  if (!graphNode) {
    return new Set();
  }
  if (graphNode.label == "trapezoid") {
    return new Set([graphNode.value]);
  } else {
    return new Set([
      ...getAllTrapezoidsFromGraph(graphNode.leftNode),
      ...getAllTrapezoidsFromGraph(graphNode.rightNode),
    ]);
  }
};

export const convertToNormalPoint = (trapezoidPoint: TrapezoidPoint): Point => {
  return {
    x: trapezoidPoint.x,
    y: trapezoidPoint.y,
    label: trapezoidPoint.letter,
    color: GREY_COLOR,
  };
};

export const convertToNormalLine = (trapezoidSegment: TrapezoidSegment) => {
  return {
    startPoint: convertToNormalPoint(trapezoidSegment.leftSegmentPoint),
    endPoint: convertToNormalPoint(trapezoidSegment.rightSegmentPoint),
    color: BLACK_COLOR,
  };
};

export const getExtensionLine = (point: TrapezoidPoint, canvasHeight: number, color?: string) => {
  const verticalLineFromPoint = new TrapezoidSegment(
    new TrapezoidPoint(point.x, 1, ""),
    new TrapezoidPoint(point.x, -canvasHeight - 1, "")
  );
  if (point.extensionTop !== null && point.extensionBottom !== null) {
    const upperPointStop = getLinesIntersection(verticalLineFromPoint, point.extensionTop).point;
    const bottomPointStop = getLinesIntersection(verticalLineFromPoint, point.extensionBottom).point;

    return {
      startPoint: convertToNormalPoint(upperPointStop!),
      endPoint: convertToNormalPoint(bottomPointStop!),
      color: color ?? BLACK_COLOR,
    };
  }
};

export const getCurrentStateOfMapSteps = (
  points: TrapezoidPoint[],
  segments: TrapezoidSegment[],
  canvasHeight: number,
  trapezoids?: Set<Trapezoid>
): Drawing[] => {
  const extensionLines = points.map((p) => getExtensionLine(p, canvasHeight)!);
  const TrapezoidForCanvass = trapezoids
    ? Array.from(trapezoids).map((tr) => getTrapezoidForCanvas(tr, canvasHeight))
    : [];

  return [
    DrawingFactory.clearCanvas,
    DrawingFactory.lines([...segments.map(convertToNormalLine), ...extensionLines]),
    ...TrapezoidForCanvass,
  ];
};

export const getTrapezoidForCanvas = (
  trapezoid: Trapezoid,
  canvasHeight: number,
  color?: string
): { type: "trapezoid"; element: TrapezoidForCanvas } => {
  const trapezoidCorners = getTrapezoidCorners(trapezoid, canvasHeight);
  const downLeftCorner = convertPointBetweenAlgorithmAndCanvas(convertToNormalPoint(trapezoidCorners.downLeftCorner));
  const downRightCorner = convertPointBetweenAlgorithmAndCanvas(convertToNormalPoint(trapezoidCorners.downRightCorner));
  const upLeftCorner = convertPointBetweenAlgorithmAndCanvas(convertToNormalPoint(trapezoidCorners.upLeftCorner));
  const upRightCorner = convertPointBetweenAlgorithmAndCanvas(convertToNormalPoint(trapezoidCorners.upRightCorner));

  return {
    type: "trapezoid",
    element: {
      downLeftCorner,
      downRightCorner,
      upLeftCorner,
      upRightCorner,
      backgroundColor: color ?? "rgba(82, 171, 152, 0.25)",
    },
  };
};

const getTrapezoidCorners = (trapezoid: Trapezoid, canvasHeight: number) => {
  const leftVertexXVertical = new TrapezoidSegment(
    new TrapezoidPoint(trapezoid.leftVertex.x, -canvasHeight / 2),
    new TrapezoidPoint(trapezoid.leftVertex.x, canvasHeight / 2)
  );
  const upLeftCorner = getLinesIntersection(leftVertexXVertical, trapezoid.topEdge).point;
  const downLeftCorner = getLinesIntersection(leftVertexXVertical, trapezoid.bottomEdge).point;

  const rightVertexXVertical = new TrapezoidSegment(
    new TrapezoidPoint(trapezoid.rightVertex.x, -canvasHeight / 2),
    new TrapezoidPoint(trapezoid.rightVertex.x, canvasHeight / 2)
  );
  const upRightCorner = getLinesIntersection(rightVertexXVertical, trapezoid.topEdge).point;
  const downRightCorner = getLinesIntersection(rightVertexXVertical, trapezoid.bottomEdge).point;

  return {
    downLeftCorner: downLeftCorner!,
    downRightCorner: downRightCorner!,
    upLeftCorner: upLeftCorner!,
    upRightCorner: upRightCorner!,
  };
};
