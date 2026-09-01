/**
 * Base class and Foundation to all of my games
 * Provides shared functionality such as player management,
 * turn handling, card dealing, and deck management
 */
import { Deck } from '../models/Deck';
import { Player } from '../models/Player';
import { TurnManager } from '../systems/TurnManager';

export abstract class Game {
    players: Player[] = [];
    turnManager: TurnManager;
    deck: Deck;

    constructor(players: Player[]) {
        this.players = players;
        this.turnManager = new TurnManager(players);
        this.deck = new Deck();
    }

    //return the player of the current turn
    getCurrentPlayer(): Player {
        return this.turnManager.currentPlayer;
    }

    //advances to the next turn
    nextTurn(): void {
        this.turnManager.nextTurn();
    }

    //deal a single card to a single player
    dealCardToPlayer(player: Player): void {
        const card = this.deck.draw();
        if (card) player.drawCard(card);
    }

    //calls the deck class for a reset
    resetDeck(): void {
        this.deck.reset();
    }

    //starts the game and sets evreything up
    abstract start(): void;
    
    //meant for non-player to play its turn
    abstract playTurn(player: Player): void;
}