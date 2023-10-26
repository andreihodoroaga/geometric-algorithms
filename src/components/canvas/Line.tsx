import { Line } from "react-konva";
import { ILine } from "../../shared/models/geometry";

interface Props {
  line: ILine;
}

export default function LineComponent({ line }: Props) {
  const pointsArray = () => {
    return [line.startPoint.x, line.startPoint.y, line.endPoint.x, line.endPoint.y];
  };
  
  return (
    <Line points={pointsArray()} stroke={line.color} dash={line.dash ?? []} />
  );
}
