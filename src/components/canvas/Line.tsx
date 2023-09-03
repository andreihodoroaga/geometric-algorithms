import { Line } from "react-konva";
import { ILine } from "../../shared/models/geometry";

interface Props {
  line: ILine;
}

export default function LineComponent({ line }: Props) {
  return (
    <Line points={line.points} stroke={line.color} dash={line.dash ?? []} />
  );
}
