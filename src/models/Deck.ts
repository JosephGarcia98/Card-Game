/**
 * class used to make a standard 52-card deck.
 * Supports building, shuffling, drawing, and resetting the deck.
 */
import {Card, Suit, Rank} from './Card';

export class Deck {
    cards: Card[] = [];

    constructor() {
        this.reset();
    }

    //creates a full 52 deck of cards
    build():void {
        const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
        const ranks: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
        this.cards = [];
        for(const suit of suits) {
            for(const rank of ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }
    
    //uses Fisher–Yates shuffle to shuffle the 52 cards
    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    //takes the top card off
    draw(): Card| undefined {
        if(this.cards.length === 0) throw new Error("DECK EMPTY: Attempted to draw from an empty deck.");
        return this.cards.pop();
    }
    
    //rebuilds the 52 cards and then shuffles
    reset():void {
        this.build();
        this.shuffle();
    }
}