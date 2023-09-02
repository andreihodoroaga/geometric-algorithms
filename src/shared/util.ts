import { Point } from "./models/geometry";

export const POINT_RADIUS = 5
export const POINT_COORDINATE_MAX_VALUE = 50
export const NUMERIC_UNIT_PIXEL_SIZE = 20
export const CANVAS_COORDINATE_MAX_VALUE = POINT_COORDINATE_MAX_VALUE * NUMERIC_UNIT_PIXEL_SIZE
export const RED_COLOR = "rgb(153, 24, 24)"
export const ORANGE_COLOR = "#FF4500"
export const GREEN_COLOR = "#31695d"
export const LIGHT_GREEN_COLOR = "#52ab98"
export const BLUE_COLOR = "#2b6777"

export const generateRandomNumber = (start: number, end: number) => {
    if (start > end) {
        throw new Error("Start value must be less than or equal to end value");
    }
    return Math.floor(Math.random() * (end - start + 1)) + start;
}

export const distanceBetweenPoints = (point1: Point, point2: Point): number => {
    const deltaX = point2.x - point1.x;
    const deltaY = point2.y - point1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

export const getNextPointLetter = (lastPointLetter: string) => {
    let nextPointLetter = "";
    
    if (!lastPointLetter) {
        nextPointLetter = "A";
    } else {
        if (lastPointLetter === 'Z' || lastPointLetter === 'z') {
            nextPointLetter = String.fromCharCode(lastPointLetter.charCodeAt(0) - 25) + String.fromCharCode(lastPointLetter.charCodeAt(0) - 25);
        } else {
            const lastChar = lastPointLetter.slice(-1);
            const sub = lastPointLetter.slice(0, -1);
            if (lastChar === 'Z' || lastChar === 'z') {
                nextPointLetter = getNextPointLetter(sub) + String.fromCharCode(lastChar.charCodeAt(0) - 25);
            } else {
                nextPointLetter = sub + String.fromCharCode(lastChar.charCodeAt(0) + 1);
            }
        }
    }
    
    return nextPointLetter;
};
