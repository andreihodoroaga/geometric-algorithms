import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Duality from "./components/duality/Duality.tsx";
import ConvexHull from "./components/convex-hull/ConvexHull.tsx";
import Triangulation from "./components/triangulation/Triangulation.tsx";
import TrapezoidalMap from "./components/trapezoidal-map/TrapezoidalMap.tsx";
import VoronoiDiagram from "./components/voronoi-diagram/VoronoiDiagram.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "duality",
        element: <Duality />,
      },
      {
        path: "convex-hull",
        element: <ConvexHull />,
      },
      {
        path: "triangulation",
        element: <Triangulation />,
      },
      {
        path: "trapezoidal-map",
        element: <TrapezoidalMap />,
      },
      {
        path: "voronoi-diagram",
        element: <VoronoiDiagram />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
