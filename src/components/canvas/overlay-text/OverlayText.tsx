import "./OverlayText.scss";

interface OverlayTextProps {
  generateRandomPoints: () => void;
  polygonMode?: boolean;
}

export default function OverlayText({
  generateRandomPoints,
  polygonMode,
}: OverlayTextProps) {
  return (
    <div className="overlay-text">
      <p className="text">
        <span className="action" onClick={() => generateRandomPoints()}>
          Genereaza {polygonMode ? "poligon" : "puncte"} aleator
        </span>{" "}
        <span className="static">
          sau click oriunde pentru a adauga un punct
        </span>
      </p>
    </div>
  );
}
