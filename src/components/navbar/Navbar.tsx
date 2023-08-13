import { useState } from "react";
import { NavLink } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import "./Navbar.scss";

export default function Navbar() {
  const [showAlgorithms, setShowAlgorithms] = useState(true);

  return (
    <nav>
      <div className="logo">
        <NavLink
          to={`/`}
          className={({ isActive, isPending }) =>
            isPending ? "pending" : isActive ? "active" : ""
          }
        >
          Logo
          <span>Home</span>
        </NavLink>
      </div>
      <ul className={showAlgorithms ? "flex" : "hidden"}>
        <li>
          <NavLink to={`/duality`}>Dualitate</NavLink>
        </li>
        <li>
          <NavLink to={`/convex-hull`}>Acoperire convexa</NavLink>
        </li>
        <li>
          <NavLink to={`/triangulation`}>Triangularea poligoanelor</NavLink>
        </li>
        <li>
          <NavLink to={`/trapezoidal-map`}>Harta trapezoidala</NavLink>
        </li>
        <li>
          <NavLink to={`/voronoi-diagram`}>Diagrama Voronoi</NavLink>
        </li>
      </ul>
      <div
        className="hamburger"
        onClick={() => setShowAlgorithms(!showAlgorithms)}
      >
        <RxHamburgerMenu />
      </div>
    </nav>
  );
}
