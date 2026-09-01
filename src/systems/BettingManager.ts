/**
 * Manages all the betting for the games
 * Tracks the pot and active bets
 */
import { Player } from '../models/Player';

export class BettingManager {
    pot: number = 0;
    activeBet: number = 0;

    //adds chips the the pot for poker
    //allows them to bet for blackjack and riide the bus
    placeBet(player: Player, amount: number): void {
        player.bankroll.bet(amount); 
        player.currentBet += amount;
        this.pot += amount;
    }

    //matches the active bet
    call(player: Player): void {
        const toCall = this.activeBet - player.currentBet;
        if (toCall > 0) {
            this.placeBet(player, toCall);
        }
    }

    //increases the active bet
    raise(player: Player, raiseAmount: number): void {
        const totalBet = (this.activeBet - player.currentBet) + raiseAmount;
        this.placeBet(player, totalBet);
        this.activeBet = player.currentBet;
    }

    //resets pot and active bet
    reset(players: Player[]): void {
        this.pot = 0;
        this.activeBet = 0;
        players.forEach(p => p.currentBet = 0);
    }
}