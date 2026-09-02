/**
 * Represents a player in any supported card game.
 * Stores the player's hand, bankroll, and game-specific state.
 */
import { Card } from "./Card";
import { Bankroll } from "./Bankroll";

export class Player {
    name: string;
    hand: Card[] = [];     
    bankroll: Bankroll;   
    folded: boolean = false;
    isHuman: boolean;
    currentBet: number = 0;
    hasStood: boolean = false;
    isBusted: boolean = false;
    score : number = 0;
    melds:Card[][] = [];
    allIn: boolean = false;
    totalContribution: number = 0;

    constructor(name: string, startingMoney = 1000, isHuman = true) {
        this.name = name;
        this.bankroll = new Bankroll(startingMoney);
        this.isHuman = isHuman;
    }

    //draws from deck
    drawCard(card: Card) {
        this.hand.push(card);
    }

    //reset only the hands not the bankroll
    resetHand():void {
        this.hand = [];
        this.folded = false;
        this.currentBet = 0;
        this.hasStood = false;
        this.isBusted = false;
    }

    //if the player has folded
    fold():void {
        this.folded = true;
    }

    //checks if the player has cards
    hasCards(): boolean {
        return this.hand.length > 0;
    }

    //checks the amount of cards in the players hand
    handSize(): number {
        return this.hand.length;
    }
}