import { useEffect, useState } from "react";
import {
  DEFAULT_POINT_SIZE,
  ILine,
  Point,
  convertPointBetweenAlgorithmAndCanvas,
  defaultDash,
} from "../../shared/models/geometry";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import { GREEN_COLOR, GREY_COLOR, ORANGE_COLOR, getLinesFromPoints } from "../../shared/util";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import Button from "../button/Button";
import { Menu, MenuItem } from "@szhsin/react-menu";
import Snackbar from "@mui/material/Snackbar";
import React from "react";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

enum RunMode {
  Automatic = "Automat",
  Manual = "Manual",
}

// at each step only the green points and lines should remain
const clearPointsFromCanvas = (points: Point[]) => {
  return points.map((point) =>
    point.color === GREEN_COLOR
      ? point
      : {
          ...point,
          color: GREY_COLOR,
          size: DEFAULT_POINT_SIZE,
        }
  );
};

const clearLinesFromCanvas = (lines: ILine[]) => {
  return lines.map((line) =>
    [GREEN_COLOR, ORANGE_COLOR].includes(line.color)
      ? line
      : {
          ...line,
          color: GREY_COLOR,
        }
  );
};

interface VisualizationEngineProps {
  computeVisualizationSteps: (points: Point[]) => VisualizationStep[] | string;
  explanationsTitle: string;
  children: React.ReactNode;
  polygonMode?: boolean;
}

// A component to be used in every algorithm
export default function VisualizationEngine({
  computeVisualizationSteps,
  explanationsTitle,
  children,
  polygonMode,
}: VisualizationEngineProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<ILine[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [algorithmStarted, setAlgorithmStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [selectedRunMode, setSelectedRunMode] = useState<RunMode>(RunMode.Automatic);
  const [automaticRunInterval, setAutomaticRunInterval] = useState<number>();
  const [isPaused, setIsPaused] = useState(false);
  const [visualizationEnded, setVisualizationEnded] = useState(false);
  const [shouldResetCanvas, setShouldResetCanvas] = useState(false);
  const [snackbarErrorMessage, setSnackBarErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (algorithmStarted) {
      const visualizationPointsOrError = computeVisualizationSteps(points);
      if (typeof visualizationPointsOrError === 'string') {
        setSnackBarErrorMessage(visualizationPointsOrError);
        setVisualizationEnded(true);
      } else {
        setCurrentStepIndex(0);
        setSteps(computeVisualizationSteps(points) as VisualizationStep[]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmStarted]);

  useEffect(() => {
    if (currentStepIndex === null) {
      return;
    }

    if (currentStepIndex >= steps.length) {
      setVisualizationEnded(true);
      return;
    }

    const currentStep = steps[currentStepIndex!];
    if (currentStep.explanation) {
      setExplanations((explanations) => [...explanations, currentStep.explanation!]);
    }
    if (currentStep.graphicDrawingsStepList) {
      addStepDrawings(currentStep.graphicDrawingsStepList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex]);

  useEffect(() => {
    if (visualizationEnded) {
      clearInterval(automaticRunInterval);
    }
  }, [automaticRunInterval, visualizationEnded])

  const addStepDrawings = (drawings: Drawing[]) => {
    setPoints(clearPointsFromCanvas(points));
    setLines(clearLinesFromCanvas(lines));

    for (const drawing of drawings) {
      const { type, element, style, color, size } = drawing;

      switch (type) {
        case "updateConvexHullList": {
          convexHullUpdatedHandler(element as Point[]);
          break;
        }
        case "line": {
          let [startPoint, endPoint] = element as Point[];
          startPoint = convertPointBetweenAlgorithmAndCanvas(startPoint);
          endPoint = convertPointBetweenAlgorithmAndCanvas(endPoint);
          addLine(startPoint, endPoint, color!, style === "dash");
          break;
        }
        case "point": {
          const canvasPoint = convertPointBetweenAlgorithmAndCanvas(element as Point);
          updatePointStyle(canvasPoint, color!, size);
          break;
        }
        case "finalStep": {
          element.forEach((point: Point) => updatePointStyle(point, GREEN_COLOR));
          setLines(getLinesFromPoints(element, GREEN_COLOR));
          break;
        }
        default:
          break;
      }
    }
  };

  const addLine = (startPoint: Point, endPoint: Point, color: string, dash?: boolean) => {
    const newLine: ILine = {
      startPoint,
      endPoint,
      color: color!,
      ...(dash && { dash: defaultDash }),
    };
    setLines((prevLines) => [...prevLines, newLine]);
  };

  const updatePointStyle = (point: Point, color: string, size?: number) => {
    const newPoint = { ...point, color, size: size ?? DEFAULT_POINT_SIZE };
    setPoints((points) => {
      const pointIndex = points.findIndex((p) => p.label === point.label);
      const updatedPoints = [...points];
      updatedPoints[pointIndex] = newPoint;

      return updatedPoints;
    });
  };

  const convexHullUpdatedHandler = (newConvexHullPoints: Point[]) => {
    const canvasPoints = [];
    for (const point of newConvexHullPoints) {
      const canvasPoint = convertPointBetweenAlgorithmAndCanvas(point);
      canvasPoints.push(canvasPoint);
      updatePointStyle(canvasPoint, GREEN_COLOR);
    }

    setLines(getLinesFromPoints(canvasPoints, GREEN_COLOR));
  };

  const resetEverything = () => {
    setPoints([]);
    setLines([]);
    setCurrentStepIndex(null);
    setExplanations([]);
    setShouldResetCanvas(true);
    setVisualizationEnded(false);
    setAlgorithmStarted(false);
    setSnackBarErrorMessage(null);
    clearInterval(automaticRunInterval);
  };

  const startOrPauseAutomaticRun = () => {
    if (visualizationEnded) {
      resetEverything();
      return;
    }

    if (!algorithmStarted || isPaused) {
      setAlgorithmStarted(true);
      setIsPaused(false);
      setAutomaticRunInterval(
        setInterval(() => {
          setCurrentStepIndex((currIdx) => currIdx! + 1);
        }, 1000)
      );
      return;
    }

    setIsPaused(true);
    clearInterval(automaticRunInterval);
  };

  const startOrNextManualRun = () => {
    if (visualizationEnded) {
      resetEverything();
      return;
    }

    if (!algorithmStarted) {
      setAlgorithmStarted(true);
      return;
    }

    setCurrentStepIndex((currIdx) => currIdx! + 1);
  };

  const handleCloseErrorSnackbar = () => {
    setSnackBarErrorMessage('');
  }

  const snackBarAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseErrorSnackbar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const emptyCanvas = !points.length && !lines.length;

  return (
    <>
      <div className="canvas-wrapper">
        <Canvas
          points={points}
          setPoints={setPoints}
          lines={lines}
          setLines={setLines}
          polygonMode={polygonMode}
          shouldReset={shouldResetCanvas}
          onReset={() => setShouldResetCanvas(false)}
        />
      </div>
      <div className="explanations-wrapper">
        <Explanations explanations={explanations} algorithm={explanationsTitle} />
      </div>
      <div className="panel-wrapper">
        {children}
        <Menu menuButton={<Button content={selectedRunMode} dropdownBtn={true} />} transition>
          {Object.values(RunMode).map((runMode) => (
            <MenuItem
              key={runMode}
              className={runMode === selectedRunMode ? "active" : ""}
              onClick={() => setSelectedRunMode(runMode)}
            >
              {runMode}
            </MenuItem>
          ))}
        </Menu>
        {selectedRunMode === RunMode.Automatic ? (
          <Button
            onClick={() => startOrPauseAutomaticRun()}
            disabled={emptyCanvas}
            content={visualizationEnded ? "Reset" : !algorithmStarted || isPaused ? "Start" : "Pause"}
            extraClass="primary"
            tooltip="Mai intai adauga puncte"
            showTooltip={emptyCanvas}
          />
        ) : (
          <Button
            onClick={() => startOrNextManualRun()}
            disabled={emptyCanvas}
            content={visualizationEnded ? "Reset" : !algorithmStarted ? "Start" : "Next"}
            extraClass="primary"
            tooltip="Mai intai adauga puncte"
            showTooltip={emptyCanvas}
          />
        )}
      </div>
      <Snackbar
        className="error-snackbar"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={!!snackbarErrorMessage}
        onClose={handleCloseErrorSnackbar}
        message={snackbarErrorMessage}  
        action={snackBarAction}
        ClickAwayListenerProps={{ onClickAway: () => null }}
        transitionDuration={200}
      />
    </>
  );
}
