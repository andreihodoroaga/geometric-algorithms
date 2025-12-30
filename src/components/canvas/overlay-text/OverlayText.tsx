import { useLanguage } from "../../../shared/i18n";
import { CanvasMode } from "../helpers";
import "./OverlayText.scss";

interface OverlayTextProps {
  generate: () => void;
  mode?: CanvasMode;
}

const getModeTranslationKey = (mode?: CanvasMode) => {
  switch (mode) {
    case CanvasMode.points:
      return "points";
    case CanvasMode.xMonotonePolygon:
      return "xMonotonePolygon";
    case CanvasMode.yMonotonePolygon:
      return "yMonotonePolygon";
    case CanvasMode.segments:
      return "segments";
    default:
      return "points";
  }
};

export default function OverlayText({ generate, mode }: OverlayTextProps) {
  const { t } = useLanguage();
  const modeKey = getModeTranslationKey(mode);

  return (
    <div className="overlay-text">
      <p className="text">
        <span className="action" onClick={() => generate()}>
          {t("generateRandom", { mode: t(modeKey) })}
        </span>{" "}
        <span className="static">{t("orClickToAddPoint")}</span>
      </p>
    </div>
  );
}
