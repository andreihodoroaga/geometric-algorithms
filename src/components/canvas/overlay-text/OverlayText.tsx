import "./OverlayText.scss";

interface OverlayTextProps {
  generateRandomPoints: () => void;
}

export default function OverlayText({
  generateRandomPoints,
}: OverlayTextProps) {
  return (
    <div className="overlay-text">
      <p className="text">
        <span className="action" onClick={() => generateRandomPoints()}>
          Genereaza puncte aleator
        </span>{" "}
        <span className="static">
          sau click oriunde pentru a adauga un punct
        </span>
      </p>
    </div>
  );
}
