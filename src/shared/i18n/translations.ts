export type Language = "en" | "ro";

export const translations = {
  // Navigation
  home: {
    en: "Home",
    ro: "Acasă",
  },
  convexHull: {
    en: "Convex Hull",
    ro: "Acoperire convexa",
  },
  triangulation: {
    en: "Polygon Triangulation",
    ro: "Triangularea poligoanelor",
  },
  duality: {
    en: "Duality",
    ro: "Dualitate",
  },
  voronoiDiagram: {
    en: "Voronoi Diagram",
    ro: "Diagrama Voronoi",
  },
  trapezoidalMap: {
    en: "Trapezoidal Map",
    ro: "Harta trapezoidala",
  },

  // Home page
  homeTitle: {
    en: "Geometric Algorithms Visualization App",
    ro: "Aplicatie de vizualizat algoritmi geometrici",
  },
  homeDescription: {
    en: "This application is designed to help visualize fundamental geometric algorithms, such as determining convex hull, triangulating a monotone polygon, or Voronoi diagram.",
    ro: "Această aplicație este concepută pentru a ajuta la vizualizarea algoritmilor geometrici fundamentali, cum ar fi determinarea acoperirii convexe, triangularea unui poligon monoton sau diagrama Voronoi.",
  },
  homeChooseAlgorithm: {
    en: "Choose an algorithm to explore:",
    ro: "Alege un algoritm pe care vrei sa il explorezi:",
  },

  // Visualization Engine
  algorithmNotEnded: {
    en: "Algorithm not yet finished",
    ro: "Algoritmul nu e inca finalizat",
  },
  resetVisualization: {
    en: "Restart visualization",
    ro: "Reporneste vizualizarea",
  },
  runningAlgorithm: {
    en: "Algorithm is running",
    ro: "Algoritmul e in desfasurare",
  },
  automatic: {
    en: "Automatic",
    ro: "Automat",
  },
  manual: {
    en: "Manual",
    ro: "Manual",
  },
  finished: {
    en: "Finished",
    ro: "Finalizat",
  },
  start: {
    en: "Start",
    ro: "Start",
  },
  pause: {
    en: "Pause",
    ro: "Pause",
  },
  next: {
    en: "Next",
    ro: "Next",
  },
  addPointsFirst: {
    en: "Add points first",
    ro: "Mai intai adauga puncte",
  },
  speed: {
    en: "Speed:",
    ro: "Viteza:",
  },
  replay: {
    en: "Replay",
    ro: "Replay",
  },
  clear: {
    en: "Clear",
    ro: "Clear",
  },
  executionMode: {
    en: "Execution mode",
    ro: "Mod executie",
  },

  // Explanations
  executionSteps: {
    en: "Execution steps",
    ro: "Pasi executie",
  },

  // Convex Hull
  needAtLeast2Points: {
    en: "At least 2 points are needed!",
    ro: "E nevoie de minim 2 puncte!",
  },
  algorithm: {
    en: "Algorithm",
    ro: "Algoritm",
  },
  convexHullComplete: {
    en: "Convex hull is complete.",
    ro: "Acoperirea convexa este completa.",
  },
  pointsSortedLex: {
    en: "Points have been sorted lexicographically. The lower boundary is initialized with points",
    ro: "Punctele au fost sortate lexicografic. Frontiera inferioara este initializata cu punctele",
  },
  similarlyUpperBoundary: {
    en: "Similarly, the upper boundary is determined, initialized with points",
    ro: "Analog, se determina frontiera superioara, care se initializeaza cu punctele",
  },
  pointAddedToList: {
    en: "Point {label} is added to the list.",
    ro: "Punctul {label} este adaugat in lista.",
  },
  leftTurn: {
    en: "Points {p1}, {p2} and {p3} form a left turn, so no element is deleted.",
    ro: "Punctele {p1}, {p2} si {p3} formeaza un viraj la stanga, deci niciun element nu este sters.",
  },
  rightTurn: {
    en: "form a right turn",
    ro: "formeaza un viraj la dreapta",
  },
  collinear: {
    en: "are collinear",
    ro: "sunt coliniare",
  },
  soPointDeleted: {
    en: ", so point {label} is deleted from the list.",
    ro: ", deci punctul {label} este sters din lista.",
  },
  lowerBoundaryContains: {
    en: "Lower boundary contains points",
    ro: "Frontiera inferioara contine punctele",
  },
  upperBoundaryContains: {
    en: "Upper boundary contains points",
    ro: "Frontiera superioara contine punctele",
  },
  convexHullInitWithSmallest: {
    en: "Convex hull is initialized with the lexicographically smallest point, point {label}.",
    ro: "Acoperirea convexa se initializeaza cu cel mai mic punct in ordine lexicografica, punctul {label}.",
  },
  chooseArbitraryPivot: {
    en: "Point {label} is arbitrarily chosen as pivot",
    ro: "Se alege arbitrar punctul {label} drept pivot",
  },
  pointChosenForComparison: {
    en: "Point {label} is chosen for comparison",
    ro: "Punctul {label} este ales pentru a fi comparat",
  },
  pointIsRightOfEdge: {
    en: "Point {p} is to the right of edge {edge}, so it becomes the new pivot.",
    ro: "Punctul {p} se afla la dreapta muchiei {edge}, deci devine noul pivot.",
  },
  pointNotRightOfEdge: {
    en: "Point {p} is not to the right of edge {edge}, so it does not become the new pivot.",
    ro: "Punctul {p} nu se afla la dreapta muchiei {edge}, deci nu devine noul pivot.",
  },
  pointAddedToConvexHull: {
    en: "Point {label} is added to the convex hull.",
    ro: "Punctul {label} se adauga in acoperirea convexa.",
  },
  convexHullFormedByPoints: {
    en: "Convex hull is formed by points:",
    ro: "Acoperirea convexa este formata din punctele:",
  },
  setPartitionedRandomly: {
    en: "The set of points is randomly partitioned into subsets with at most {m} elements (m = {m}).",
    ro: "Multimea de puncte este partitionata aleator in submultimi cu cel mult {m} elemente (m = {m}).",
  },
  formSubset: {
    en: "Forming subset {label} with {count} element(s).",
    ro: "Se formeaza submultimea {label} cu {count} element(e).",
  },
  convexHullDeterminedUsing: {
    en: "Convex hull of subset {label} is determined using Jarvis March.",
    ro: "Este determinata infasuratoarea convexa a submultimii {label} folosind Jarvis March.",
  },
  fromSubsetPointFormsMaxAngle: {
    en: "From subset {subset}, point {point} forms the maximum angle with points {p1} and {p2}",
    ro: "Din submultimea {subset}, punctul {point} formeaza unghiul maxim cu punctele {p1} si {p2}",
  },
  amongPointsMaxAngle: {
    en: "Among points {points}, point {point} forms the maximum angle with points {p1} and {p2}.",
    ro: "Dintre punctele {points}, punctul {point} formeaza unghiul maxim cu punctele {p1} si {p2}.",
  },
  pointAddedToPointsList: {
    en: "Point {label} is added to the list of points.",
    ro: "Punctul {label} este adaugat in lista de puncte.",
  },
  addedToListP0AndRightmost: {
    en: "Points P0(0, -inf) and {label} (the rightmost point) are added to the list.",
    ro: "Sunt adaugate in lista punctele P0(0, -inf) si {label} (cel mai din dreapta punct).",
  },
  newPointEqualsInitial: {
    en: "Since the new point found equals the initial point ({label}), convex hull is complete.",
    ro: "Cum noul punct gasit este egal cu punctul initial ({label}), acoperirea convexa este completa.",
  },
  iterationNotAllPointsDiscovered: {
    en: "At this iteration (m = {m}), not all points on the hull were discovered.",
    ro: "La aceasta iteratie (m = {m}), nu au fost descoperite toate punctele de pe infasuratoare.",
  },

  // Triangulation
  needAtLeast3Points: {
    en: "At least 3 points are needed to determine the triangulation.",
    ro: "Este nevoie de minim 2 puncte pentru a determina triangularea.",
  },
  pointsNotValidPolygon: {
    en: "Points do not form a valid polygon!",
    ro: "Punctele nu formeaza un poligon valid!",
  },
  polygonNotMonotone: {
    en: "Polygon is not {axis}-monotone!",
    ro: "Poligonul nu e {axis}-monoton!",
  },
  polygonAlreadyTriangle: {
    en: "The given polygon is already a triangle.",
    ro: "Poligonul dat este deja un triunghi.",
  },
  verticesSorted: {
    en: "Vertices are sorted {order} by {axis} (if equal, x-coordinate is used):",
    ro: "Varfurile se ordoneaza {order} după {axis} (dacă ordinea este egală, se folosește abscisa):",
  },
  ascending: {
    en: "ascending",
    ro: "crescător",
  },
  descending: {
    en: "descending",
    ro: "descrescător",
  },
  initializeStack: {
    en: "Stack is initialized with the first 2 vertices.",
    ro: "Se initializeaza stiva cu primele 2 varfuri.",
  },
  currentAndTopSameChain: {
    en: "Current point, {current}, and top of stack point, {top}, are in the same chain.",
    ro: "Punctul curent, {current}, si punctul din varful stivei, {top}, sunt in acelasi lant.",
  },
  extractTop: {
    en: "Vertex {label} is extracted from the stack.",
    ro: "Se extrage varful {label} din stiva.",
  },
  extractedForDiagonal: {
    en: "Vertex {extracted} is extracted from the stack because it forms an interior diagonal with {current}.",
    ro: "Se extrage varful {extracted} din stiva pentru ca formeaza cu {current} diagonala interioara poligonului.",
  },
  insertBackInStack: {
    en: "The {position} extracted vertex, {vertex}, and current vertex {current} are inserted back into the stack.",
    ro: "Se insereaza inapoi in stiva {position} varf extras, {vertex} si varful curent {current}.",
  },
  lastPosition: {
    en: "last",
    ro: "ultimul",
  },
  firstPosition: {
    en: "first",
    ro: "primul",
  },
  differentChains: {
    en: "Current point, {current}, and top of stack point, {top}, are in different chains.",
    ro: "Punctul curent, {current}, si punctul din varful stivei, {top}, sunt in lanturi diferite.",
  },
  extractAndAddDiagonal: {
    en: "Vertex {vertex} is extracted from the stack and diagonal {diagonal} is added.",
    ro: "Se extrage din stiva varful {vertex} si se adauga noua diagonala: {diagonal}.",
  },
  extractLastNoDiagonal: {
    en: "Vertex {vertex} is extracted from the stack, but being the last one, no diagonal is added.",
    ro: "Se extrage din stiva varful {vertex}, dar fiind ultimul, nu se adauga diagonala.",
  },
  addDiagonalsFromLast: {
    en: "Diagonals are added from the last vertex in the list, {vertex}, to the stack vertices (except first and last).",
    ro: "Se adauga diagonale de la ultimul varf din lista, {vertex}, la varful stivei (exceptand primul si ultimul).",
  },
  addDiagonal: {
    en: "Diagonal {diagonal} is added.",
    ro: "Se adauga diagonala {diagonal}.",
  },
  triangulationComplete: {
    en: "Triangulation is complete.",
    ro: "Triangularea este completa.",
  },
  polygonType: {
    en: "Polygon type",
    ro: "Tipul de poligon",
  },
  stack: {
    en: "Stack:",
    ro: "Stiva:",
  },

  // Duality
  newPoint: {
    en: "New point",
    ro: "Punct nou",
  },
  newLine: {
    en: "New line",
    ro: "Linie noua",
  },
  add: {
    en: "Add",
    ro: "Add",
  },
  pointBecomesLine: {
    en: "Point ({x}, {y}) becomes line y = {equation} in the dual plane",
    ro: "Punctul ({x}, {y}) devine dreapta y = {equation} in planul dual",
  },
  lineBecomesPoint: {
    en: "Line y = {equation} becomes point ({m}, {n})",
    ro: "Dreapta y = {equation} devine punctul ({m}, {n})",
  },
  zoom: {
    en: "Zoom:",
    ro: "Zoom:",
  },

  // Voronoi
  sweepLineOrientation: {
    en: "Sweep line orientation",
    ro: "Orientarea dreptei de baleiere",
  },
  vertical: {
    en: "Vertical",
    ro: "Verticala",
  },
  horizontal: {
    en: "Horizontal",
    ro: "Orizontala",
  },

  // Trapezoidal Map
  determineInitialRect: {
    en: "The initial rectangle is determined.",
    ro: "Se determina dreptunghiul initial.",
  },
  addSegment: {
    en: "Adding segment: {segment}",
    ro: "Se adauga un segment: {segment}",
  },
  highlightIntersected: {
    en: "Highlighting trapezoids that intersect the added segment:",
    ro: "Se evidentiaza trapezele care intersecteaza segmentul adaugat:",
  },
  intersectedReplaced: {
    en: "Intersected trapezoids are removed and replaced with new trapezoids",
    ro: "Trapezele intersectate sunt eliminate si inlocuite cu noile trapeze",
  },
  removeLeafCreateNew: {
    en: "The corresponding leaf is removed from the search structure and new leaves are created.",
    ro: "Se elimina frunza corespunzatoare din structura de cautare si se creeaza noi frunze.",
  },

  // Canvas
  generateRandom: {
    en: "Generate random {mode}",
    ro: "Genereaza {mode} aleator",
  },
  orClickToAddPoint: {
    en: "or click anywhere to add a point",
    ro: "sau click oriunde pentru a adauga un punct",
  },

  // Canvas modes for overlay text
  points: {
    en: "points",
    ro: "puncte",
  },
  xMonotonePolygon: {
    en: "x-monotone polygon",
    ro: "poligon x-monoton",
  },
  yMonotonePolygon: {
    en: "y-monotone polygon",
    ro: "poligon y-monoton",
  },
  segments: {
    en: "segments",
    ro: "segmente",
  },
} as const;

export type TranslationKey = keyof typeof translations;

