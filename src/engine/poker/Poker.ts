/**
 * Controls the AI for Poker
 * Simualtes possible future combinations to estimate 
 * chance of winning
 * Then uses these estimates to mkae a choice
 */
import { Game } from "../../core/GameBase";
import { Player } from "../../models/Player";
import { Card } from "../../models/Card";
import { BettingManager } from "../../systems/BettingManager";
import { TurnManager } from "../../systems/TurnManager";
import * as Round from "./helpers/pokerRound";
import * as Betting from "./helpers/pokerBetting";
import * as Rules from "./helpers/pokerRules";
import * as Showdown from "./helpers/pokerShowdown";
import * as AI from "./AI/pokerAI";


export class Poker extends Game {
    pot: number = 0;
    board: Card[] = [];
    roundStage: "preflop" | "flop" | "turn" | "river" | "showdown"  = "preflop";
    activeBet: number = 0;
    playersActed: Set<Player> = new Set();
    smallBlind: number = 10;
    bigBlind: number = 20;
    dealerIndex: number = 0;
    turns: TurnManager;
    bettingManager: BettingManager;
    currentBetInput: number = 0;
    betConfirmed = true;
    lastRaise: number = this.bigBlind;
    handStarted: boolean = false;

    constructor(players: Player[]) {
        super(players);
        this.turns = new TurnManager(players);
        this.bettingManager = new BettingManager();
    }

    //Starts the game
    start() {
        Round.start(this);
    }

    //Handles every betting action a player can make
    handleAction(player: Player, action: "fold" | "check" | "call" | "raise", raiseAmount: number = 0) {
        Betting.handleAction(this, player, action, raiseAmount);
    }

    //Allows the AI to play
    playTurn(player: Player): void {
        AI.playTurn(this, player);
    }

    //Checks if the current betting round is finished
    isBettingRoundComplete() {
        //only eligible players are counted
        const activePlayers = this.players.filter(player => !player.folded);
        //every active player must either match the current bet or be all-in
        const everyoneMatched = activePlayers.every(player => player.allIn || player.currentBet === this.activeBet);
        //every active player must have taken an action this round
        const everyoneActed = activePlayers.every(player => player.allIn || this.playersActed.has(player));
        return everyoneMatched && everyoneActed;
    }

    //Clears betting information for the next betting round
    resetBets() {
        Round.resetBets(this);
    }

    //Advances the game to the next stage
    advanceStage() {
        Round.advanceStage(this);
    }

    //Checks if everyone but one player has folded
    checkForEarlyWinner(): Player | null {
        return Round.checkForEarlyWinner(this);
    }

    //Moves to the next eligible player
    nextTurn() {
        Round.nextTurn(this);
    }

    //moves action to the first active player after the dealer
    advanceTurns() {
        Round.advanceTurns(this);
    }

    //Confirms how much the player has bet
    changeBet(amount: number) {
        Betting.changeBet(this,amount);
    }

    //Locks in bet and starts round
    confirmBet() {
        Betting.confirmBet(this);
    }

    //Creates all main and side pots based on player contributions
    //two createSidePot() this one is called from showdwon
    createSidePot() {
        return Showdown.createSidePot(this);
    }

    //Pays out or distributes both main and side pot
    payoutWinners() {
        Showdown.payoutWinners(this);
    }

    //Returns the best scored hand the player can have
    getBestHand(player: Player): number {
        return Rules.getBestHand(this, player);
    }

    //Scores hand and return the score
    evaluateHand(cards: Card[]): number {
        return Rules.evaluateHand(this, cards);
    }

    //gets the value of one card
    getValue(card: Card): number {
        return Rules.getValue(this, card);
    }

    //Generates every possible combination of cards of a given size
    getCombinations(cards: Card[], size: number): Card[][] {
        return Rules.getCombinations(this, cards, size);
    }

    //Folds the player's hand
    fold(player: Player) {
        Betting.fold(this, player);
    }

    //Matches current bet
    call(player: Player) {
        Betting.call(this, player);
    }

    //Checks without betting additional chips
    check(player: Player) {
        Betting.check(this, player);
    }

    //Raises the current bet amound
    raise(player: Player, amount: number) {
        Betting.raise(this, player, amount);
    }
}