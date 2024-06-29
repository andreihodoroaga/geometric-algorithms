import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Duality from "./components/duality/Duality.tsx";
import ConvexHull from "./components/convex-hull/ConvexHull.tsx";
import Triangulation from "./components/triangulation/Triangulation.tsx";
import TrapezoidalMap from "./components/trapezoidal-map/TrapezoidalMap.tsx";
import VoronoiDiagram from "./components/voronoi-diagram/VoronoiDiagram.tsx";
import "./index.scss";

const router = createBrowserRouter([
  {
    path: "/geometric-algorithms",
    element: <App />,
    children: [
      {
        path: "/geometric-algorithms/convex-hull",
        element: <ConvexHull />,
      },
      {
        path: "/geometric-algorithms/triangulation",
        element: <Triangulation />,
      },
      {
        path: "/geometric-algorithms/duality",
        element: <Duality />,
      },
      {
        path: "/geometric-algorithms/voronoi-diagram",
        element: <VoronoiDiagram />,
      },
      {
        path: "/geometric-algorithms/trapezoidal-map",
        element: <TrapezoidalMap />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
