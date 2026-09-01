/**
 * Handles the setup, progressions and scoring
 * contorls startinf and restarting game
 * checks for winners
 */
import { Rummy } from "../Rummy";
import * as Rules from "./rummyRules";

//Starts a new game
export function start(game: Rummy) {
    if (game.gameOver) return;
    game.deck.reset();
    game.discardPile = [];
    game.roundOver = false;
    game.skipPlayers = [];
    //clears all hands and melds before dealing a new round
    game.players.forEach(player => {
        player.hand = [];
        player.melds = [];

    });
    //deal 7 cards
    for (let x = 0; x < 7; x++) {
        for (const player of game.players) {
            const card = game.deck.draw();
            if (card) {
                card.faceUp = true;
                player.drawCard(card);
                Rules.sortHand(game, player);
            }
        }
    }
    //place the top card into discard pile
    const firstCard = game.deck.draw();
    if (firstCard) {
        firstCard.faceUp = true;
        game.discardPile.push(firstCard);
    }
}

//Calculates score and check if game has ended
export function endRound(game: Rummy) {
    game.players.forEach(player => {
        const roundScore = calculatePlayerScore(game, player);
        player.score += roundScore;
    });
    checkForWinner(game);
    game.roundOver = true;
    game.turnPhase = "draw";
}

//Calculates a player's score based on melds and remaining cards
export function calculatePlayerScore(game: Rummy, player: any): number {
    let meldPoints = 0;
    let handPoints = 0;
    player.melds.forEach((meld: any) => {
        meld.forEach((card: any) => {
            meldPoints += Rules.getValue(game, card);
        });
    });
    player.hand.forEach((card: any) => {
        handPoints += Rules.getValue(game, card);
    });
    return meldPoints - handPoints;
}

//Checks if any player has reached the winning score
export function checkForWinner(game: Rummy) {
    for (const player of game.players) {
        if (player.score >= game.targerScore) {
            game.gameOver = true;
            game.winner = player;
            return;
        }
    }
}

//Restarts the game back to its starting state and calls starts
export function restartGame(game: Rummy) {
    game.gameOver = false;
    game.winner = null;
    game.roundOver = false;
    game.players.forEach(player => {
        player.score = 0;
        player.hand = [];
        player.melds = [];
    });
    game.currentPlayerIndex = 0;
    game.turnPhase = "draw";
    game.start();
}