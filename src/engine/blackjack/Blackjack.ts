/**
 * The main blackjack game, connects all helpers
 */
import { Game } from "../../core/GameBase";
import { Player } from "../../models/Player";
import { Card } from "../../models/Card";
import { TurnManager } from "../../systems/TurnManager";
import { BettingManager } from "../../systems/BettingManager";
import * as Rules from "./helpers/blackjackRules";
import * as Dealer from "./helpers/blackjackDealer";
import * as Betting from "./helpers/blackjackBetting";
import * as Actions from "./helpers/blackjackActions";
import * as Round from "./helpers/blackjackRound";

export class Blackjack extends Game {
    dealer: Player;
    turns: TurnManager;
    bettingManager: BettingManager;
    currentBetInput: number = 0;
    betConfirmed = true;
    roundOver = false;

    constructor(players: Player[]) {
        super(players);

        this.dealer = new Player("Dealer", 0, false);
        this.turns = new TurnManager(players);
        this.bettingManager = new BettingManager();
    }

    //Starts the game
    start() {
        Round.start(this);
    }

    //Finished the round
    finishRound(): boolean {
        return Round.finishRound(this);
    }

    //Restarts the round
    restartRound(): boolean {
        return Round.restartRound(this);
    }

    //Handles the player's stand action
    playerHit() {
        Round.playerHit(this);
    }

    //Handles the player's stood action
    playerStand() {
        Round.playerStand(this);
    }

    //Checks if all player stood or busted
    allPlayerDone(): boolean {
        return Round.allPlayerDone(this);
    }

    //returns the result of the players hand
    gameResults() {
        return Round.gameResults(this);
    }

    //Starts dealer turn
    dealerTurn() {
        Dealer.dealerTurn(this);
    }

    //Returns dealers score
    getDealerDisplayScore(): string | number {
        return Dealer.getDealerDisplayScore(this);
    }

    //Chnages players bet
    changeBet(amount: number) {
        Betting.changeBet(this, amount);
    }

    //Confrims player bet
    confirmBet() {
        Betting.confirmBet(this);
    }

    //Incharge of paying winners
    payoutWinners() {
        Betting.payoutWinners(this);
    }

    //Incharge of AI
    //No purpose yet
    playTurn(player: Player): void {
        Actions.playTurn(this, player);
    }

    //If player has selected Hit
    hit(player: Player) {
        Actions.hit(this, player);
    }

    //If player has selected stand
    stand(player: Player) {
        Actions.stand(this, player);
    }

    //Checks for a blackjack
    checkBlackjack(player: Player): boolean {
        return Actions.checkBlackjack(this, player);
    }

    //Checks if player can split
    canSplit(player: Player): boolean {
        return Actions.canSplit(this, player);
    }

    //Splits players hand
    split(player: Player) {
        Actions.split(this, player);
    }

    //Get the score of a single card
    getCardValue(card: Card): number {
        return Rules.getCardValue(card);
    }

    //Get the score of the players hand
    getHandScore(hand: Card[]): number {
        return Rules.getHandScore(hand);
    }
}