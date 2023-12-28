import { ILine, Point } from "../../shared/models/geometry";
import { BLACK_COLOR, GREY_COLOR, LIGHT_GREY_COLOR } from "../../shared/util";

export type CanvasDimensions = {
  width: number;
  height: number;
};

export const getAxesLines = (canvasDimensions: CanvasDimensions) => {
  const xAxis: ILine = {
    startPoint: {
      x: -10,
      y: canvasDimensions.height / 2,
      label: "",
      color: GREY_COLOR,
    },
    endPoint: {
      x: canvasDimensions.width + 10,
      y: canvasDimensions.height / 2,
      label: "",
      color: GREY_COLOR,
    },
    color: BLACK_COLOR,
  };
  const yAxis: ILine = {
    startPoint: {
      x: canvasDimensions.width / 2,
      y: canvasDimensions.height + 10,
      label: "",
      color: GREY_COLOR,
    },
    endPoint: {
      x: canvasDimensions.width / 2,
      y: -10,
      label: "",
      color: GREY_COLOR,
    },
    color: BLACK_COLOR,
  };

  return [xAxis, yAxis];
};

export const getCenteredPoint = (point: Point, canvasDimensions: CanvasDimensions) => {
  return {
    ...point,
    x: point.x + canvasDimensions.width / 2,
    y: canvasDimensions.height / 2 - point.y,
  };
};

// Show the x and y top boundaries on the axes
export const getAxesBoundaryPoints = (canvasDimensions: CanvasDimensions, axisMultiplier: number) => {
  const xAxisPoint = {
    x: canvasDimensions.width - 5,
    y: canvasDimensions.height / 2,
    label: `(${Math.floor(canvasDimensions.width / 2 / axisMultiplier)},0)`,
    color: LIGHT_GREY_COLOR,
    labelPosition: {
      x: -28,
      y: 5,
    },
  };

  const yAxisPoint = {
    x: canvasDimensions.width / 2,
    y: 5,
    label: `(0,${Math.floor(canvasDimensions.height / 2 / axisMultiplier)})`,
    color: LIGHT_GREY_COLOR,
    labelPosition: {
      x: 5,
      y: -5,
    },
  };

  return [xAxisPoint, yAxisPoint];
};
