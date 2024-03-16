import { Path } from "react-konva";
import { IParabola } from "../../shared/models/geometry";

type ParabolaProps = {
  parabola: IParabola;
};

export default function Parabola({ parabola }: ParabolaProps) {
  const { startPoint, endPoint, controlPoint } = parabola;
  return (
    <Path
      sceneFunc={(ctx) => {
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
        ctx.stroke();
      }}
    />
  );
}
