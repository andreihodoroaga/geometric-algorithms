import { Point } from "../../shared/models/geometry";
import { computeTriangulationSteps } from "./triangulation-algorithm";

const generateMockPoints = (size: number) => {
  const mockPoints: Point[] = [];

  for (let i = 0; i < size; i++) {
    const mockPoint: Point = {
      x: Math.random() * 100,
      y: Math.random() * 100,
      label: `Point ${i + 1}`,
      color: "blue",
    };

    mockPoints.push(mockPoint);
  }

  return mockPoints;
};

describe("Triangulation algorithm", () => {
  it("should have only one step if the polygon is a triangle", () => {
    const points = generateMockPoints(3);
    const visualizationSteps = computeTriangulationSteps(points);
    expect(visualizationSteps.length).toBe(1);
  });

  it("should give the same steps as before", () => {
    const points = [
      {
        x: 272,
        y: -28,
        label: "A",
        color: "#666",
      },
      {
        x: 130,
        y: -196.2,
        label: "B",
        color: "#666",
      },
      {
        x: 91,
        y: -341.4,
        label: "C",
        color: "#666",
      },
      {
        x: 225,
        y: -411.5,
        label: "D",
        color: "#666",
      },
      {
        x: 153,
        y: -461.59999999999997,
        label: "E",
        color: "#666",
      },
      {
        x: 192,
        y: -589.6999999999999,
        label: "F",
        color: "#666",
      },
      {
        x: 280,
        y: -635.8,
        label: "G",
        color: "#666",
      },
      {
        x: 226,
        y: -703.9,
        label: "H",
        color: "#666",
      },
      {
        x: 404.03125,
        y: -709.9,
        label: "I",
        color: "#666",
      },
      {
        x: 461.03125,
        y: -617.8,
        label: "J",
        color: "#666",
      },
      {
        x: 404.03125,
        y: -560.6999999999999,
        label: "K",
        color: "#666",
      },
      {
        x: 297.03125,
        y: -530.5999999999999,
        label: "L",
        color: "#666",
      },
      {
        x: 386.03125,
        y: -394.5,
        label: "M",
        color: "#666",
      },
      {
        x: 387.03125,
        y: -379.4,
        label: "N",
        color: "#666",
      },
      {
        x: 465.03125,
        y: -172.2,
        label: "O",
        color: "#666",
      },
      {
        x: 437.03125,
        y: -134.1,
        label: "P",
        color: "#666",
      },
    ];
    const visualizationSteps = computeTriangulationSteps(points);
    expect(visualizationSteps).toEqual([
      {
        explanation:
          "Varfurile se ordoneaza descrescător după y (dacă ordinea este egală, se folosește abscisa): A, P, O, B, C, N, M, D, E, L, K, F, J, G, H, I",
      },
      {
        explanation: "Se initializeaza stiva cu primele 2 varfuri. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 272,
              y: -28,
              label: "A",
              color: "#666",
            },
            color: "green",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 437.03125,
              y: -134.1,
              label: "P",
              color: "#666",
            },
            color: "green",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, O, si punctul din varful stivei, P, sunt in acelasi lant. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 437.03125,
              y: -134.1,
              label: "P",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage un varf din stiva. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 437.03125,
              y: -134.1,
              label: "P",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage varful A din stiva pentru ca formeaza cu O diagonala interioara poligonului. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
              {
                x: 272,
                y: -28,
                label: "A",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
              {
                x: 272,
                y: -28,
                label: "A",
                color: "#666",
              },
            ],
            color: "#52ab98",
          },
          {
            type: "point",
            element: {
              x: 272,
              y: -28,
              label: "A",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva ultimul varf extras, A si varful curent O. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 272,
              y: -28,
              label: "A",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 272,
              y: -28,
              label: "A",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, B, si punctul din varful stivei, O, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 130,
                y: -196.2,
                label: "B",
                color: "#666",
              },
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 130,
                y: -196.2,
                label: "B",
                color: "#666",
              },
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 130,
              y: -196.2,
              label: "B",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful O si se adauga noua diagonala: BO. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 130,
                y: -196.2,
                label: "B",
                color: "#666",
              },
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 130,
                y: -196.2,
                label: "B",
                color: "#666",
              },
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 130,
              y: -196.2,
              label: "B",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful A, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 272,
              y: -28,
              label: "A",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, O si varful curent B. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 130,
              y: -196.2,
              label: "B",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 130,
              y: -196.2,
              label: "B",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, C, si punctul din varful stivei, B, sunt in acelasi lant. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 130,
              y: -196.2,
              label: "B",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage un varf din stiva. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 130,
              y: -196.2,
              label: "B",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage varful O din stiva pentru ca formeaza cu C diagonala interioara poligonului. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
              {
                x: 465.03125,
                y: -172.2,
                label: "O",
                color: "#666",
              },
            ],
            color: "#52ab98",
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva ultimul varf extras, O si varful curent C. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, N, si punctul din varful stivei, C, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 387.03125,
                y: -379.4,
                label: "N",
                color: "#666",
              },
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 387.03125,
                y: -379.4,
                label: "N",
                color: "#666",
              },
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 387.03125,
              y: -379.4,
              label: "N",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful C si se adauga noua diagonala: NC. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 387.03125,
                y: -379.4,
                label: "N",
                color: "#666",
              },
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 387.03125,
                y: -379.4,
                label: "N",
                color: "#666",
              },
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 387.03125,
              y: -379.4,
              label: "N",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful O, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 465.03125,
              y: -172.2,
              label: "O",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, C si varful curent N. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 387.03125,
              y: -379.4,
              label: "N",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 387.03125,
              y: -379.4,
              label: "N",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, M, si punctul din varful stivei, N, sunt in acelasi lant. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 387.03125,
              y: -379.4,
              label: "N",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage un varf din stiva. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 387.03125,
              y: -379.4,
              label: "N",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage varful C din stiva pentru ca formeaza cu M diagonala interioara poligonului. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
              {
                x: 91,
                y: -341.4,
                label: "C",
                color: "#666",
              },
            ],
            color: "#52ab98",
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva ultimul varf extras, C si varful curent M. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, D, si punctul din varful stivei, M, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 225,
                y: -411.5,
                label: "D",
                color: "#666",
              },
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 225,
                y: -411.5,
                label: "D",
                color: "#666",
              },
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 225,
              y: -411.5,
              label: "D",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful M si se adauga noua diagonala: DM. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 225,
                y: -411.5,
                label: "D",
                color: "#666",
              },
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 225,
                y: -411.5,
                label: "D",
                color: "#666",
              },
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 225,
              y: -411.5,
              label: "D",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful C, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 91,
              y: -341.4,
              label: "C",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, M si varful curent D. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 225,
              y: -411.5,
              label: "D",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 225,
              y: -411.5,
              label: "D",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, E, si punctul din varful stivei, D, sunt in acelasi lant. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 225,
              y: -411.5,
              label: "D",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage un varf din stiva. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 225,
              y: -411.5,
              label: "D",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage varful M din stiva pentru ca formeaza cu E diagonala interioara poligonului. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 153,
                y: -461.59999999999997,
                label: "E",
                color: "#666",
              },
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 153,
                y: -461.59999999999997,
                label: "E",
                color: "#666",
              },
              {
                x: 386.03125,
                y: -394.5,
                label: "M",
                color: "#666",
              },
            ],
            color: "#52ab98",
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva ultimul varf extras, M si varful curent E. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, L, si punctul din varful stivei, E, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 297.03125,
                y: -530.5999999999999,
                label: "L",
                color: "#666",
              },
              {
                x: 153,
                y: -461.59999999999997,
                label: "E",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 297.03125,
                y: -530.5999999999999,
                label: "L",
                color: "#666",
              },
              {
                x: 153,
                y: -461.59999999999997,
                label: "E",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful E si se adauga noua diagonala: LE. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 297.03125,
                y: -530.5999999999999,
                label: "L",
                color: "#666",
              },
              {
                x: 153,
                y: -461.59999999999997,
                label: "E",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 297.03125,
                y: -530.5999999999999,
                label: "L",
                color: "#666",
              },
              {
                x: 153,
                y: -461.59999999999997,
                label: "E",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful M, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 386.03125,
              y: -394.5,
              label: "M",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, E si varful curent L. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, K, si punctul din varful stivei, L, sunt in acelasi lant. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage un varf din stiva. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva ultimul varf extras, L si varful curent K. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, F, si punctul din varful stivei, K, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
              {
                x: 404.03125,
                y: -560.6999999999999,
                label: "K",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
              {
                x: 404.03125,
                y: -560.6999999999999,
                label: "K",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful K si se adauga noua diagonala: FK. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
              {
                x: 404.03125,
                y: -560.6999999999999,
                label: "K",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
              {
                x: 404.03125,
                y: -560.6999999999999,
                label: "K",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful L si se adauga noua diagonala: FL. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
              {
                x: 297.03125,
                y: -530.5999999999999,
                label: "L",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
              {
                x: 297.03125,
                y: -530.5999999999999,
                label: "L",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 297.03125,
              y: -530.5999999999999,
              label: "L",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful E, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 153,
              y: -461.59999999999997,
              label: "E",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, K si varful curent F. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, J, si punctul din varful stivei, F, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful F si se adauga noua diagonala: JF. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
              {
                x: 192,
                y: -589.6999999999999,
                label: "F",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful K, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 404.03125,
              y: -560.6999999999999,
              label: "K",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, F si varful curent J. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, G, si punctul din varful stivei, J, sunt in lanturi diferite. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 280,
                y: -635.8,
                label: "G",
                color: "#666",
              },
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 280,
                y: -635.8,
                label: "G",
                color: "#666",
              },
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
            ],
            color: "#FF4500",
            style: "dash",
          },
          {
            type: "point",
            element: {
              x: 280,
              y: -635.8,
              label: "G",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful J si se adauga noua diagonala: GJ. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 280,
                y: -635.8,
                label: "G",
                color: "#666",
              },
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 280,
                y: -635.8,
                label: "G",
                color: "#666",
              },
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
            ],
            color: "green",
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 280,
              y: -635.8,
              label: "G",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage din stiva varful F, dar fiind ultimul, nu se adauga diagonala. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 192,
              y: -589.6999999999999,
              label: "F",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva primul varf extras, J si varful curent G. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 280,
              y: -635.8,
              label: "G",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 280,
              y: -635.8,
              label: "G",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        explanation: "Punctul curent, H, si punctul din varful stivei, G, sunt in acelasi lant. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 226,
              y: -703.9,
              label: "H",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 280,
              y: -635.8,
              label: "G",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage un varf din stiva. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 280,
              y: -635.8,
              label: "G",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se extrage varful J din stiva pentru ca formeaza cu H diagonala interioara poligonului. ",
        graphicDrawingsStepList: [
          {
            type: "addDiagonal",
            element: [
              {
                x: 226,
                y: -703.9,
                label: "H",
                color: "#666",
              },
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
            ],
          },
          {
            type: "line",
            element: [
              {
                x: 226,
                y: -703.9,
                label: "H",
                color: "#666",
              },
              {
                x: 461.03125,
                y: -617.8,
                label: "J",
                color: "#666",
              },
            ],
            color: "#52ab98",
          },
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "rgb(153, 24, 24)",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 226,
              y: -703.9,
              label: "H",
              color: "#666",
            },
            color: "#FF4500",
            size: 6,
          },
        ],
      },
      {
        explanation: "Se insereaza inapoi in stiva ultimul varf extras, J si varful curent H. ",
        graphicDrawingsStepList: [
          {
            type: "point",
            element: {
              x: 461.03125,
              y: -617.8,
              label: "J",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
          {
            type: "point",
            element: {
              x: 226,
              y: -703.9,
              label: "H",
              color: "#666",
            },
            color: "#52ab98",
            size: 6,
          },
        ],
      },
      {
        graphicDrawingsStepList: [
          {
            type: "redrawCanvasElements",
          },
        ],
      },
    ]);
  });
});
