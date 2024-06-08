import React from "react";
import { Shape } from "react-konva";
import { TrapezoidDrawing } from "../../shared/models/geometry";

interface TrapezoidComponentProps {
  trapezoid: TrapezoidDrawing;
}

export const TrapezoidComponent: React.FC<TrapezoidComponentProps> = ({ trapezoid }) => {
  const { downLeftCorner, downRightCorner, upLeftCorner, upRightCorner, backgroundColor } = trapezoid;

  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.moveTo(upLeftCorner.x, upLeftCorner.y);
        ctx.lineTo(upRightCorner.x, upRightCorner.y);
        ctx.lineTo(downRightCorner.x, downRightCorner.y);
        ctx.lineTo(downLeftCorner.x, downLeftCorner.y);
        ctx.closePath();
        ctx.fillStyle = backgroundColor;
        ctx.fill();
        ctx.strokeShape(shape);
      }}
    />
  );
};

export default TrapezoidComponent;
