import { NavLink } from "react-router-dom";
import { useLanguage } from "../../shared/i18n";
import "./Home.scss";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="home-container">
      <h1>{t("homeTitle")}</h1>
      <p>{t("homeDescription")}</p>
      <p className="buttons-heading">{t("homeChooseAlgorithm")}</p>
      <div className="button-container">
        <NavLink to="convex-hull" className="nav-button">
          {t("convexHull")}
        </NavLink>
        <NavLink to="triangulation" className="nav-button">
          {t("triangulation")}
        </NavLink>
        <NavLink to="duality" className="nav-button">
          {t("duality")}
        </NavLink>
        <NavLink to="voronoi-diagram" className="nav-button">
          {t("voronoiDiagram")}
        </NavLink>
        <NavLink to="trapezoidal-map" className="nav-button">
          {t("trapezoidalMap")}
        </NavLink>
      </div>
    </div>
  );
}
