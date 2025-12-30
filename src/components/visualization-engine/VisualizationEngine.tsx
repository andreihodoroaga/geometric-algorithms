import { ComponentType, useEffect, useState } from "react";
import {
  ICircle,
  ILine,
  IParabola,
  Point,
  TrapezoidForCanvas,
  convertPointBetweenAlgorithmAndCanvas,
  convertSimplePointBetweenAlgorithmAndCanvas,
  defaultDash,
} from "../../shared/models/geometry";
import { Drawing, PointSizeMap, VisualizationStep } from "../../shared/models/algorithm";
import Canvas from "../canvas/Canvas";
import Explanations from "../explanations/Explanations";
import { default as CustomButton } from "../button/Button";
import { Menu, MenuItem } from "@szhsin/react-menu";
import React from "react";
import { CanvasDimensions, CanvasMode } from "../canvas/helpers";
import Button from "@mui/material/Button";
import { Tooltip } from "react-tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useLanguage } from "../../shared/i18n";

const SPEED_CONTROL_LS_KEY = "speedControl";

export interface ExplanationsExtraProps {
  steps: VisualizationStep[];
  currentStepIndex: number | null;
}

interface VisualizationEngineProps {
  computeVisualizationSteps: (points: Point[], canvasDimensions: CanvasDimensions) => VisualizationStep[];
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
  const { t, language } = useLanguage();

  const runModes = {
    automatic: t("automatic"),
    manual: t("manual"),
  };

  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<ILine[]>([]);
  const [parabolas, setParabolas] = useState<IParabola[]>([]);
  const [circles, setCircles] = useState<ICircle[]>([]);
  const [trapezoids, setTrapezoids] = useState<TrapezoidForCanvas[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [algorithmStarted, setAlgorithmStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [selectedRunMode, setSelectedRunMode] = useState<string>(runModes.automatic);
  const [automaticRunInterval, setAutomaticRunInterval] = useState<NodeJS.Timeout>();
  const [isPaused, setIsPaused] = useState(false);
  const [visualizationEnded, setVisualizationEnded] = useState(false);
  const [shouldResetCanvas, setShouldResetCanvas] = useState(false);
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

  // Update run mode label when language changes
  useEffect(() => {
    if (selectedRunMode === t("automatic") || selectedRunMode === t("manual")) {
      return;
    }
    // If current selection doesn't match translated values, update it
    setSelectedRunMode(t("automatic"));
  }, [language, t, selectedRunMode]);

  useEffect(() => {
    if (algorithmStarted) {
      setSteps(computeVisualizationSteps(points, canvasDimensions));
      setCurrentStepIndex(0);
      setSavedConfiguration({ points, lines });
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
    const isAutomatic = selectedRunMode === t("automatic");
    if (!isAutomatic) {
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
  }, [algorithmStarted, isPaused, selectedRunMode, debouncedSpeedControlValue, language]);

  const addStepDrawings = (drawings: Drawing[]) => {
    for (const drawing of drawings) {
      const { type, element } = drawing;

      switch (type) {
        case "clearCanvas": {
          setLines([]);
          setParabolas([]);
          setCircles([]);
          setTrapezoids([]);
          break;
        }
        case "line": {
          handleLineStep(element, drawing.style);
          break;
        }
        case "lines": {
          for (const line of element) {
            handleLineStep(line);
          }
          break;
        }
        case "trapezoid": {
          setTrapezoids((oldTrapezoids) => {
            return [...oldTrapezoids, element];
          });
          break;
        }
        case "point": {
          const canvasPoint = convertPointBetweenAlgorithmAndCanvas(element);
          updatePointStyle(canvasPoint, drawing.color!, drawing.size);
          break;
        }
        case "parabola": {
          let { startPoint, endPoint, controlPoint } = element;
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
          const circleForCanvas = {
            center: convertSimplePointBetweenAlgorithmAndCanvas(element.center),
            radius: element.radius,
          };
          setCircles((oldCircles) => [...oldCircles, circleForCanvas]);
          break;
        }
        default:
          break;
      }
    }
  };

  const handleLineStep = (element: ILine, style?: string) => {
    let { startPoint, endPoint } = element;
    startPoint = convertPointBetweenAlgorithmAndCanvas(startPoint);
    endPoint = convertPointBetweenAlgorithmAndCanvas(endPoint);
    addLine(startPoint, endPoint, element.color, style === "dash");
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
    const newPoint = { ...point, color, size: size ?? PointSizeMap.Normal };
    setPoints((points) => {
      const pointIndex = points.findIndex((p) => p.label === point.label);
      const updatedPoints = [...points];
      updatedPoints[pointIndex] = newPoint;

      return updatedPoints;
    });
  };

  const restartAnimation = () => {
    if (!savedConfiguration) {
      return;
    }

    setVisualizationEnded(false);
    setExplanations([]);
    setPoints(savedConfiguration.points);
    setLines(savedConfiguration.lines);

    if (selectedRunMode === t("automatic")) {
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

  const emptyCanvas = !points.length && !lines.length;
  const isAutomatic = selectedRunMode === t("automatic");

  const getButtonContent = () => {
    if (visualizationEnded) return t("finished");
    if (!algorithmStarted || isPaused) return t("start");
    return isAutomatic ? t("pause") : t("next");
  };

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
              tooltip={!algorithmStarted ? t("executionMode") : t("runningAlgorithm")}
              showTooltip={true}
              disabled={algorithmStarted}
            />
          }
          transition
        >
          {Object.values(runModes).map((runMode) => (
            <MenuItem
              key={runMode}
              className={runMode === selectedRunMode ? "active" : ""}
              onClick={() => setSelectedRunMode(runMode)}
            >
              {runMode}
            </MenuItem>
          ))}
        </Menu>
        {isAutomatic ? (
          <CustomButton
            onClick={() => startOrPauseAutomaticRun()}
            disabled={emptyCanvas || visualizationEnded}
            content={getButtonContent()}
            extraClass="primary"
            tooltip={t("addPointsFirst")}
            showTooltip={emptyCanvas}
          />
        ) : (
          <CustomButton
            onClick={() => startOrNextManualRun()}
            disabled={emptyCanvas || visualizationEnded}
            content={visualizationEnded ? t("finished") : !algorithmStarted ? t("start") : t("next")}
            extraClass="primary"
            tooltip={t("addPointsFirst")}
            showTooltip={emptyCanvas}
          />
        )}
      </div>
      {showSpeedControl ?? (
        <div className="controls">
          <div className="slider speed-slider">
            <label>
              {t("speed")}
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
              data-tooltip-content={visualizationEnded ? t("resetVisualization") : t("algorithmNotEnded")}
              data-tooltip-place="top"
            >
              <Button
                variant="text"
                endIcon={<RestartAltIcon />}
                color="inherit"
                onClick={restartAnimation}
                disabled={!visualizationEnded}
              >
                {t("replay")}
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
                {t("clear")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="explanations-extra">
        {ExplanationsExtra && <ExplanationsExtra steps={steps} currentStepIndex={currentStepIndex} />}
      </div>
    </>
  );
}
