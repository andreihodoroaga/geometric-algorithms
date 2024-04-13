import "./Navbar.scss";

import { useState } from "react";

import { RxHamburgerMenu } from "react-icons/rx";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [showAlgorithms, setShowAlgorithms] = useState(true);

  return (
    <nav>
      <div className="logo">
        <NavLink
          to={`/geometric-algorithms`}
          className={({ isActive, isPending }) => (isPending ? "pending" : isActive ? "active" : "")}
        >
          Home
        </NavLink>
      </div>
      <ul className={showAlgorithms ? "flex" : "hidden"}>
        <li>
          <NavLink to={`/geometric-algorithms/convex-hull`}>Acoperire convexa</NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/triangulation`}>Triangularea poligoanelor</NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/duality`}>Dualitate</NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/trapezoidal-map`}>Harta trapezoidala</NavLink>
        </li>
        <li>
          <NavLink to={`/geometric-algorithms/voronoi-diagram`}>Diagrama Voronoi</NavLink>
        </li>
      </ul>
      <div className="hamburger" onClick={() => setShowAlgorithms(!showAlgorithms)}>
        <RxHamburgerMenu />
      </div>
    </nav>
  );
}
