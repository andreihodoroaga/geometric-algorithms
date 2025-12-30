import { useLanguage } from "../../shared/i18n";
import "./LanguageToggle.scss";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle">
      <button
        className={`lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        aria-label="English"
      >
        EN
      </button>
      <span className="divider">|</span>
      <button
        className={`lang-btn ${language === "ro" ? "active" : ""}`}
        onClick={() => setLanguage("ro")}
        aria-label="Română"
      >
        RO
      </button>
    </div>
  );
}

