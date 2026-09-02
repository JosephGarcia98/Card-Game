/**
 * Controls the flow of the game
 * In charge of setup, player actions and flow of rounds
 */
import { Blackjack } from "../Blackjack";

//Start a new round and deals eveyrone 2 cards
//dealer get 1 card face down
export function start(game: Blackjack) {
    game.deck.reset();
    game.turns.reset();
    game.bettingManager.reset(game.players);
    game.currentBetInput = 0;
    game.betConfirmed = false;
    game.roundOver = false;
    for (const player of game.players) {
        player.resetHand();
        player.hasStood = false;
        player.isBusted = false;
    }
    game.dealer.resetHand();
    for (const player of game.players) {
        const card1 = game.deck.draw()!;
        const card2 = game.deck.draw()!;
        card1.faceUp = false;
        card2.faceUp = false;
        player.drawCard(card1);
        player.drawCard(card2);
    }
    const cardUp = game.deck.draw()!;
    const cardDown = game.deck.draw()!;
    cardUp.faceUp = false;
    cardDown.faceUp = false;
    game.dealer.drawCard(cardUp);
    game.dealer.drawCard(cardDown);
    //end the round if dealer has 21
    if (game.getHandScore(game.dealer.hand) === 21) {
        cardDown.faceUp = true;
        game.players.forEach(
            player => player.hasStood = true
        );
    }
}

//Checks if all players have stood or busted
export function allPlayerDone(game: Blackjack): boolean {
    return game.players.every(
        player => player.hasStood || player.isBusted
    );
}

//Determine is player wins,loses or blackjack
export function gameResults(game: Blackjack): string[] {
    const dealerScore =
        game.getHandScore(game.dealer.hand);
    return game.players.map(player => {
        const playerScore =
            game.getHandScore(player.hand);
        if (playerScore === 21) return "blackjack";
        if (playerScore > 21) return "lose";
        if (dealerScore > 21) return "win";
        if (playerScore > dealerScore) return "win";
        if (dealerScore > playerScore) return "lose";
        return "push";
    });

}

//Finished the round whhen all players are done
export function finishRound(game: Blackjack): boolean {
    if (!allPlayerDone(game)) return false;
    game.dealerTurn();
    game.checkBlackjack(game.dealer);
    game.payoutWinners();
    game.roundOver = true;
    return true;
}

//Restarts the same by calling start
export function restartRound(game: Blackjack): boolean {
    game.players = game.players.filter(player => !player.name.includes("(Split)"));
    game.turns.players = game.players;
    start(game);
    return game.getHandScore(game.dealer.hand) === 21;
}

//Handles the player's hit action
export function playerHit(game: Blackjack) {
    if (game.roundOver) return;
    const player = game.turns.currentPlayer;
    game.hit(player);
    game.checkBlackjack(player);
    finishRound(game);
}

//Handles the player's stood action
export function playerStand(game: Blackjack) {
    if (game.roundOver) return;
    const player = game.turns.currentPlayer;
    game.stand(player);
    finishRound(game);
}