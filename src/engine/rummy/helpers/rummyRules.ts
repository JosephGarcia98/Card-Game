/**
 * Handles card validation and ordering
 * Checks the meld combinations
 * Sorts the cards
 */
import { Rummy } from "../Rummy";
import { Card } from "../../../models/Card";
import { Player } from "../../../models/Player";

//Checks if the cards are all the same rank
export function checkSet(game: Rummy, cards: Card[]): boolean {
    if (cards.length < 3) return false;
    const firstRank = cards[0].rank;
    return cards.every(card => card.rank === firstRank);
}

//Check if the cards are in the correct order
export function checkRun(game: Rummy, cards: Card[]): boolean {
    if (cards.length < 3) return false;
    //sorts cards by rank before checking the sequence
    const sorted = [...cards].sort((a, b) => getOrder(game, a) - getOrder(game, b));
    const suit = sorted[0].suit;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].suit !== suit || getOrder(game, sorted[i]) !== getOrder(game, sorted[i - 1]) + 1) {
            return false;
        }
    }
    return true;
}

//Returns the point value of a card for scroing
export function getValue(game: Rummy, card: Card): number {
    if (card.rank === "A") return 15;
    if (["K", "Q", "J", "10"].includes(card.rank)) return 10;
    return 5;
}

//Returns the rank order of a card for sorting and run checking
export function getOrder(game: Rummy, card: Card): number {
    if (card.rank === "A") return 14;
    if (card.rank === "K") return 13;
    if (card.rank === "Q") return 12;
    if (card.rank === "J") return 11;
    return parseInt(card.rank);
}

//Sort players hand by rank
export function sortHand(game: Rummy,player: Player){
    player.hand.sort((a, b) => getOrder(game, a) - getOrder(game, b));
}