import { useEffect, useRef } from "react";
import "./Explanations.scss";

interface ExplanationsProps {
  explanations: string[];
}

export default function Explanations({ explanations }: ExplanationsProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // https://dev.to/forksofpower/autoscrolling-lists-with-react-hooks-10o7
    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
    scrollToBottom();
  }, [explanations]);

  return (
    <div className="explanations-container">
      <h2 className="explanations-title">Pasi executie algoritm</h2>
      <div className="explanation-list">
        {explanations.map((explanation, idx) => (
          <p key={idx} className={`explanation ${idx === explanations.length - 1 ? "last" : ""}`}>
            {idx + 1}. {explanation}
          </p>
        ))}
        <div ref={bottomRef} className="explanation-list-bottom"></div>
      </div>
    </div>
  );
}
