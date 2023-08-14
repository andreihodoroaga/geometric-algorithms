import { Circle, Layer, Stage } from "react-konva";
import "./Canvas.scss";
import { useEffect, useState } from "react";
import OverlayText from "./overlay-text/OverlayText";
import { KonvaEventObject } from "konva/lib/Node";

interface Point {
  x: number;
  y: number;
}

// A reusable component to be used in every algorithm
export default function Canvas() {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [points, setPoints] = useState<Point[]>([]);
  const [showOverlayText, setShowOverlayText] = useState(true);

  // Set the canvas width and height
  useEffect(() => {
    const handleResize = () => {
      const canvasParentElement = document.querySelector(".canvas-component");
      if (canvasParentElement) {
        const { width, height } = canvasParentElement.getBoundingClientRect();
        setCanvasDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const generateRandomPoints = () => {
    // generate points ...
    console.log("generate random points");
  };

  const addPoint = (e: KonvaEventObject<MouseEvent>) => {
    setShowOverlayText(false);
    setPoints((prevPoints) => [
      ...prevPoints,
      e.target.getStage()!.getPointerPosition() as Point,
    ]);
  };

  return (
    <div className="canvas-component">
      <Stage
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onClick={(e) => addPoint(e)}
      >
        <Layer>
          {points.map((point) => (
            <Circle
              key={point.x.toString() + point.y.toString()}
              x={point.x}
              y={point.y}
              radius={5}
              fill="#666"
            />
          ))}
        </Layer>
      </Stage>
      {showOverlayText && (
        <OverlayText generateRandomPoints={generateRandomPoints} />
      )}
    </div>
  );
}
