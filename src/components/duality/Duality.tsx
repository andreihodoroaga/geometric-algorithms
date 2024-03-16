import { useEffect, useState } from "react";
import { ILine, Point } from "../../shared/models/geometry";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import Button from "../button/Button";
import { GREY_COLOR } from "../../shared/util";
import randomColor from "randomcolor";
import "./Duality.scss";
import "../../shared/scss/custom-slider.scss";
import { CanvasDimensions } from "../canvas/helpers";

export default function Duality() {
  const [primalPoints, setPrimalPoints] = useState<Point[]>([]);
  const [primalLines, setPrimalLines] = useState<ILine[]>([]);
  const [dualPoints, setDualPoints] = useState<Point[]>([]);
  const [dualLines, setDualLines] = useState<ILine[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [pointX, setPointX] = useState<string>("");
  const [pointY, setPointY] = useState<string>("");
  const [lineX, setLineX] = useState<string>("");
  const [lineY, setLineY] = useState<string>("");
  const [axisMultiplier, setAxisMultiplier] = useState(10);
  const OUT_OF_BOUNDS_X = 1000; // used to simulate an "infinite" line
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: 0,
  });

  // TODO: no longer reset these when changing the axisMultiplier
  // move the axisMultiplier state to the canvas, and make it so that the points from here
  // are given as they are, without multiplying them, and let the canvas handle that
  useEffect(() => {
    setPrimalPoints([]);
    setPrimalLines([]);
    setDualPoints([]);
    setDualLines([]);
  }, [axisMultiplier]);

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

    const newColor = randomColor();
    const newPoint = {
      x: parseInt(pointX) * axisMultiplier,
      y: parseInt(pointY) * axisMultiplier,
      label: `(${pointX},${pointY})`,
      color: newColor,
    };
    setPrimalPoints((points) => [...points, newPoint]);
    // although we scale points by valueMultiplier to view them nicely,
    // the slope must not be multiplied (the point (1, 2) becomes (10, 20) for the centered canvas)
    // but the line should not be 10x - 20, but rather x - 20
    setDualLines((lines) => [...lines, getLineFromEquation(parseInt(pointX), newPoint.y, newColor)]);
    setExplanations((explanations) => [...explanations, getPointToLineExplanation(pointX, pointY)]);

    setPointX("");
    setPointY("");
  };

  const addLine = () => {
    if (!isFormValid(lineX, lineY)) {
      return;
    }

    const newColor = randomColor();
    // adding the - before the y because the function creates the mx - n line
    const newLine = getLineFromEquation(parseInt(lineX), -parseInt(lineY) * axisMultiplier, newColor);
    setPrimalLines((lines) => [...lines, newLine]);

    const newPointX = parseInt(lineX) * axisMultiplier;
    const newPointY = -parseInt(lineY) * axisMultiplier;
    const newPoint = {
      x: newPointX,
      y: newPointY,
      label: `(${lineX},${-parseInt(lineY)})`,
      color: newColor,
    };
    setDualPoints((points) => [...points, newPoint]);
    setExplanations((explanations) => [
      ...explanations,
      getLineToPointExplanation(lineX, (-parseInt(lineY)).toString()),
    ]);

    setLineX("");
    setLineY("");
  };

  const parseInput = (value: string) => {
    return value.replace(/[^-0-9]/g, "");
  };

  return (
    <>
      <div className="canvas-wrapper canvas-split-mode">
        <Canvas
          points={primalPoints}
          setPoints={setPrimalPoints}
          lines={primalLines}
          setLines={setPrimalLines}
          hasOverlayText={false}
          axes={true}
          originInCenter={true}
          disabled={true}
          axisMultiplier={axisMultiplier}
          canvasDimensions={canvasDimensions}
          setCanvasDimensions={setCanvasDimensions}
        />
        <Canvas
          points={dualPoints}
          setPoints={() => []}
          lines={dualLines}
          setLines={() => []}
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
            <div className="add-btn">
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
            <div className="add-btn">
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
              min={1}
              max={20}
              onChange={(e) => setAxisMultiplier(+e.target.value)}
            />
          </label>
        </div>
      </div>
    </>
  );
}
