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
  getAllTrapezoidsFromGraph,
  getCurrentStateOfMapSteps,
  getIntersectedTrapezoids,
  getSegmentsFromPoints,
  getTrapezoidForCanvas,
  getTreeDataJson,
  permuteSegments,
  setNeighbourTrapezoids,
  updatePointExtension,
} from "./util";

let initialTrapezoid: Trapezoid;
let rootNode: GraphTrapezoidNode;

const setBoundingBox = (algorithmGraphicIndications: VisualizationStep[], canvasDimensions: CanvasDimensions) => {
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
    explanation: "Se determina dreptunghiul initial.",
    graphicDrawingsStepList: [DrawingFactory.clearCanvas],
    customElement: {
      type: "graph",
      element: getTreeDataJson(rootNode),
    },
  });
};

export const computeTrapezoidalMapSteps = (points: Point[], canvasDimensions: CanvasDimensions) => {
  const initialSegments = getSegmentsFromPoints(points);
  const algorithmSegments: TrapezoidSegment[] = [];
  const endpointsOfExistingSegments = [];
  const algorithmGraphicIndications: VisualizationStep[] = [];
  const childNodesPositions: LeftRight[] = [];
  const { height } = canvasDimensions;
  let step: VisualizationStep;
  Trapezoid.trapezoidCount = 0;

  setBoundingBox(algorithmGraphicIndications, canvasDimensions);
  permuteSegments(initialSegments);

  for (let i = 0; i < initialSegments.length; i++) {
    const segment = initialSegments[i];
    algorithmSegments.push({
      leftSegmentPoint: segment.leftSegmentPoint,
      rightSegmentPoint: segment.rightSegmentPoint,
    });
    step = {
      explanation: "Se adauga un segment: " + segment.leftSegmentPoint.letter + segment.rightSegmentPoint.letter,
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
    let message = "Se evidentiaza trapezele care intersecteaza segmentul adaugat: ";
    step = { explanation: "", graphicDrawingsStepList: [] };

    for (let t = 0; t < intersectedTrapezoids.length; t++) {
      const trapezoid = intersectedTrapezoids[t];
      message = message + "T" + "<sub>" + trapezoid.count + "</sub>";
      if (t != intersectedTrapezoids.length - 1) {
        message += ", ";
      }
      step.graphicDrawingsStepList?.push(getTrapezoidForCanvas(trapezoid, height, "rgba(43, 103, 119, 0.25)"));
    }
    step.explanation = message;
    algorithmGraphicIndications.push(step);

    const leftEndpointExistsOnCanvas = checkPointExistsOnCanvas(endpointsOfExistingSegments, segment.leftSegmentPoint);
    const rightEndpointExistsOnCanvas = checkPointExistsOnCanvas(
      endpointsOfExistingSegments,
      segment.rightSegmentPoint
    );

    if (intersectedTrapezoids.length == 1 && !leftEndpointExistsOnCanvas && !rightEndpointExistsOnCanvas) {
      // cazul mai simplu: ambele puncte sunt noi si doar un trapez este intersectat
      const trapezoid = intersectedTrapezoids[0];
      extendPoint(
        segment.leftSegmentPoint,
        trapezoid.topEdge,
        trapezoid.bottomEdge,
        algorithmGraphicIndications,
        height
      );
      extendPoint(
        segment.rightSegmentPoint,
        trapezoid.topEdge,
        trapezoid.bottomEdge,
        algorithmGraphicIndications,
        height
      );
      endpointsOfExistingSegments.push(segment.leftSegmentPoint);
      endpointsOfExistingSegments.push(segment.rightSegmentPoint);

      divideHorizontallySameTrapezoid(
        trapezoid,
        segment,
        algorithmSegments,
        endpointsOfExistingSegments,
        algorithmGraphicIndications,
        height
      );
    } else {
      const newTrapezoidsDrawingStep: Drawing[] = [];
      let messageFinal = "Trapezele intersectate sunt eliminate sunt inlocuite cu noile trapeze ";

      // daca leftSegmentPoint este punct nou -> divideVerticallyFirstTrapezoid
      if (!leftEndpointExistsOnCanvas) {
        const trapezoid = intersectedTrapezoids[0];
        extendPoint(
          segment.leftSegmentPoint,
          trapezoid.topEdge,
          trapezoid.bottomEdge,
          algorithmGraphicIndications,
          height
        );
        endpointsOfExistingSegments.push(segment.leftSegmentPoint);

        const newTrapezoids = divideVerticallyFirstTrapezoid(trapezoid, segment);
        intersectedTrapezoids[0] = newTrapezoids.rightTrapezoid;

        messageFinal = messageFinal + newTrapezoids.leftTrapezoid.count + ", ";
        newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(newTrapezoids.leftTrapezoid, height));
      }

      // daca rightSegmentPoint este punct nou -> divideVerticallyLastTrapezoid
      if (!rightEndpointExistsOnCanvas) {
        const trapezoid = intersectedTrapezoids[intersectedTrapezoids.length - 1];
        extendPoint(
          segment.rightSegmentPoint,
          trapezoid.topEdge,
          trapezoid.bottomEdge,
          algorithmGraphicIndications,
          height
        );
        endpointsOfExistingSegments.push(segment.rightSegmentPoint);

        const newTrapezoids = divideVerticallyLastTrapezoid(trapezoid, segment);
        intersectedTrapezoids[intersectedTrapezoids.length - 1] = newTrapezoids.leftTrapezoid;

        messageFinal = messageFinal + newTrapezoids.rightTrapezoid.count + ", ";
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
        // orientation == 1 -> rightVertex este la dreapta segmentului
        // orientation == 2 -> rightVertex este la stanga segmentului

        if (orientation == 2 || t == intersectedTrapezoids.length - 1) {
          // actualizare extensie inferioara pentru rightVertex daca nu e ultimul trapez
          if (orientation == 2) {
            updatePointExtension(
              trapezoidRightVertex,
              trapezoidRightVertex.extensionTop,
              segment,
              algorithmGraphicIndications,
              canvasDimensions.height
            );
          }

          // trebuie facut un trapez in partea de sus
          const leftVertex =
            upTrapezoidsNodes.length > 0
              ? upTrapezoidsNodes[upTrapezoidsNodes.length - 1].value.rightVertex
              : segment.leftSegmentPoint;
          const upTrapezoid = new Trapezoid(trapezoid.topEdge, segment, leftVertex, trapezoidRightVertex);

          // actualizez vecini
          const downLeftNeighbour =
            upTrapezoidsNodes.length > 0 ? upTrapezoidsNodes[upTrapezoidsNodes.length - 1].value : null;
          let upLeftNeighbour = trapezoid.upLeftTrapezoid;
          if (positionOfLastTrapezoidNode !== "up") {
            upLeftNeighbour = lastUpTrapezoid;
            lastDownTrapezoid = trapezoid.downLeftTrapezoid;
            positionOfLastTrapezoidNode = "up";
          }
          setNeighbourTrapezoids(upTrapezoid, downLeftNeighbour, null, upLeftNeighbour, trapezoid.upRightTrapezoid);

          // formez nod in graf
          const upTrapezoidalMapGraphNode = GraphNodeFactory.createTrapezoid(upTrapezoid);
          upTrapezoid.correspondingLeaf = upTrapezoidalMapGraphNode;
          upTrapezoidsNodes.push(upTrapezoidalMapGraphNode);

          newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(upTrapezoid, height));
          messageFinal = messageFinal + upTrapezoid.count + ", ";
        }

        if (orientation == 1 || t == intersectedTrapezoids.length - 1) {
          // actualizare extensie superioara pentru rightVertex daca nu e ultimul trapez
          if (orientation == 1) {
            updatePointExtension(
              trapezoidRightVertex,
              segment,
              trapezoidRightVertex.extensionBottom,
              algorithmGraphicIndications,
              canvasDimensions.height
            );
          }
          // trebuie facut un trapez in partea de jos
          const leftVertex =
            downTrapezoidsNodes.length > 0
              ? downTrapezoidsNodes[downTrapezoidsNodes.length - 1].value.rightVertex
              : segment.leftSegmentPoint;
          const downTrapezoid = new Trapezoid(segment, trapezoid.bottomEdge, leftVertex, trapezoidRightVertex);

          // actualizez vecini
          const upLeftNeighbour =
            downTrapezoidsNodes.length > 0 ? downTrapezoidsNodes[downTrapezoidsNodes.length - 1].value : null;
          let downLeftNeighbour = trapezoid.downLeftTrapezoid;
          if (positionOfLastTrapezoidNode != "down") {
            downLeftNeighbour = lastDownTrapezoid;
            lastUpTrapezoid = trapezoid.upLeftTrapezoid;
            positionOfLastTrapezoidNode = "down";
          }
          setNeighbourTrapezoids(downTrapezoid, downLeftNeighbour, trapezoid.downRightTrapezoid, upLeftNeighbour, null);

          // formez nod in graf
          const downTrapezoidalMapGraphNode = GraphNodeFactory.createTrapezoid(downTrapezoid);
          downTrapezoid.correspondingLeaf = downTrapezoidalMapGraphNode;
          downTrapezoidsNodes.push(downTrapezoidalMapGraphNode);

          newTrapezoidsDrawingStep.push(getTrapezoidForCanvas(downTrapezoid, height));
          messageFinal = messageFinal + downTrapezoid.count + ", ";
        }
      }

      // actualizeaza structura de cautare
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
        explanation: messageFinal,
        graphicDrawingsStepList: getCurrentStateOfMapSteps(endpointsOfExistingSegments, algorithmSegments, height),
      };

      for (let ds = 0; ds < newTrapezoidsDrawingStep.length; ds++) {
        step.graphicDrawingsStepList?.push(newTrapezoidsDrawingStep[ds]);
      }
      algorithmGraphicIndications.push(step);
    }

    algorithmGraphicIndications.push({
      explanation: "Se elimina frunza corespunzatoare din structura de cautare si se creeaza noi frunze.",
      graphicDrawingsStepList: [
        ...getCurrentStateOfMapSteps(
          endpointsOfExistingSegments,
          algorithmSegments,
          height,
          getAllTrapezoidsFromGraph(rootNode)
        ),
      ],
      customElement: {
        type: "graph",
        element: getTreeDataJson(rootNode),
      },
    });
  }

  return algorithmGraphicIndications;
};
