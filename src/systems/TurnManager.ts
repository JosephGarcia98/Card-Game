/**
 * Controls turn order for all players in a game
 * Keeps track of turns and players state
 */
import { Player } from '../models/Player';

export class TurnManager {
    players: Player[];
    turnIndex: number = 0;

    constructor(players: Player[]) {
        this.players = players;
    }

    //return the players of the current active turn
    get currentPlayer(): Player {
        return this.players[this.turnIndex];
    }

    /**
     * advances the turn
     * skips players who have stood, busted or folded
     * tracks to prevent infinte looping 
     */
    nextTurn(): void {
        let tracker = 0;
        do {
            this.turnIndex = (this.turnIndex + 1) % this.players.length;
            tracker++;
        } while (
            (this.players[this.turnIndex].hasStood || this.players[this.turnIndex].isBusted || this.players[this.turnIndex].folded)
            &&
            tracker < this.players.length);
        }

    //return index to first player
    reset(): void {
        this.turnIndex = 0;
    }
}