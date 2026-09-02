/**
 * Controls all guessing logic
 * Checks if player has guesses right or wrong
 * Does not control game only checks if guess is correct
 */
import { RideTheBus } from "../RideTheBus";
import { Card } from "../../../models/Card";

type colorGuess = 'red' | 'black';
type highlowGuess = 'high' | 'low';
type inoutGuess = 'in' | 'out';
type suitGuess = 'hearts' | 'clubs' | 'diamonds' | 'spades';

//Checks if the player has guessed the right color
export function checkColorGuess(game: RideTheBus,card: Card,guess: colorGuess): boolean {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const isBlack = card.suit === 'clubs' || card.suit === 'spades';
    return (guess === 'red' && isRed) || (guess === 'black' && isBlack);
}

//Checks if the player has guessed higher or lower of the previous card
export function checkHighlowGuess(game: RideTheBus, card: Card, guess: highlowGuess): boolean {
    if(!game.tableCard.length) return false;
    const prevCard = game.tableCard[0];
    const prevValue = getValue(game, prevCard);
    const curValue = getValue(game, card);
    if(guess === "high") return curValue > prevValue;
    return curValue < prevValue;
}

//Checks if players has guessed if the card if between or outside of the previous two cards
//if the boards has 5 and J is the card in between 5-J or not
export function checkInOutGuess(game: RideTheBus, card: Card, guess: inoutGuess): boolean {
    if(game.tableCard.length < 2)  return false;
    const inside = getValue(game, game.tableCard[0]);
    const outside = getValue(game, game.tableCard[1]);
    const curValue = getValue(game, card);
    const low = Math.min(inside, outside);
    const high = Math.max(inside, outside);
    if(guess === "in") return curValue > low && curValue < high;
    if(guess === "out") return curValue < low || curValue > high;
    return false;
}

//Checks if players has guessed the suit correctly
export function checkSuitGuess(game: RideTheBus, card: Card, guess: suitGuess): boolean {
    return card.suit === guess;
}

//Returns a card value, the numerical order of the cards
//Ace is 14 not 1
export function getValue(game: RideTheBus, card: Card): number {
    if(card.rank === 'J') return 11;
    if(card.rank === 'Q') return 12;
    if(card.rank === 'K') return 13;
    if(card.rank === 'A') return 14;
    return parseInt(card.rank);
}