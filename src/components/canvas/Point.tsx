import { Circle, Text } from "react-konva";
import { DEFAULT_POINT_SIZE, Point } from "../../shared/models/geometry";

interface Props {
  point: Point;
}

export default function PointComponent({ point }: Props) {
  const labelPositionX = point.x + (point.labelPosition?.x ?? -10);
  const labelPositionY = point.y + (point.labelPosition?.y ?? -16);

  return (
    <>
      <Circle x={point.x} y={point.y} radius={point.size ?? DEFAULT_POINT_SIZE} fill={point.color} />
      <Text text={point.label} x={labelPositionX} y={labelPositionY} fill={point.color} />
    </>
  );
}
