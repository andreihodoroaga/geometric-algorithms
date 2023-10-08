import { Circle, Text } from "react-konva";
import { DEFAULT_POINT_SIZE, Point } from "../../shared/models/geometry";

interface Props {
  point: Point;
}

export default function PointComponent({ point }: Props) {
  return (
    <>
      <Circle x={point.x} y={point.y} radius={point.size ?? DEFAULT_POINT_SIZE} fill={point.color} />
      <Text text={point.label} x={point.x - 13} y={point.y - 13} fill={point.color} />
    </>
  );
}
