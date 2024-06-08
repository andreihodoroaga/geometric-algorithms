import { ComponentType, useEffect, useState } from "react";
import {
  DEFAULT_POINT_SIZE,
  ICircle,
  ILine,
  IParabola,
  Point,
  TrapezoidDrawing,
  convertPointBetweenAlgorithmAndCanvas,
  convertSimplePointBetweenAlgorithmAndCanvas,
  defaultDash,
} from "../../shared/models/geometry";
import { Drawing, VisualizationStep } from "../../shared/models/algorithm";
import { GREEN_COLOR, GREY_COLOR, getLinesFromPoints } from "../../shared/util";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import { default as CustomButton } from "../button/Button";
import { Menu, MenuItem } from "@szhsin/react-menu";
import Snackbar from "@mui/material/Snackbar";
import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import Button from "@mui/material/Button";
import { Tooltip } from "react-tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const SPEED_CONTROL_LS_KEY = "speedControl";

const ALGORITHM_NOT_ENDED_LABEL = "Algoritmul nu e inca finalizat";
const RESET_VIZUALIZATION = "Reporneste vizualizarea";
const RUNNING_ALGORITHM_LABEL = "Algoritmul e in desfasurare";

enum RunMode {
  Automatic = "Automat",
  Manual = "Manual",
}

// at each step only the green points should remain
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

export interface ExplanationsExtraProps {
  steps: VisualizationStep[];
  currentStepIndex: number | null;
}

interface VisualizationEngineProps {
  computeVisualizationSteps: (points: Point[], canvasDimensions: CanvasDimensions) => VisualizationStep[] | string;
  explanationsTitle: string;
  mode: CanvasMode;
  children?: React.ReactNode;
  showSpeedControl?: boolean;
  minAlgorithmSpeedInMs?: number;
  speedUpdateStep?: number;
  ExplanationsExtra?: ComponentType<ExplanationsExtraProps>;
}

interface VisualizationConfiguration {
  points: Point[];
  lines: ILine[];
}

// A component to be used in every algorithm
export default function VisualizationEngine({
  computeVisualizationSteps,
  explanationsTitle,
  mode,
  children,
  showSpeedControl,
  ExplanationsExtra,
  minAlgorithmSpeedInMs = 25,
  speedUpdateStep = 125,
}: VisualizationEngineProps) {
  const speedRangeMin = 0;
  const speedRangeMax = 10;

  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<ILine[]>([]);
  const [parabolas, setParabolas] = useState<IParabola[]>([]);
  const [circles, setCircles] = useState<ICircle[]>([]);
  const [trapezoids, setTrapezoids] = useState<TrapezoidDrawing[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [algorithmStarted, setAlgorithmStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [selectedRunMode, setSelectedRunMode] = useState<RunMode>(RunMode.Automatic);
  const [automaticRunInterval, setAutomaticRunInterval] = useState<NodeJS.Timeout>();
  const [isPaused, setIsPaused] = useState(false);
  const [visualizationEnded, setVisualizationEnded] = useState(false);
  const [shouldResetCanvas, setShouldResetCanvas] = useState(false);
  const [snackbarErrorMessage, setSnackBarErrorMessage] = useState<string | null>(null);
  const [speedControlValue, setSpeedControlValue] = useState(
    localStorage.getItem(SPEED_CONTROL_LS_KEY)
      ? parseInt(localStorage.getItem(SPEED_CONTROL_LS_KEY)!)
      : speedRangeMax / 2
  );
  const [debouncedSpeedControlValue, setDebouncedSpeedControlValue] = useState(speedControlValue);
  const [canvasDimensions, setCanvasDimensions] = useState<CanvasDimensions>({
    width: 0,
    height: 0,
  });
  const [savedConfiguration, setSavedConfiguration] = useState<VisualizationConfiguration | null>(null);

  useEffect(() => {
    if (algorithmStarted) {
      const visualizationPointsOrError = computeVisualizationSteps(points, canvasDimensions);
      if (typeof visualizationPointsOrError === "string") {
        setSnackBarErrorMessage(visualizationPointsOrError);
        setVisualizationEnded(true);
      } else {
        setCurrentStepIndex(0);
        setSteps(visualizationPointsOrError as VisualizationStep[]);
        setSavedConfiguration({ points, lines });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmStarted]);

  useEffect(() => {
    if (currentStepIndex === null) {
      return;
    }

    if (currentStepIndex >= steps.length) {
      setAlgorithmStarted(false);
      setVisualizationEnded(true);
      return;
    }

    const currentStep = steps[currentStepIndex!];
    if (currentStep.explanation) {
      setExplanations((explanations) => [...explanations, currentStep.explanation!]);
    }
    if (currentStep.explanations) {
      setExplanations((explanations) => [...explanations, ...currentStep.explanations!]);
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
  }, [automaticRunInterval, visualizationEnded]);

  // have to debounce speedControlValue because it creates a new setInterval every time it is updated
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSpeedControlValue(speedControlValue);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [speedControlValue]);

  useEffect(() => {
    if (selectedRunMode !== RunMode.Automatic) {
      return;
    }

    if (algorithmStarted && !isPaused) {
      clearInterval(automaticRunInterval);
      const speedStepsToAdd = speedRangeMax - debouncedSpeedControlValue;
      setAutomaticRunInterval(
        setInterval(() => {
          setCurrentStepIndex((currIdx) => currIdx! + 1);
        }, minAlgorithmSpeedInMs + speedUpdateStep * speedStepsToAdd)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmStarted, isPaused, selectedRunMode, debouncedSpeedControlValue]);

  const addStepDrawings = (drawings: Drawing[]) => {
    for (const drawing of drawings) {
      const { type, element, style, color, size } = drawing;

      switch (type) {
        case "updateState": {
          setLines([]);
          setParabolas([]);
          setCircles([]);
          setTrapezoids([]);
          break;
        }
        case "updateConvexHullList": {
          setPoints((points) => clearPointsFromCanvas(points));
          convexHullUpdatedHandler(element as Point[]);
          break;
        }
        case "line": {
          handleLineStep(element, color!, style);
          break;
        }
        case "segments": {
          for (const segment of element as Point[][]) {
            handleLineStep(segment, color!, style);
          }
          break;
        }
        case "trapezoid": {
          setTrapezoids((oldTrapezoids) => {
            return [...oldTrapezoids, element as TrapezoidDrawing];
          });
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
        case "parabola": {
          let { startPoint, endPoint, controlPoint } = element as IParabola;
          startPoint = convertSimplePointBetweenAlgorithmAndCanvas(startPoint);
          endPoint = convertSimplePointBetweenAlgorithmAndCanvas(endPoint);
          controlPoint = convertSimplePointBetweenAlgorithmAndCanvas(controlPoint);

          setParabolas((oldParabolas) => [
            ...oldParabolas,
            { startPoint, endPoint, controlPoint, color: element.color },
          ]);
          break;
        }
        case "circle": {
          const circle = element as ICircle;
          const circleForCanvas = {
            center: convertSimplePointBetweenAlgorithmAndCanvas(circle.center),
            radius: circle.radius,
          };
          setCircles((oldCircles) => [...oldCircles, circleForCanvas]);
          break;
        }
        default:
          break;
      }
    }
  };

  const handleLineStep = (element: Point[], color: string, style?: string) => {
    let [startPoint, endPoint] = element as Point[];
    startPoint = convertPointBetweenAlgorithmAndCanvas(startPoint);
    endPoint = convertPointBetweenAlgorithmAndCanvas(endPoint);
    addLine(startPoint, endPoint, color, style === "dash");
  };

  const addLine = (startPoint: Point, endPoint: Point, color: string, dash?: boolean) => {
    const newLine: ILine = {
      startPoint,
      endPoint,
      color,
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

  const restartAnimation = () => {
    if (!savedConfiguration) {
      return;
    }

    setVisualizationEnded(false);
    setExplanations([]);
    setPoints(savedConfiguration.points);
    setLines(savedConfiguration.lines);

    if (selectedRunMode === RunMode.Automatic) {
      startOrPauseAutomaticRun();
    } else {
      startOrNextManualRun();
    }
    setSavedConfiguration(null);
  };

  const resetEverything = () => {
    setPoints([]);
    setLines([]);
    setCircles([]);
    setParabolas([]);
    setTrapezoids([]);
    setCurrentStepIndex(null);
    setExplanations([]);
    setShouldResetCanvas(true);
    setVisualizationEnded(false);
    setAlgorithmStarted(false);
    setSnackBarErrorMessage(null);
    clearInterval(automaticRunInterval);
  };

  const startOrPauseAutomaticRun = () => {
    if (!algorithmStarted || isPaused) {
      setAlgorithmStarted(true);
      setIsPaused(false);
      return;
    }

    setIsPaused(true);
    clearInterval(automaticRunInterval);
  };

  const startOrNextManualRun = () => {
    if (!algorithmStarted) {
      setAlgorithmStarted(true);
      return;
    }

    setCurrentStepIndex((currIdx) => currIdx! + 1);
  };

  const updateSpeedControlValue = (newValue: number) => {
    setSpeedControlValue(newValue);
    localStorage.setItem(SPEED_CONTROL_LS_KEY, newValue.toString());
  };

  const handleCloseErrorSnackbar = () => {
    setSnackBarErrorMessage("");
  };

  const snackBarAction = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseErrorSnackbar}>
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
          canvasDimensions={canvasDimensions}
          setCanvasDimensions={setCanvasDimensions}
          parabolas={parabolas}
          circles={circles}
          trapezoids={trapezoids}
          mode={mode}
          shouldReset={shouldResetCanvas}
          onReset={() => setShouldResetCanvas(false)}
          disabled={algorithmStarted}
        />
      </div>
      <div className="explanations-wrapper">
        <Explanations explanations={explanations} algorithm={explanationsTitle} />
      </div>
      <div className="panel-wrapper">
        {children}
        <Menu
          menuButton={
            <CustomButton
              content={selectedRunMode}
              dropdownBtn={true}
              tooltip={!algorithmStarted ? "Mod executie" : RUNNING_ALGORITHM_LABEL}
              showTooltip={true}
              disabled={algorithmStarted}
            />
          }
          transition
        >
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
          <CustomButton
            onClick={() => startOrPauseAutomaticRun()}
            disabled={emptyCanvas || visualizationEnded}
            content={visualizationEnded ? "Finalizat" : !algorithmStarted || isPaused ? "Start" : "Pause"}
            extraClass="primary"
            tooltip="Mai intai adauga puncte"
            showTooltip={emptyCanvas}
          />
        ) : (
          <CustomButton
            onClick={() => startOrNextManualRun()}
            disabled={emptyCanvas || visualizationEnded}
            content={visualizationEnded ? "Finalizat" : !algorithmStarted ? "Start" : "Next"}
            extraClass="primary"
            tooltip="Mai intai adauga puncte"
            showTooltip={emptyCanvas}
          />
        )}
      </div>
      {showSpeedControl ?? (
        <div className="controls">
          <div className="slider speed-slider">
            <label>
              Viteza:
              <input
                type="range"
                value={speedControlValue}
                min={speedRangeMin}
                max={speedRangeMax}
                onChange={(e) => updateSpeedControlValue(+e.target.value)}
              />
            </label>
          </div>

          <div className="right-buttons">
            <div
              className="control-button green"
              data-tooltip-id="reset-animation-btn-tooltip"
              data-tooltip-content={visualizationEnded ? RESET_VIZUALIZATION : ALGORITHM_NOT_ENDED_LABEL}
              data-tooltip-place="top"
            >
              <Button
                variant="text"
                endIcon={<RestartAltIcon />}
                color="inherit"
                onClick={restartAnimation}
                disabled={!visualizationEnded}
              >
                Replay
              </Button>
              <Tooltip id="reset-animation-btn-tooltip" />
            </div>

            <div className="control-button red">
              <Button
                variant="text"
                endIcon={<DeleteOutlineIcon />}
                color="inherit"
                onClick={resetEverything}
                disabled={emptyCanvas}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="explanations-extra">
        {!visualizationEnded && ExplanationsExtra && (
          <ExplanationsExtra steps={steps} currentStepIndex={currentStepIndex} />
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
