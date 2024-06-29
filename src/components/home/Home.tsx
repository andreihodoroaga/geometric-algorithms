import { NavLink } from "react-router-dom";
import "./Home.scss";

export default function Home() {
  return (
    <div className="home-container">
      <h1>Aplicatie de vizualizat algoritmi geometrici</h1>
      <p>
        Această aplicație este concepută pentru a ajuta la vizualizarea algoritmilor geometrici fundamentali, cum ar fi
        determinarea acoperirii convexe, triangularea unui poligon monoton sau diagrama Voronoi.
      </p>
      <p className="buttons-heading">Alege un algoritm pe care vrei sa il explorezi:</p>
      <div className="button-container">
        <NavLink to="convex-hull" className="nav-button">
          Acoperire convexa
        </NavLink>
        <NavLink to="triangulation" className="nav-button">
          Triangulare
        </NavLink>
        <NavLink to="duality" className="nav-button">
          Dualitate
        </NavLink>
        <NavLink to="voronoi-diagram" className="nav-button">
          Diagram Voronoi
        </NavLink>
        <NavLink to="trapezoidal-map" className="nav-button">
          Harta trapezoidala
        </NavLink>
      </div>
    </div>
  );
}
