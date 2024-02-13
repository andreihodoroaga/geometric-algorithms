import { CanvasMode } from "../helpers";
import "./OverlayText.scss";

interface OverlayTextProps {
  generate: () => void;
  mode?: CanvasMode;
}

export default function OverlayText({ generate, mode }: OverlayTextProps) {
  return (
    <div className="overlay-text">
      <p className="text">
        <span className="action" onClick={() => generate()}>
          Genereaza {mode} aleator
        </span>{" "}
        <span className="static">sau click oriunde pentru a adauga un punct</span>
      </p>
    </div>
  );
}
