import { useState } from "react";
import { ILine, Point } from "../../shared/models/geometry";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import Button from "../button/Button";
import { GREY_COLOR } from "../../shared/util";
import randomColor from "randomcolor";
import "./Duality.scss";
import "../../shared/scss/custom-slider.scss";
import { CanvasDimensions } from "../canvas/helpers";

const MIN_AXIS_MULTIPLIER = 1;
const MAX_AXIS_MULTIPLIER = 40;
const BASE_AXIS_MULTIPLIER = 20;

export default function Duality() {
  const [primalPoints, setPrimalPoints] = useState<Point[]>([]);
  const [dualPoints, setDualPoints] = useState<Point[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [pointX, setPointX] = useState<string>("");
  const [pointY, setPointY] = useState<string>("");
  const [lineX, setLineX] = useState<string>("");
  const [lineY, setLineY] = useState<string>("");
  const [axisMultiplier, setAxisMultiplier] = useState(BASE_AXIS_MULTIPLIER);
  const OUT_OF_BOUNDS_X = 2000; // used to simulate an "infinite" line
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: 0,
  });

  const isFormValid = (xValue: string, yValue: string) => {
    if (xValue === "" || yValue === "") {
      return false;
    }
    return true;
  };

  // constructs the line of 2 points that satisfies y = m * x - n
  const getLineFromEquation = (m: number, n: number, color: string): ILine => {
    const firstPoint = {
      x: -OUT_OF_BOUNDS_X,
      y: m * -OUT_OF_BOUNDS_X - n,
      color: GREY_COLOR,
      label: "",
    };
    const secondPoint = {
      x: OUT_OF_BOUNDS_X,
      y: m * OUT_OF_BOUNDS_X - n,
      color: GREY_COLOR,
      label: "",
    };
    return {
      startPoint: firstPoint,
      endPoint: secondPoint,
      color,
    };
  };

  const formatLineForExplanation = (xValue: string, yValue: string) => {
    const xCoord = parseInt(xValue);
    const yCoord = parseInt(yValue);
    let explanation = "";

    if (xCoord !== 0) {
      if (xCoord !== 1 && xCoord !== -1) {
        explanation += xValue;
      }
      if (xCoord === -1) {
        explanation += "-";
      }
      explanation += "x";
    }
    if (yCoord !== 0) {
      explanation += yCoord > 0 ? ` - ${yCoord}` : ` + ${-yCoord}`;
    } else if (xCoord === 0) {
      explanation += yCoord;
    }

    return explanation;
  };

  const getPointToLineExplanation = (x: string, y: string) => {
    return `Punctul (${x}, ${y}) devine dreapta y = ${formatLineForExplanation(x, y)} in planul dual`;
  };

  const getLineToPointExplanation = (m: string, n: string) => {
    return `Dreapta y = ${formatLineForExplanation(m, n)} devine punctul (${m}, ${n})`;
  };

  const addPoint = () => {
    if (!isFormValid(pointX, pointY)) {
      return;
    }

    const newPoint = {
      x: parseInt(pointX),
      y: parseInt(pointY),
      label: `(${pointX},${pointY})`,
      // the seed is here mostly for the e2e tests (they use screenshots)
      color: randomColor({ seed: primalPoints.length * 10 }),
    };
    setPrimalPoints((points) => [...points, newPoint]);
    setExplanations((explanations) => [...explanations, getPointToLineExplanation(pointX, pointY)]);

    setPointX("");
    setPointY("");
  };

  const addLine = () => {
    if (!isFormValid(lineX, lineY)) {
      return;
    }

    const newPointX = parseInt(lineX);
    const newPointY = -parseInt(lineY);
    const newPoint = {
      x: newPointX,
      y: newPointY,
      label: `(${newPointX},${newPointY})`,
      color: randomColor({ seed: (dualPoints.length + 1) * 7 }),
    };
    setDualPoints((points) => [...points, newPoint]);
    setExplanations((explanations) => [...explanations, getLineToPointExplanation(lineX, newPointY.toString())]);

    setLineX("");
    setLineY("");
  };

  const parseInput = (value: string) => {
    return value.replace(/[^-0-9.]/g, "");
  };

  const pointsScaled = (points: Point[]) =>
    points.map((point) => ({
      ...point,
      x: point.x * axisMultiplier,
      y: point.y * axisMultiplier,
    }));

  const primalPointsScaled = pointsScaled(primalPoints);
  const dualPointsScaled = pointsScaled(dualPoints);

  // although we scale points by valueMultiplier to view them nicely,
  // the slope must not be multiplied (the point (1, 2) becomes (10, 20) for the centered canvas)
  // but the line should not be 10x - 20, but rather x - 20
  const primalLinesScaled = dualPointsScaled.map(
    (point) => getLineFromEquation(point.x / axisMultiplier, -point.y, point.color) // adding the - before the y because the function creates the mx - n line
  );

  const dualLinesScaled = primalPointsScaled.map((point) =>
    getLineFromEquation(point.x / axisMultiplier, point.y, point.color)
  );

  return (
    <>
      <div className="canvas-wrapper canvas-split-mode">
        <Canvas
          points={primalPointsScaled}
          setPoints={() => void 0}
          lines={primalLinesScaled}
          setLines={() => void 0}
          hasOverlayText={false}
          axes={true}
          originInCenter={true}
          disabled={true}
          axisMultiplier={axisMultiplier}
          canvasDimensions={canvasDimensions}
          setCanvasDimensions={setCanvasDimensions}
        />
        <Canvas
          points={dualPointsScaled}
          setPoints={() => void 0}
          lines={dualLinesScaled}
          setLines={() => void 0}
          hasOverlayText={false}
          axes={true}
          originInCenter={true}
          disabled={true}
          axisMultiplier={axisMultiplier}
          canvasDimensions={canvasDimensions}
          setCanvasDimensions={setCanvasDimensions}
        />
      </div>
      <div className="explanations-wrapper">
        <Explanations explanations={explanations} algorithm={"Dualitate"} />
      </div>
      <div className="panel-wrapper">
        <div className="add-coordinates-container">
          <h3>Punct nou</h3>
          <div className="add-coordinates-form">
            <div className="inputs">
              <label>
                x:
                <input
                  id="point-x"
                  type="text"
                  value={pointX}
                  onChange={(e) => setPointX(parseInput(e.target.value))}
                ></input>
              </label>
              <label>
                y:
                <input
                  id="point-y"
                  type="text"
                  value={pointY}
                  onChange={(e) => setPointY(parseInput(e.target.value))}
                ></input>
              </label>
            </div>
            <div className="add-btn add-point">
              <Button
                content="Add"
                extraClass={`mini ${isFormValid(pointX, pointY) && "primary"}`}
                onClick={addPoint}
              />
            </div>
          </div>
        </div>

        <div className="add-coordinates-container">
          <h3>Linie noua</h3>
          <div className="add-coordinates-form">
            <div className="inputs">
              <label>
                m:
                <input
                  id="line-x"
                  type="text"
                  value={lineX}
                  onChange={(e) => setLineX(parseInput(e.target.value))}
                ></input>
              </label>
              <label>
                n:
                <input
                  id="line-y"
                  type="text"
                  value={lineY}
                  onChange={(e) => setLineY(parseInput(e.target.value))}
                ></input>
              </label>
            </div>
            <div className="add-btn add-line">
              <Button content="Add" extraClass={`mini ${isFormValid(lineX, lineY) && "primary"}`} onClick={addLine} />
            </div>
          </div>
        </div>
      </div>

      <div className="controls">
        <div className="slider zoom-slider">
          <label>
            Zoom:
            <input
              type="range"
              value={axisMultiplier}
              min={MIN_AXIS_MULTIPLIER}
              max={MAX_AXIS_MULTIPLIER}
              onChange={(e) => setAxisMultiplier(+e.target.value)}
            />
          </label>
        </div>
      </div>
    </>
  );
}
