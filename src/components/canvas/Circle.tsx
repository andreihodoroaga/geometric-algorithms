import { Circle } from "react-konva";
import { ICircle, defaultDash } from "../../shared/models/geometry";
import PointComponent from "./Point";
import { GREY_COLOR, ORANGE_COLOR } from "../../shared/util";

interface Props {
  circle: ICircle;
}

export default function CircleComponent({ circle }: Props) {
  const { center, radius } = circle;
  return (
    <>
      <PointComponent point={{ ...center, label: "", color: ORANGE_COLOR, size: 3 }} />
      <Circle x={center.x} y={center.y} radius={radius} stroke={GREY_COLOR} strokeWidth={1} dash={defaultDash} />
    </>
  );
}
