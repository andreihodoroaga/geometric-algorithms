export class TrapezoidPoint {
  public x: number;
  public y: number;
  public letter: string;
  public extensionTop: TrapezoidSegment | null = null;
  public extensionBottom: TrapezoidSegment | null = null;

  constructor(x: number, y: number, letter?: string) {
    this.x = x;
    this.y = y;
    this.letter = letter ?? "";
  }
}

export class TrapezoidSegment {
  public leftSegmentPoint: TrapezoidPoint;
  public rightSegmentPoint: TrapezoidPoint;

  constructor(leftSegmentPoint: TrapezoidPoint, rightSegmentPoint: TrapezoidPoint) {
    this.leftSegmentPoint = leftSegmentPoint;
    this.rightSegmentPoint = rightSegmentPoint;
  }
}

export class Trapezoid {
  public topEdge: TrapezoidSegment;
  public bottomEdge: TrapezoidSegment;
  public leftVertex: TrapezoidPoint;
  public rightVertex: TrapezoidPoint;
  public count = 0;
  public downLeftTrapezoid: Trapezoid | null = null;
  public downRightTrapezoid: Trapezoid | null = null;
  public upLeftTrapezoid: Trapezoid | null = null;
  public upRightTrapezoid: Trapezoid | null = null;
  public correspondingLeaf: TrapezoidalMapGraphNode | null = null;

  public static trapezoidCount = 0;

  constructor(
    topEdge: TrapezoidSegment,
    bottomEdge: TrapezoidSegment,
    leftVertex: TrapezoidPoint,
    rightVertex: TrapezoidPoint
  ) {
    this.topEdge = topEdge;
    this.bottomEdge = bottomEdge;
    this.leftVertex = leftVertex;
    this.rightVertex = rightVertex;
    this.count = ++Trapezoid.trapezoidCount;
  }
}

interface BaseGraphNode {
  leftNode?: TrapezoidalMapGraphNode;
  rightNode?: TrapezoidalMapGraphNode;
}

export type GraphTrapezoidNode = BaseGraphNode & {
  label: "trapezoid";
  value: Trapezoid;
};

export type GraphSegmentNode = BaseGraphNode & {
  label: "segment";
  value: TrapezoidSegment;
};

export type GraphVertexNode = BaseGraphNode & {
  label: "vertex";
  value: TrapezoidPoint;
};

export type TrapezoidalMapGraphNode = GraphTrapezoidNode | GraphSegmentNode | GraphVertexNode;

export const isGraphTrapezoidNode = (node: TrapezoidalMapGraphNode): node is GraphTrapezoidNode => {
  return node.label === "trapezoid";
};

export const isGraphSegmentNode = (node: TrapezoidalMapGraphNode): node is GraphSegmentNode => {
  return node.label === "segment";
};

export const isGraphVertexNode = (node: TrapezoidalMapGraphNode): node is GraphVertexNode => {
  return node.label === "vertex";
};

export class GraphNodeFactory {
  static createTrapezoid(value: Trapezoid): GraphTrapezoidNode {
    return { label: "trapezoid", value };
  }

  static createSegment(value: TrapezoidSegment): GraphSegmentNode {
    return { label: "segment", value };
  }

  static createVertex(value: TrapezoidPoint): GraphVertexNode {
    return { label: "vertex", value };
  }
}
