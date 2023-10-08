import { forwardRef } from "react";
import "./Button.scss";
import { AiFillCaretDown } from "react-icons/ai";

interface ButtonProps {
  content: string;
  onClick?: () => void;
  extraClass?: string;
  dropdownBtn?: boolean;
}

// forward ref added for @szhsin/react-menu menuButton
const Button = forwardRef(function Button(
  { onClick, content, extraClass, dropdownBtn }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`custom-button ${extraClass ?? ""} ${dropdownBtn ? "dropdown" : ""}`}
    >
      {content}
      {dropdownBtn && <AiFillCaretDown />}
    </button>
  );
});

export default Button;
