import { VisualizationStep } from "../../shared/models/algorithm";
import { Point } from "../../shared/models/geometry";
import { ORANGE_COLOR, RED_COLOR } from "../../shared/util";

export const determineLowConvexHull = (points: Point[]) => {
    const algorithmGraphicIndications: VisualizationStep[] = [];
    let algorithmNumberOfPointsInConvexHull = 0;
    const lowConvexHull = [points[0], points[1]];
    algorithmNumberOfPointsInConvexHull += 2;

    let stepExplanation = "Punctele au fost sortate lexicografic. Frontiera inferioara este initializata cu punctele " + lowConvexHull[0].label + " si " + lowConvexHull[1].label + ". ";
    const visualizationStep = {
        explanation: stepExplanation,
        graphicDrawingsStepList: [{
            type: "updateConvexHullList",
            element: lowConvexHull.slice(),
        },
        {
            type: "updateNumber",
            element: algorithmNumberOfPointsInConvexHull
        }]
    } as VisualizationStep;
    algorithmGraphicIndications.push(visualizationStep);

    for (let i = 2; i < points.length; i++) {
        algorithmNumberOfPointsInConvexHull++;
        let visualizationStep = {
            explanation: "Punctul " + points[i].label + " este adaugat in lista.",
            graphicDrawingsStepList: [
                {
                    type: "point",
                    element: points[i],
                    color: ORANGE_COLOR,
                    size: 8
                },
                {
                    type: "updateNumber",
                    element: algorithmNumberOfPointsInConvexHull
                }]
        } as VisualizationStep;
        algorithmGraphicIndications.push(visualizationStep);


        while (lowConvexHull.length >= 2) {
            const secondLastPoint = lowConvexHull[lowConvexHull.length - 2];
            const lastPoint = lowConvexHull[lowConvexHull.length - 1];
            const orientation = calculateOrientationForNormalPoints(secondLastPoint, lastPoint, points[i]);
            if (orientation == 2) {
                const temporaryLowConvexHull = lowConvexHull.slice();
                temporaryLowConvexHull.push(points[i]);
                const visualizationStep = {
                    explanation: "Punctele " + secondLastPoint.label + ", " + lastPoint.label + " si " + points[i].label + " formeaza un viraj la stanga, deci niciun element nu este sters. ",
                    graphicDrawingsStepList: [
                        {
                            type: "updateConvexHullList",
                            element: temporaryLowConvexHull
                        }
                    ]
                };
                algorithmGraphicIndications.push(visualizationStep);
                break;
            }
            else {
                stepExplanation = "Punctele " + secondLastPoint.label + ", " + lastPoint.label + " si " + points[i].label
                if (orientation == 0) {
                    stepExplanation += " sunt coliniare";
                }
                else {
                    stepExplanation += " formeaza un viraj la dreapta";
                }
                stepExplanation += ", deci punctul " + lastPoint.label + " este sters din lista.";

                lowConvexHull.pop();
                algorithmNumberOfPointsInConvexHull--;
                const temporaryLowConvexHull = lowConvexHull.slice();
                temporaryLowConvexHull.push(points[i]);
                const visualizationStep = {
                    explanation: stepExplanation,
                    graphicDrawingsStepList: [
                        {
                            type: "updateConvexHullList",
                            element: temporaryLowConvexHull
                        },
                        {
                            type: "line",
                            element: [secondLastPoint, lastPoint],
                            style: "dash",
                            color: RED_COLOR
                        },
                        {
                            type: "line",
                            element: [lastPoint, points[i]],
                            style: "dash",
                            color: RED_COLOR
                        },
                        {
                            type: "point",
                            element: lastPoint,
                            color: RED_COLOR
                        },
                        {
                            type: "updateNumber",
                            element: algorithmNumberOfPointsInConvexHull
                        }
                    ]
                };
                algorithmGraphicIndications.push(visualizationStep);
            }
        }
        lowConvexHull.push(points[i]);


        let messageConvexHullList = "Frontiera inferioara contine punctele ";
        for (let i = 0; i < lowConvexHull.length; i++) {
            messageConvexHullList += lowConvexHull[i].label;
            if (i != lowConvexHull.length - 1) {
                messageConvexHullList += ", "
            }
            else {
                messageConvexHullList += ". "
            }
        }
        visualizationStep = {
            explanation: messageConvexHullList,
            graphicDrawingsStepList: [
                {
                    type: "updateConvexHullList",
                    element: lowConvexHull.slice()
                }]
        } as VisualizationStep;
        algorithmGraphicIndications.push(visualizationStep);
    }

    return algorithmGraphicIndications;
}

const calculateOrientationForNormalPoints = (firstPoint: Point, middlePoint: Point, endPoint: Point) => {
    // 2 = left,  1 = right, 0 = collinear
    const val = (middlePoint.x - firstPoint.x) * (endPoint.y - firstPoint.y)
        - (endPoint.x - firstPoint.x) * (middlePoint.y - firstPoint.y);
    if (val == 0) return 0;
    return (val > 0) ? 2 : 1;
}