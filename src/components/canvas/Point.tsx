import { Circle, Text } from "react-konva";
import { Point } from "../../shared/models/geometry";
import { CanvasDimensions } from "./helpers";
import { PointSizeMap } from "../../shared/models/algorithm";

const DEFAULT_LABEL_OFFSET = { x: 10, y: 16 };

interface Props {
  point: Point;
  canvasDimensions?: CanvasDimensions;
}

export default function PointComponent({ point }: Props) {
  let labelPositionX = point.x + (point.labelPosition?.x ?? -DEFAULT_LABEL_OFFSET.x);
  let labelPositionY = point.y + (point.labelPosition?.y ?? -DEFAULT_LABEL_OFFSET.y);

  // when the label is outside the canvas, re-position it such that is visible
  if (labelPositionY < 0) {
    labelPositionX += 2 * DEFAULT_LABEL_OFFSET.x;
    labelPositionY += DEFAULT_LABEL_OFFSET.y;
  } else if (labelPositionX < 0) {
    labelPositionX += DEFAULT_LABEL_OFFSET.x;
  }

  return (
    <>
      <Circle x={point.x} y={point.y} radius={point.size ?? PointSizeMap.Normal} fill={point.color} />
      <Text text={point.label} x={labelPositionX} y={labelPositionY} fill={point.color} />
    </>
  );
}
