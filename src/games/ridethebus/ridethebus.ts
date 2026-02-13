import { Card } from "../../models/Card";

export type Stage = "color" | "highlow" | "inout" | "suit" | "win";

export function cardColor(card: Card): "red" | "black" {
    return card.suit === "diamonds" || card.suit === "hearts" ? "red" : "black";
}

export function checkColorGuess(card: Card, guess: string): boolean {
    return cardColor(card) === guess;
}

export function checkHighLow(first: Card, second: Card, guess: string){ 
    if(guess === "higher") return second.value > first.value;
    if(guess === "lower") return first.value > second.value;
    return false;
}

export function checkInOut (first: Card, second: Card, third: Card, guess: string): boolean {
    const low = Math.min(first.value, second.value);
    const high =  Math.max(first.value, second.value);
    if(guess === "inside") 
        return third.value > low && third.value < high;
    if(guess === "outside") 
        return third.value < low || third.value > high;
    return false;
}

export function checkSuit(card: Card, guess: string): boolean {
    return card.suit === guess;
}