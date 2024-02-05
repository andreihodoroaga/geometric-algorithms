import { forwardRef } from "react";
import "./Button.scss";
import { AiFillCaretDown } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

interface ButtonProps {
  content: string;
  onClick?: () => void;
  extraClass?: string;
  dropdownBtn?: boolean;
  disabled?: boolean;
  tooltip?: string;
  showTooltip?: boolean;
}

// forward ref added for @szhsin/react-menu menuButton
const Button = forwardRef(function Button(
  { onClick, content, extraClass, dropdownBtn, disabled, tooltip, showTooltip }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <>
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={`custom-button ${extraClass ?? ""} ${dropdownBtn ? "dropdown" : ""} ${disabled ? "disabled" : ""}`}
        data-tooltip-id="btn-tooltip"
        data-tooltip-content={tooltip}
        data-tooltip-place="top"
        data-tooltip-hidden={!showTooltip}
      >
        {content}
        {dropdownBtn && <AiFillCaretDown />}
      </button>
      <Tooltip id="btn-tooltip"/>
    </>
  );
});

export default Button;
