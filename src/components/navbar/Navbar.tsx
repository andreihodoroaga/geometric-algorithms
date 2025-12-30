import "./Navbar.scss";

import { useState } from "react";

import { RxHamburgerMenu } from "react-icons/rx";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../shared/i18n";
import LanguageToggle from "../language-toggle/LanguageToggle";

export default function Navbar() {
  const [showAlgorithms, setShowAlgorithms] = useState(false);
  const { t } = useLanguage();

  const hideAlgorithms = () => {
    setShowAlgorithms(false);
  };

  return (
    <nav>
      <div className="logo">
        <NavLink
          to={`/geometric-algorithms`}
          className={({ isActive, isPending }) => (isPending ? "pending" : isActive ? "active" : "")}
        >
          {t("home")}
        </NavLink>
      </div>
      <ul className={showAlgorithms ? "flex" : "hidden"}>
        <li>
          <NavLink to={`/geometric-algorithms/convex-hull`} onClick={hideAlgorithms}>
            {t("convexHull")}
          </NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/triangulation`} onClick={hideAlgorithms}>
            {t("triangulation")}
          </NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/duality`} onClick={hideAlgorithms}>
            {t("duality")}
          </NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/voronoi-diagram`} onClick={hideAlgorithms}>
            {t("voronoiDiagram")}
          </NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/trapezoidal-map`} onClick={hideAlgorithms}>
            {t("trapezoidalMap")}
          </NavLink>
        </li>
      </ul>
      <LanguageToggle />
      <div className="hamburger" onClick={() => setShowAlgorithms(!showAlgorithms)}>
        <RxHamburgerMenu />
      </div>
    </nav>
  );
}
