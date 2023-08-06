import "./Navbar.scss";

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <a href={`/`}>Logo</a>
        </li>
        <li>
          <a href={`/duality`}>Dualitate</a>
        </li>
        <li>
          <a href={`/convex-hull`}>Acoperire convexa</a>
        </li>
        <li>
          <a href={`/triangulation`}>Triangularea poligoanelor</a>
        </li>
        <li>
          <a href={`/trapezoidal-map`}>Harta trapezoidala</a>
        </li>
        <li>
          <a href={`/voronoi-diagram`}>Diagrama Voronoi</a>
        </li>
      </ul>
    </nav>
  );
}
