import { capitalize } from "lodash";
import { ICircle, ILine, IParabola, Point, TrapezoidForCanvas } from "./geometry";

type PointSizeType = "normal" | "focused";

export const PointSizeMap: { [key in Capitalize<PointSizeType>]: number } = {
  Normal: 5,
  Focused: 6,
};

type LineStyle = "solid" | "dash";

interface BaseDrawing<TType, TElement> {
  type: TType;
  element: TElement;
}

export interface PointDrawing extends BaseDrawing<"point", Point> {
  color: string;
  size?: number;
}

export interface LineDrawing extends BaseDrawing<"line", ILine> {
  style?: LineStyle;
}

export interface LinesDrawing extends BaseDrawing<"lines", ILine[]> {}

export interface CircleDrawing extends BaseDrawing<"circle", ICircle> {
  color: string;
}

export interface ParabolaDrawing extends BaseDrawing<"parabola", IParabola> {}

export interface TrapezoidDrawing extends BaseDrawing<"trapezoid", TrapezoidForCanvas> {}

export interface ClearCanvas {
  type: "clearCanvas";
  element: null;
}

export type Drawing =
  | PointDrawing
  | LineDrawing
  | LinesDrawing
  | CircleDrawing
  | ParabolaDrawing
  | TrapezoidDrawing
  | ClearCanvas;

// use this type to draw things that are specific to an algorithm
type CustomElement =
  | {
      type: "stackStatus";
      stackPoints: Point[];
    }
  | {
      type: "graph";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      element: any;
    };

export interface VisualizationStep {
  explanation?: string;
  explanations?: string[];
  graphicDrawingsStepList?: Drawing[];
  customElement?: CustomElement;
}

export abstract class DrawingFactory {
  static point(element: Point, color: string, sizeType: PointSizeType = "normal"): PointDrawing {
    return {
      type: "point",
      element,
      color,
      size: PointSizeMap[capitalize(sizeType) as Capitalize<PointSizeType>],
    };
  }

  static line(element: ILine, style?: LineStyle): LineDrawing {
    return {
      type: "line",
      element,
      style,
    };
  }

  static lineFromPoints(startPoint: Point, endPoint: Point, color: string, style?: LineStyle): LineDrawing {
    return {
      type: "line",
      element: {
        startPoint,
        endPoint,
        color,
      },
      style,
    };
  }

  static lines(element: ILine[]): LinesDrawing {
    return {
      type: "lines",
      element,
    };
  }

  static circle(element: ICircle, color: string): CircleDrawing {
    return {
      type: "circle",
      element,
      color,
    };
  }

  static parabola(element: IParabola): ParabolaDrawing {
    return {
      type: "parabola",
      element,
    };
  }

  static get clearCanvas(): ClearCanvas {
    return {
      type: "clearCanvas",
      element: null,
    };
  }
}
