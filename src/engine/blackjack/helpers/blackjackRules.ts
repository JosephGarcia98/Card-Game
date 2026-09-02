/**
 * calculates the value of cards and hands in blackjack
 * Handles face cards, aces, and total hand scoring
 */
import { Card } from "../../../models/Card";


//Returns the value of 1 card
export function getCardValue(card: Card): number {
    if (["K", "Q", "J"].includes(card.rank)) return 10;
    if (card.rank === "A")  return 11;
    return parseInt(card.rank);
}

//Calculate the entire hand of a player
export function getHandScore(hand: Card[]): number {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
        if (["K", "Q", "J"].includes(card.rank)) {
            score += 10;
        } else if (card.rank === "A") {
            score += 11;
            aceCount++;
        } else {
            score += parseInt(card.rank);
        }
    }
    //If player is over 21 convert any aces from 11 to 1 
    while (aceCount > 0 && score > 21) {
        score -= 10;
        aceCount--;
    }
    return score;
}