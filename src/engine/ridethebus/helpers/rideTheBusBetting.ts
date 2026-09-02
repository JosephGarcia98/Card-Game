/**
 * Incharge of chips
 * Betting and payouts for Ride the bus
 * Bet validation, confirmation, and round rewards
 */
import { RideTheBus } from "../RideTheBus";

//Changes the player's current bet amount
export function changeBet(game: RideTheBus, amount: number) {
    const player = game.players[0];
    game.currentBetInput += amount;
    //prevents player from betting 0
    if(game.currentBetInput < 0) return;
    //prevents player from betting more then they have
    const max = player.bankroll.getBalance();
    if(game.currentBetInput > max) {
        game.currentBetInput = max;
    }
    game.currentBetInput = Math.floor(game.currentBetInput);
}

//Locks in bet and starts the game
export function confirmBet(game: RideTheBus) {
    const player = game.players[0];
    if(game.currentBetInput <= 0)  return;
    game.bettingManager.placeBet(player, game.currentBetInput);
    game.currentBetInput = 0;
    game.betConfirmed = true;
}

//Pays the player based on the round they finished
export function payoutWinners(game: RideTheBus,stage: number) {
    const player = game.players[0];
    let multiplier = 0;
    //sets the payout multiplier based on the current round
    switch(game.currentRound) {
        case 0:
            multiplier = 2;
            break;
        case 1:
            multiplier = 2;
            break;
        case 2:
            multiplier = 3;
            break;
        case 3:
            multiplier = 4;
            break;
    }
    player.bankroll.win(player.currentBet * multiplier);
    player.currentBet = 0;
    game.bettingManager.pot = 0;
}