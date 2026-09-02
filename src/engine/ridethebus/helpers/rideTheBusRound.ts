/**
 * Controls the game state 
 * Round progressions, guesses and ressets
 * Does not check guess if the player was correct or not
 */
import { RideTheBus } from "../RideTheBus";
import * as Cards from "./rideTheBusCards";
import * as Rules from "./rideTheBusRules";

//Starts the game
export function start(game: RideTheBus) {
    game.currentRound = 0;
    game.tableCard = [];
    game.revealedCards = [];
    game.currentCard = null;
    game.showCurrentCard = false;
    game.message = "Red or Black";
    game.gameOver = false;
    game.deck.reset();
    game.bettingManager.reset(game.players);
    game.currentBetInput = 0;
    game.betConfirmed = false;
}

//Checks the players guess for the current round
export function guess(game: RideTheBus,guessValue: string) {
    if(game.gameOver) return;
    game.showCurrentCard = true;
    const card = Cards.drawCard(game);
    game.currentCard = card;
    let correct = false;
    //different rules ofr different stages
    switch(game.currentRound) {
        case 0:
            correct = Rules.checkColorGuess(game, card, guessValue as 'red' | 'black');
            break;
        case 1:
            correct = Rules.checkHighlowGuess(game, card, guessValue as 'high' | 'low');
            break;
        case 2:
            correct = Rules.checkInOutGuess(game, card, guessValue as 'in' | 'out');
            break;
        case 3:
            correct = Rules.checkSuitGuess(game, card, guessValue as 'hearts' | 'clubs' | 'diamonds' | 'spades');
            break;
    }
    if(correct) {
        game.revealedCards.push(card);
        game.tableCard.push(card);
        game.currentRound++;
        if(game.currentRound < 4) {
            game.currentCard = null;
            game.showCurrentCard = false;
        }
        //updates stage and display messages
        switch(game.currentRound) {
            case 1:
                game.message = "High or Low";
                break;
            case 2:
                game.message = "Inside or Outside";
                break;
            case 3:
                game.message = "Guess the Suit";
                break;
            case 4:
                game.message = "Congrats! You Win!";
                game.gameOver = true;
                game.currentCard = null;
                break;
        }
    } else {
        game.message =
            "Wrong! Back to the Front of the Bus";
        game.gameOver = true;
    }
}

//Cashes player out, if the player wants to leave in a earlier round
//they collect the money they made up to that round
export function cashOut(game: RideTheBus) {
    const lastStage = game.currentRound - 1;
    if(lastStage >= 0) {
        game.payoutWinners(lastStage);
    }
    game.currentRound = 0;
    game.currentBetInput = 0;
    game.betConfirmed = false;
}

//Restarts game
export function restart(game: RideTheBus) {
    game.start();
    game.currentCard = null;
}