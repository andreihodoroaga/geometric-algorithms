import { Drawing, DrawingFactory, VisualizationStep } from "../../shared/models/algorithm";
import { LeftRight, Point, calculateOrientationForNormalPoints } from "../../shared/models/geometry";
import { BLACK_COLOR } from "../../shared/util";
import { CanvasDimensions } from "../canvas/helpers";
import { GraphNodeFactory, GraphTrapezoidNode, Trapezoid, TrapezoidPoint, TrapezoidSegment } from "./models";
import {
  checkPointExistsOnCanvas,
  convertToNormalLine,
  convertToNormalPoint,
  divideHorizontallySameTrapezoid,
  divideVerticallyFirstTrapezoid,
  divideVerticallyLastTrapezoid,
  extendPoint,
  getCurrentStateOfMapSteps,
  getIntersectedTrapezoids,
  getSegmentsFromPoints,
  getTrapezoidForCanvas,
  getTreeDataJson,
  permuteSegments,
  setNeighbourTrapezoids,
  updatePointExtension,
} from "./util";
import { Language } from "../../shared/i18n";
import { getTranslation } from "../../shared/i18n/algorithmTranslations";

let initialTrapezoid: Trapezoid;
let rootNode: GraphTrapezoidNode;

const setBoundingBox = (
  algorithmGraphicIndications: VisualizationStep[],
  canvasDimensions: CanvasDimensions,
  lang: Language
) => {
  const upLeftCorner = new TrapezoidPoint(-1, 1, "");
  const upRightCorner = new TrapezoidPoint(canvasDimensions.width + 1, 1, "");
  const downLeftCorner = new TrapezoidPoint(-1, -canvasDimensions.height - 1, "");
  const downRightCorner = new TrapezoidPoint(canvasDimensions.width + 1, -canvasDimensions.height - 1, "");

  const topEdge = new TrapezoidSegment(upLeftCorner, upRightCorner);
  const bottomEdge = new TrapezoidSegment(downLeftCorner, downRightCorner);

  downLeftCorner.extensionBottom = bottomEdge;
  downLeftCorner.extensionTop = topEdge;
  downRightCorner.extensionBottom = bottomEdge;
  downRightCorner.extensionTop = topEdge;

  initialTrapezoid = new Trapezoid(topEdge, bottomEdge, downLeftCorner, downRightCorner);
  rootNode = {
    label: "trapezoid",
    value: initialTrapezoid,
  };
  initialTrapezoid.correspondingLeaf = rootNode;

  algorithmGraphicIndications.push({
    explanation: getTranslation(lang, "determineInitialRect"),
    graphicDrawingsStepList: [DrawingFactory.clearCanvas],
    customElement: {
      type: "graph",
      element: getTreeDataJson(rootNode),
    },
  });
};

export const computeTrapezoidalMapSteps = (
  points: Point[],
  canvasDimensions: CanvasDimensions,
  lang: Language
) => {
  const initialSegments = getSegmentsFromPoints(points);
  const algorithmSegments: TrapezoidSegment[] = [];
  const endpointsOfExistingSegments = [];
  const algorithmGraphicIndications: VisualizationStep[] = [];
  const childNodesPositions: LeftRight[] = [];
  const { height } = canvasDimensions;
  let step: VisualizationStep;
  Trapezoid.trapezoidCount = 0;

  setBoundingBox(algorithmGraphicIndications, canvasDimensions, lang);
  permuteSegments(initialSegments);

  for (let i = 0; i < initialSegments.length; i++) {
    const segment = initialSegments[i];
    algorithmSegments.push({
      leftSegmentPoint: segment.leftSegmentPoint,
      rightSegmentPoint: segment.rightSegmentPoint,
    });
    step = {
      explanation: getTranslation(lang, "addSegment", {
        segment: segment.leftSegmentPoint.letter + segment.rightSegmentPoint.letter,
      }),
      graphicDrawingsStepList: [
        {
          type: "point",
          element: convertToNormalPoint(segment.leftSegmentPoint),
          color: BLACK_COLOR,
        },
        {
          type: "point",
          element: convertToNormalPoint(segment.rightSegmentPoint),
          color: BLACK_COLOR,
        },
        DrawingFactory.line(convertToNormalLine(segment)),
      ],
    };
    algorithmGraphicIndications.push(step);

    const intersectedTrapezoids = getIntersectedTrapezoids(
      endpointsOfExistingSegments,
      segment,
      childNodesPositions,
      rootNode,
      canvasDimensions
    );
    let trapezoidsList = "";
    step = { explanation: "", graphicDrawingsStepList: [] };

    for (let t = 0; t < intersectedTrapezoids.length; t++) {
      const trapezoid = intersectedTrapezoids[t];
      trapezoidsList += "T" + "<sub>" + trapezoid.count + "</sub>";
      if (t != intersectedTrapezoids.length - 1) {
        trapezoidsList += ", ";
      }
      step.graphicDrawingsStepList?.push(getTrapezoidForCanvas(trapezoid, height, "rgba(43, 103, 119, 0.25)"));
    }
    step.explanation = getTranslation(lang, "highlightIntersected", { trapezoids: trapezoidsList });
    algorithmGraphicIndications.push(step);

    const leftEndpointExistsOnCanvas = checkPointExistsOnCanvas(endpointsOfExistingSegments, segment.leftSegmentPoint);
    const rightEndpointExistsOnCanvas = checkPointExistsOnCanvas(
      endpointsOfExistingSegments,
      segment.rightSegmentPoint
    );

    if (intersectedTrapezoids.length == 1 && !leftEndpointExistsOnCanvas && !rightEndpointExistsOnCanvas) {
      const trapezoid = intersectedTrapezoids[0];
      extendPoint(
        segment.leftSegmentPoint,
        trapezoid.topEdge,
        trapezoid.bottomEdge,
        algorithmGraphicIndications,
        height,
        lang
      );
      extendPoint(
        segment.rightSegmentPoint,
        trapezoid.topEdge,
        trapezoid.bottomEdge,
        algorithmGraphicIndications,
        height,
        lang
      );
      endpointsOfExistingSegments.push(segment.leftSegmentPoint);
      endpointsOfExistingSegments.push(segment.rightSegmentPoint);

      divideHorizontallySameTrapezoid(
        trapezoid,
        segment,
        algorithmSegments,
        endpointsOfExistingSegments,
        algorithmGraphicIndications,
        height,
        lang
      );
    } else if (intersectedTrapezoids.length > 0) {
      const newTrapezoidsDrawingStep: Drawing[] = [];
      let newTrapezoidsList = "";

      if (!leftEndpointExistsOnCanvas) {
        const trapezoid = intersectedTrapezoids[0];
        extendPoint(
          segment.leftSegmentPoint,
          trapezoid.topEdge,
          trapezoid.bottomEdge,
          algorithmGraphicIndications,
          height,
          lang
        );
        endpointsOfExistingSegments.push(segment.leftSegmentPoint);

        const newTrapezoids = divideVerticallyFirstTrapezoid(trapezoid, segment);
        intersectedTrapezoids[0] = newTrapezoids.rightTrapezoid;

        newTrapezoidsList += newTrapezoids.leftTrapezoid.count + ", ";
        newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(newTrapezoids.leftTrapezoid, height));
      }

      if (!rightEndpointExistsOnCanvas) {
        const trapezoid = intersectedTrapezoids[intersectedTrapezoids.length - 1];
        extendPoint(
          segment.rightSegmentPoint,
          trapezoid.topEdge,
          trapezoid.bottomEdge,
          algorithmGraphicIndications,
          height,
          lang
        );
        endpointsOfExistingSegments.push(segment.rightSegmentPoint);

        const newTrapezoids = divideVerticallyLastTrapezoid(trapezoid, segment);
        intersectedTrapezoids[intersectedTrapezoids.length - 1] = newTrapezoids.leftTrapezoid;

        newTrapezoidsList += newTrapezoids.rightTrapezoid.count + ", ";
        newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(newTrapezoids.rightTrapezoid, height));
      }

      const upTrapezoidsNodes: GraphTrapezoidNode[] = [];
      const downTrapezoidsNodes: GraphTrapezoidNode[] = [];
      let positionOfLastTrapezoidNode = "";
      let lastUpTrapezoid = intersectedTrapezoids[0].upLeftTrapezoid;
      let lastDownTrapezoid = intersectedTrapezoids[0].downLeftTrapezoid;

      for (let t = 0; t < intersectedTrapezoids.length; t++) {
        const trapezoid = intersectedTrapezoids[t];
        const trapezoidRightVertex = trapezoid.rightVertex;

        const orientation = calculateOrientationForNormalPoints(
          segment.leftSegmentPoint,
          segment.rightSegmentPoint,
          trapezoid.rightVertex
        );

        if (orientation == 2 || t == intersectedTrapezoids.length - 1) {
          if (orientation == 2) {
            updatePointExtension(
              trapezoidRightVertex,
              trapezoidRightVertex.extensionTop,
              segment,
              algorithmGraphicIndications,
              canvasDimensions.height,
              lang
            );
          }

          const leftVertex =
            upTrapezoidsNodes.length > 0
              ? upTrapezoidsNodes[upTrapezoidsNodes.length - 1].value.rightVertex
              : segment.leftSegmentPoint;
          const upTrapezoid = new Trapezoid(trapezoid.topEdge, segment, leftVertex, trapezoidRightVertex);

          const downLeftNeighbour =
            upTrapezoidsNodes.length > 0 ? upTrapezoidsNodes[upTrapezoidsNodes.length - 1].value : null;
          let upLeftNeighbour = trapezoid.upLeftTrapezoid;
          if (positionOfLastTrapezoidNode !== "up") {
            upLeftNeighbour = lastUpTrapezoid;
            lastDownTrapezoid = trapezoid.downLeftTrapezoid;
            positionOfLastTrapezoidNode = "up";
          }
          setNeighbourTrapezoids(upTrapezoid, downLeftNeighbour, null, upLeftNeighbour, trapezoid.upRightTrapezoid);

          const upTrapezoidalMapGraphNode = GraphNodeFactory.createTrapezoid(upTrapezoid);
          upTrapezoid.correspondingLeaf = upTrapezoidalMapGraphNode;
          upTrapezoidsNodes.push(upTrapezoidalMapGraphNode);

          newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(upTrapezoid, height));
          newTrapezoidsList += upTrapezoid.count + ", ";
        }

        if (orientation == 1 || t == intersectedTrapezoids.length - 1) {
          if (orientation == 1) {
            updatePointExtension(
              trapezoidRightVertex,
              segment,
              trapezoidRightVertex.extensionBottom,
              algorithmGraphicIndications,
              canvasDimensions.height,
              lang
            );
          }
          const leftVertex =
            downTrapezoidsNodes.length > 0
              ? downTrapezoidsNodes[downTrapezoidsNodes.length - 1].value.rightVertex
              : segment.leftSegmentPoint;
          const downTrapezoid = new Trapezoid(segment, trapezoid.bottomEdge, leftVertex, trapezoidRightVertex);

          const upLeftNeighbour =
            downTrapezoidsNodes.length > 0 ? downTrapezoidsNodes[downTrapezoidsNodes.length - 1].value : null;
          let downLeftNeighbour = trapezoid.downLeftTrapezoid;
          if (positionOfLastTrapezoidNode != "down") {
            downLeftNeighbour = lastDownTrapezoid;
            lastUpTrapezoid = trapezoid.upLeftTrapezoid;
            positionOfLastTrapezoidNode = "down";
          }
          setNeighbourTrapezoids(downTrapezoid, downLeftNeighbour, trapezoid.downRightTrapezoid, upLeftNeighbour, null);

          const downTrapezoidalMapGraphNode = GraphNodeFactory.createTrapezoid(downTrapezoid);
          downTrapezoid.correspondingLeaf = downTrapezoidalMapGraphNode;
          downTrapezoidsNodes.push(downTrapezoidalMapGraphNode);

          newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(downTrapezoid, height));
          newTrapezoidsList += downTrapezoid.count + ", ";
        }
      }

      let upTrapezoidsNodesIndex = 0;
      let downTrapezoidsNodesIndex = 0;

      for (let t = 0; t < intersectedTrapezoids.length; t++) {
        const trapezoid = intersectedTrapezoids[t];

        const leaf = trapezoid.correspondingLeaf;

        if (!leaf) {
          continue;
        }

        leaf.label = "segment";
        leaf.value = segment;
        leaf.leftNode = upTrapezoidsNodes[upTrapezoidsNodesIndex];
        leaf.rightNode = downTrapezoidsNodes[downTrapezoidsNodesIndex];
        const orientation = calculateOrientationForNormalPoints(
          segment.leftSegmentPoint,
          segment.rightSegmentPoint,
          trapezoid.rightVertex
        );

        if (orientation == 2 || orientation == 0) {
          upTrapezoidsNodesIndex++;
        }

        if (orientation == 1 || orientation == 0) {
          downTrapezoidsNodesIndex++;
        }
      }

      step = {
        explanation: getTranslation(lang, "intersectedReplaced", { trapezoids: newTrapezoidsList }),
        graphicDrawingsStepList: getCurrentStateOfMapSteps(endpointsOfExistingSegments, algorithmSegments, height),
      };

      for (let ds = 0; ds < newTrapezoidsDrawingStep.length; ds++) {
        step.graphicDrawingsStepList?.push(newTrapezoidsDrawingStep[ds]);
      }
      algorithmGraphicIndications.push(step);
    }

    algorithmGraphicIndications.push({
      explanation: getTranslation(lang, "removeLeafCreateNew"),
      graphicDrawingsStepList: [...getCurrentStateOfMapSteps(endpointsOfExistingSegments, algorithmSegments, height)],
      customElement: {
        type: "graph",
        element: getTreeDataJson(rootNode),
      },
    });
  }

  return algorithmGraphicIndications;
};
