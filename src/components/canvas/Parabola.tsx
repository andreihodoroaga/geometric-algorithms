import { Path } from "react-konva";
import { IParabola } from "../../shared/models/geometry";
import { BLUE_COLOR } from "../../shared/util";

type ParabolaProps = {
  parabola: IParabola;
  color?: string;
};

const THICKNESS = 1.5;
const DEFAULT_COLOR = BLUE_COLOR;

export default function Parabola({ parabola, color }: ParabolaProps) {
  const { startPoint, endPoint, controlPoint } = parabola;

  return (
    <Path
      sceneFunc={(ctx) => {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
        ctx.strokeStyle = color ?? DEFAULT_COLOR;
        ctx.lineWidth = THICKNESS;
        ctx.stroke();
      }}
    />
  );
}
