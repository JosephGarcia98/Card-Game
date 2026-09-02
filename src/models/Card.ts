/**
 * Class used to make a single playing card.
 * Stores the card's suit, rank, and whether it is face up or face down.
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = "2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K"|"A";

export class Card {
    suit: Suit;
    rank : Rank;
    faceUp: boolean;

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;//face down by default
    }

    //the image path of the cards
    getCardPath(): string {
        if (!this.faceUp) return "/cardsPNG/back.png";
        return `/cardsPNG/${this.suit}/${this.rank}.png`;
    }

    //changes if the card if face up or down
    flip(): void {
        this.faceUp = !this.faceUp;
    }

    //return a string of the cards
    toString(): string {
        return `${this.rank} of ${this.suit}`;
    }
}