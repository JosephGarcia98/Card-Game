import { Game } from "../../core/GameBase";
import { Player } from "../../models/Player";
import { Card } from "../../models/Card";
import * as Rules from "./helpers/rummyRules";
import * as Melds from "./helpers/rummyMelds";
import * as Turns from "./helpers/rummyTurns";
import * as Round from "./helpers/rummyRound";
import * as AI from "./AI/rummyAI"

export class Rummy extends Game {
    skipPlayers: Player[] = [];
    discardPile: Card[] = [];
    targerScore = 500;
    roundOver: boolean = false;
    turnPhase: "draw" | "play" | "discard" = "draw";
    currentPlayerIndex: number = 0;
    requiredMeldCard: Card | null = null;
    gameOver: boolean = false;
    winner: Player | null = null;
    lastPickup: { 
        cards: Card[];
        index: number;
    } | null = null;

    constructor(players: Player[]) {
        super(players);
    }

    //Plays the AI turn
    playTurn(player: Player) {
        AI.playTurn(this, player);
    }

    //start a new game
    start() {
        Round.start(this);
    }

    //Creates a new meld from selected cards in the players hand
    playMeld(player: Player, indices: number[]): boolean {
        return Melds.playMeld(this, player, indices);
    }
    
    //Checks if the cards are all the same rank
    checkSet(cards: Card[]): boolean {
        return Rules.checkSet(this, cards);
    }

    //Check if the cards are in the correct order
    checkRun(cards: Card[]): boolean {
        return Rules.checkRun(this, cards);
    }

    //Returns the point value of a card for scroing
    getValue(card: Card): number {
        return Rules.getValue(this, card);
    }

    //Returns the rank order of a card for sorting and run checking
    getOrder(card: Card): number {
        return Rules.getOrder(this, card);
    }

    //Returns the rank order of a card for sorting and run checking
    sortHand(player: Player) {
        Rules.sortHand(this, player);
    }

    //Returns the player whose turn it currently is
    getCurrentPlayer(): Player {
        return Turns.getCurrentPlayer(this);
    }

    //Draws top card from the deck
    drawFromDeck(player: Player): boolean {
        return Turns.drawFromDeck(this, player);
    }

    //Draws top card from discard pile
    drawFromDiscard(player: Player): boolean {
        return Turns.drawFromDiscard(this, player);
    }

    //Places a card into the discard pile and ends the player's turn
    playerDiscard(player: Player, index: number): boolean {
        return Turns.playerDiscard(this, player, index);
    }

    //Moves player from play pahse to discard
    finishPlayPhase() {
        Turns.finishPlayPhase(this);
    }

    //Ends the current player's turn and moves to the next player
    endTurn() {
        Turns.endTurn(this);
    }

    //Calculates score and check if game has ended
    endRound() {
        Round.endRound(this);
    }

    //Takes a card and any cards above it from the discard pile
    takeFromDiscard(player: Player, index: number): boolean {
        return Turns.takeFromDiscard(this, player, index);
    }

    //Puts all card picked up takeFromDiscard and puts them back
    undoPickup(player: Player): boolean {
        return Turns.undoPickup(this, player);
    }

    //Adds a card from the player's hand to an existing meld
    addToMeld(player: Player, meldIndex: number, cardIndex: number): boolean {
        return Melds.addToMeld(this, player,meldIndex,cardIndex);
    }

    //Calculates a player's score based on melds and remaining cards
    calculatePlayerScore(player: Player): number {
        return Round.calculatePlayerScore(this, player);
    }

    //Checks if any player has reached the winning score
    checkForWinner() {
        Round.checkForWinner(this);
    }

    //Restarts the game back to its starting state and calls starts
    restartGame() {
        Round.restartGame(this);
    }

    //When the deck is empty every player has the option to pick up or skip
    //if every player skips the round ends
    skipWhenDeckEmpty(player: Player): boolean {
        return Turns.skipWhenDeckEmpty(this, player);
    }
}