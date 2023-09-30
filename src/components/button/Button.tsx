import "./Button.scss";
import { AiFillCaretDown } from "react-icons/ai";

interface ButtonProps {
  onClick: () => Promise<void>;
  content: string;
  extraClass?: string;
  dropdownBtn?: boolean;
}

export default function Button({ onClick, content, extraClass, dropdownBtn }: ButtonProps) {
  return (
    <button onClick={onClick} className={`custom-button ${extraClass ?? ""} ${dropdownBtn ? "dropdown" : ""}`}>
      {content}
      {dropdownBtn && <AiFillCaretDown />}
    </button>
  );
}
