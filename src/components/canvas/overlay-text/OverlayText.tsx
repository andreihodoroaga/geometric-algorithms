import "./OverlayText.scss";

interface OverlayTextProps {
  generate: () => void;
  polygonMode?: boolean;
}

export default function OverlayText({
  generate,
  polygonMode,
}: OverlayTextProps) {
  return (
    <div className="overlay-text">
      <p className="text">
        <span className="action" onClick={() => generate()}>
          Genereaza {polygonMode ? "poligon" : "puncte"} aleator
        </span>{" "}
        <span className="static">
          sau click oriunde pentru a adauga un punct
        </span>
      </p>
    </div>
  );
}
