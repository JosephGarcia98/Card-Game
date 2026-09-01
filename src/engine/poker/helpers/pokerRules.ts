/**
 * Evaluates Poker hands and determines the strongest possible hand
 * Hand scoring, card values and combinations 
 */
import { Poker } from "../Poker";
import { Player } from "../../../models/Player";
import { Card } from "../../../models/Card";

//Returns the best scored hand the player can have
export function getBestHand(game: Poker, player: Player): number {
    const allCards = [...player.hand, ...game.board];
    const combos = getCombinations(game, allCards, 5);
    let bestScore = 0;
    //checks every possible 5 card combo
    for (const combo of combos) {
        const score = evaluateHand(game, combo);
        if (score > bestScore) {
            bestScore = score;
        }
    }
    return bestScore;
}

//Scores hand and return the score
export function evaluateHand(game: Poker,cards: Card[]): number {
    const values = cards.map(card => getValue(game, card)).sort((a, b) => b - a);
    const suits = cards.map(card => card.suit);
    //count how many of each rank appears
    const rankCount: Record<number, number> = {};
    values.forEach(value => {
        rankCount[value] = (rankCount[value] || 0) + 1;
    });
    const count = Object.values(rankCount).sort((a, b) => b - a);
    const uniques = Object.keys(rankCount).map(Number).sort((a, b) => b - a);
    const isFlush = suits.every(suit => suit === suits[0]);
    //checks for consecutive card values
    const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
    let isStraight = false;
    if (uniqueValues.length === 5) {
        isStraight = uniqueValues.every((value, index, arr) => index === 0 || arr[index - 1] - 1 === value);
        //for A,2,3,4,5
        const wheel = JSON.stringify(uniqueValues) === JSON.stringify([14, 5, 4, 3, 2]);
        if (wheel) {
            isStraight = true;
        }
    }
    if (isFlush && JSON.stringify(values) === JSON.stringify([14,13,12,11,10])) return 10000000;
    if (isFlush && isStraight) return 9000000 + values[0];
    if (count[0] === 4) {
        const fourKind = uniques.find(value => rankCount[value] === 4)!;
        return 8000000 + fourKind;
    }
    if (count[0] === 3 && count[1] === 2) {
        const fullHouse = uniques.find(value =>rankCount[value] === 3)!;
        const pairPart = uniques.find(value => rankCount[value] === 2)!;
        return 7000000 + fullHouse * 100 + pairPart;
    }
    if (isFlush) return 6000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
    if (isStraight) return 5000000 + values[0];
    if (count[0] === 3) {
        const trips = uniques.find(value => rankCount[value] === 3)!;
        const kickers = uniques.filter(value => rankCount[value] === 1).sort((a,b)=>b-a);
        return 4000000 + trips * 10000 + kickers[0] * 100 + kickers[1];
    }
    if (count[0] === 2 && count[1] === 2) {
        const pairs = uniques.filter(value =>rankCount[value] === 2).sort((a,b)=>b-a);
        const kicker = uniques.find(value => rankCount[value] === 1)!;
        return 3000000 + pairs[0] * 10000 + pairs[1] * 100 + kicker;
    }
    if (count[0] === 2) {
        const pair = uniques.find(value => rankCount[value] === 2)!;
        const kickers = uniques.filter(value => rankCount[value] === 1).sort((a,b)=>b-a);
        return 2000000 + pair * 10000 + kickers[0] * 1000 + kickers[1] * 100 + kickers[2];
    }
    //if no combo found return high card
    return 1000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4];
}

//gets the value of one card
export function getValue(game: Poker, card: Card): number {
    if (card.rank === "A") return 14;
    if (card.rank === "K") return 13;
    if (card.rank === "Q") return 12;
    if (card.rank === "J") return 11;
    return parseInt(card.rank);
}

//Generates every possible combination of cards of a given size
export function getCombinations(game: Poker, cards: Card[], size: number): Card[][] {
    const result: Card[][] = [];
    const combine = (start: number, combo: Card[]) => {
        if (combo.length === size) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < cards.length; i++) {
            combo.push(cards[i]);
            combine(i + 1, combo);
            combo.pop();
        }
    };
    combine(0, []);
    return result;
}