/**
 * The main ride the bus game, connects all helpers
 */
import { Game } from "../../core/GameBase";
import { Player } from "../../models/Player";
import { Card } from "../../models/Card";
import { BettingManager } from "../../systems/BettingManager";
import * as Cards from "./helpers/rideTheBusCards";
import * as Rules from "./helpers/rideTheBusRules";
import * as Betting from "./helpers/rideTheBusBetting";
import * as Round from "./helpers/rideTheBusRound";


type colorGuess = 'red' | 'black';
type highlowGuess = 'high' | 'low';
type inoutGuess = 'in' | 'out';
type suitGuess = 'hearts' | 'clubs' | 'diamonds' | 'spades';


export class RideTheBus extends Game {
    currentRound: number = 0;
    tableCard: Card[] = [];
    bettingManager: BettingManager;
    currentBetInput: number = 0;
    betConfirmed = true;
    currentCard: Card | null = null;
    revealedCards: Card[] = [];
    message: string = "Red or Black";
    gameOver: boolean = false;
    showCurrentCard = false;

    constructor(players: Player[]) {
        super(players);
        this.bettingManager = new BettingManager();
    }

    //starst a game
    start() {
        Round.start(this);
    }

    //Handles the players guess
    guess(guessValue: string) {
        Round.guess(this, guessValue);
    }

    //No purpose, must be includes for game classes has it
    //do not remove
    playTurn(player: Player): void {
        return;
    }

    //draws a card from top of the deck
    drawCard(): Card {
        return Cards.drawCard(this);
    }

    //Checks if the player has guessed the right color
    checkColorGuess(card: Card,guess: colorGuess): boolean {
        return Rules.checkColorGuess(this, card, guess);
    }

    //Checks if the player has guessed higher or lower of the previous card
    checkHighlowGuess(card: Card, guess: highlowGuess): boolean {
        return Rules.checkHighlowGuess(this, card, guess);
    }

    //Checks if players has guessed if the card if between or outside of the previous two cards
    checkInOutGuess(card: Card, guess: inoutGuess): boolean {
        return Rules.checkInOutGuess(this, card, guess);
    }

    //Checks if players has guessed the suit correctly
    checkSuitGuess(card: Card, guess: suitGuess): boolean {
        return Rules.checkSuitGuess(this, card, guess);
    }

    //Returns a card value, the numerical order of the cards 
    getValue(card: Card): number {
        return Rules.getValue(this, card);
    }


    //Changes the player's current bet amount
    changeBet(amount: number) {
        Betting.changeBet(this, amount);
    }

    //Locks in bet and starts the game
    confirmBet() {
        Betting.confirmBet(this);
    }

    //Pays the player based on the round they finished
    payoutWinners(stage: number) {
        Betting.payoutWinners(this, stage);
    }

    //Allows player to exit earlier to keep earings
    cashOut() {
        Round.cashOut(this);
    }

    //restarts game
    restart() {
        Round.restart(this);
    }
}