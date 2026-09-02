/**
 * Incharge of chips
 * Betting and payouts for Blackjack
 * Bet validation, confirmation
 */
import { Blackjack } from "../Blackjack";

//Confirms how much the player has bet
export function changeBet(game: Blackjack, amount: number) {
    game.currentBetInput += amount;
    //prevents player from betting 0
    if (game.currentBetInput < 0) {
        game.currentBetInput = 0;
    }
    //prevents player from betting more then they have
    const max = game.turns.currentPlayer.bankroll.getBalance();
    if (game.currentBetInput > max) {
        game.currentBetInput = max;
    }
    game.currentBetInput = Math.floor(game.currentBetInput);
}

//Locks in bet and starts round
export function confirmBet(game: Blackjack) {
    const player = game.turns.currentPlayer;
    if (game.currentBetInput <= 0) {
        return;
    }
    game.bettingManager.placeBet(
        player,
        game.currentBetInput
    );
    game.currentBetInput = 0;
    game.betConfirmed = true;
    //Reveal players card once a bet is confirmed
    player.hand.forEach(card => card.faceUp = true);
    //Starts game is player made a vlid bet
    if (game.players.every(p => p.hasStood || game.betConfirmed)) {
        game.dealer.hand.forEach((card, i) => {
            card.faceUp = i === 0;
        });
        //End the game if dealer has 21
        if (game.getHandScore(game.dealer.hand) === 21) {
            game.dealer.hand.forEach(
                card => card.faceUp = true
            );
            game.players.forEach(
                p => p.hasStood = true
            );
        }
    }
}

//Pays out winnings based on the result of each hand
export function payoutWinners(game: Blackjack) {
    const results = game.gameResults();
    results.forEach((result, index) => {
        const player = game.players[index];
        if (result === "blackjack") {
            player.bankroll.win(
                player.currentBet * 2.5
            );
        }
        else if (result === "win") {
            player.bankroll.win(
                player.currentBet * 2
            );
        }
        else if (result === "push") {
            player.bankroll.win(
                player.currentBet
            );
        }
    });
    //reset the pot for the next round
    game.bettingManager.pot = 0;
}