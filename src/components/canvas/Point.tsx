import { Circle, Text } from "react-konva";
import { Point } from "../../shared/models/geometry";

interface Props {
  point: Point;
}

export default function PointComponent({ point }: Props) {
  return (
    <>
      <Circle x={point.x} y={point.y} radius={5} fill={point.color} />
      <Text
        text={point.label}
        x={point.x - 13}
        y={point.y - 13}
        fill={point.color}
      />
    </>
  );
}
