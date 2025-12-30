import { Language } from "./translations";

// Translation helper for algorithm files (non-React contexts)
export const getTranslation = (lang: Language, key: string, params?: Record<string, string | number>): string => {
  const text = algorithmTranslations[key]?.[lang] || algorithmTranslations[key]?.["en"] || key;

  if (!params) return text;

  return Object.entries(params).reduce(
    (result, [param, value]) => result.replace(new RegExp(`\\{${param}\\}`, "g"), String(value)),
    text
  );
};

// Algorithm-specific translations
export const algorithmTranslations: Record<string, Record<Language, string>> = {
  // Graham Scan / Convex Hull
  convexHullComplete: {
    en: "Convex hull is complete.",
    ro: "Acoperirea convexa este completa.",
  },
  pointsSortedLexLower: {
    en: "Points have been sorted lexicographically. The lower boundary is initialized with points {p1} and {p2}.",
    ro: "Punctele au fost sortate lexicografic. Frontiera inferioara este initializata cu punctele {p1} si {p2}.",
  },
  similarlyUpperBoundary: {
    en: "Similarly, the upper boundary is determined, initialized with points {p1} and {p2}.",
    ro: "Analog, se determina frontiera superioara, care se initializeaza cu punctele {p1} si {p2}.",
  },
  pointAddedToList: {
    en: "Point {label} is added to the list.",
    ro: "Punctul {label} este adaugat in lista.",
  },
  leftTurnNoDelete: {
    en: "Points {p1}, {p2} and {p3} form a left turn, so no element is deleted.",
    ro: "Punctele {p1}, {p2} si {p3} formeaza un viraj la stanga, deci niciun element nu este sters.",
  },
  pointsAre: {
    en: "Points {p1}, {p2} and {p3}",
    ro: "Punctele {p1}, {p2} si {p3}",
  },
  areCollinear: {
    en: " are collinear",
    ro: " sunt coliniare",
  },
  formRightTurn: {
    en: " form a right turn",
    ro: " formeaza un viraj la dreapta",
  },
  soPointDeleted: {
    en: ", so point {label} is deleted from the list.",
    ro: ", deci punctul {label} este sters din lista.",
  },
  lowerBoundaryContains: {
    en: "Lower boundary contains points {points}.",
    ro: "Frontiera inferioara contine punctele {points}.",
  },
  upperBoundaryContains: {
    en: "Upper boundary contains points {points}.",
    ro: "Frontiera superioara contine punctele {points}.",
  },
  convexHullInitSmallest: {
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
  pointRightOfEdgeBecomePivot: {
    en: "Point {point} is to the right of edge {edge}, so it becomes the new pivot.",
    ro: "Punctul {point} se afla la dreapta muchiei {edge}, deci devine noul pivot.",
  },
  pointNotRightOfEdge: {
    en: "Point {point} is not to the right of edge {edge}, so it does not become the new pivot.",
    ro: "Punctul {point} nu se afla la dreapta muchiei {edge}, deci nu devine noul pivot.",
  },
  pointAddedToConvexHull: {
    en: "Point {label} is added to the convex hull.",
    ro: "Punctul {label} se adauga in acoperirea convexa.",
  },
  convexHullFormedByPoints: {
    en: "Convex hull is formed by points: {points}.",
    ro: "Acoperirea convexa este formata din punctele: {points}.",
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
  fromSubsetMaxAngle: {
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
  addedP0AndRightmost: {
    en: "Points P0(0, -inf) and {label} (the rightmost point) are added to the list.",
    ro: "Sunt adaugate in lista punctele P0(0, -inf) si {label} (cel mai din dreapta punct).",
  },
  newPointEqualsInitial: {
    en: "Since the new point found equals the initial point ({label}), convex hull is complete.",
    ro: "Cum noul punct gasit este egal cu punctul initial ({label}), acoperirea convexa este completa.",
  },
  iterationNotAllFound: {
    en: "At this iteration (m = {m}), not all points on the hull were discovered.",
    ro: "La aceasta iteratie (m = {m}), nu au fost descoperite toate punctele de pe infasuratoare.",
  },

  // Triangulation
  polygonAlreadyTriangle: {
    en: "The given polygon is already a triangle.",
    ro: "Poligonul dat este deja un triunghi.",
  },
  verticesSorted: {
    en: "Vertices are sorted {order} by {axis} (if equal, x-coordinate is used): {points}",
    ro: "Varfurile se ordoneaza {order} după {axis} (dacă ordinea este egală, se folosește abscisa): {points}",
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
    en: "Highlighting trapezoids that intersect the added segment: {trapezoids}",
    ro: "Se evidentiaza trapezele care intersecteaza segmentul adaugat: {trapezoids}",
  },
  intersectedReplaced: {
    en: "Intersected trapezoids are removed and replaced with new trapezoids {trapezoids}",
    ro: "Trapezele intersectate sunt eliminate si inlocuite cu noile trapeze {trapezoids}",
  },
  removeLeafCreateNew: {
    en: "The corresponding leaf is removed from the search structure and new leaves are created.",
    ro: "Se elimina frunza corespunzatoare din structura de cautare si se creeaza noi frunze.",
  },
  addPointExtension: {
    en: "Adding extension for point {point}",
    ro: "Se adauga extensia punctului {point}",
  },
  updatePointExtension: {
    en: "Updating extension for point {point}",
    ro: "Se actualizeaza extensia punctului {point}",
  },
  trapezoidRemovedReplaced: {
    en: "Trapezoid {old} is removed and replaced with newly created trapezoids: {new}",
    ro: "Trapezul {old} este eliminat si este inlocuit cu trapezele nou aparute: {new}",
  },

  // Voronoi / Fortune's Algorithm
  siteEvent: {
    en: "Site event: adding parabola for point {point}.",
    ro: "Eveniment de tip locatie: se adauga parabola punctului {point}.",
  },
  circleEventDetected: {
    en: "Circle event detected: adding circle associated with edges formed by parabolas of points {p1} and {p2}, respectively {p2} and {p3}.",
    ro: "Eveniment de tip cerc detectat: se adauga cercul asociat muchiilor formate de parabolele punctelor {p1} si {p2}, respectiv {p2} si {p3}.",
  },
  circleEventCompleted: {
    en: "Circle event completed: parabola associated with point {point} disappears and a diagram vertex appears.",
    ro: "Eveniment de tip cerc complet: dispare parabola asociata punctului {point} si apare un varf al diagramei.",
  },
  algorithmFinished: {
    en: "Algorithm finished",
    ro: "Algoritm finalizat",
  },
};

