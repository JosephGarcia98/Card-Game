/**
 * Controls the flow of the game
 * Handles setup, betting rounds, 
 * stage progression, and turn order.
 */
import { Poker } from "../Poker";
import { Player } from "../../../models/Player";

//Starts the game
export function start(game: Poker) {
    if (game.handStarted) return;
    game.handStarted = true;
    game.board = [];
    game.pot = 0;
    game.roundStage = "preflop";
    game.activeBet = game.bigBlind;
    game.lastRaise = game.bigBlind;
    game.playersActed.clear();
    game.currentBetInput = 0;
    //reset all player for a new hand
    for (const player of game.players) {
        player.resetHand();
        player.folded = false;
        player.currentBet = 0;
        player.allIn = false;
        player.totalContribution = 0;
    }
    game.deck.reset();
    game.deck.shuffle();
    game.dealerIndex = (game.dealerIndex + 1) % game.players.length;
    //small and big blind logic
    const smallBlindPlayer = game.players[(game.dealerIndex + 1) % game.players.length];
    const bigBlindPlayer = game.players[(game.dealerIndex + 2) % game.players.length];
    smallBlindPlayer.bankroll.bet(game.smallBlind);
    bigBlindPlayer.bankroll.bet(game.bigBlind);
    smallBlindPlayer.currentBet = game.smallBlind;
    smallBlindPlayer.totalContribution = game.smallBlind;
    bigBlindPlayer.currentBet = game.bigBlind;
    bigBlindPlayer.totalContribution = game.bigBlind;
    game.pot += game.smallBlind + game.bigBlind;
    game.activeBet = game.bigBlind;
    //deal two cards for every player
    for (const player of game.players) {
        for (let i = 0; i < 2; i++) {
            const card = game.deck.draw()!;
            card.faceUp = true;
            player.drawCard(card);
        }
    }
    //start left of big blind
    game.turns.turnIndex = (game.dealerIndex + 3) % game.players.length;
}

//Clears betting information for the next betting round
export function resetBets(game: Poker) {
    game.activeBet = 0;
    game.playersActed.clear();
    for (const player of game.players) {
        player.currentBet = 0;
    }
}

//Advances the game to the next stage
export function advanceStage(game: Poker) {
    if (game.roundStage === "preflop") {
        game.roundStage = "flop";
        game.deck.draw();
        //deals with flops
        for (let i = 0; i < 3; i++) {
            const card = game.deck.draw();
            if (card) {
                card.faceUp = true;
                game.board.push(card);
            }
        }
        advanceTurns(game);
    }
    else if (game.roundStage === "flop") {
        game.roundStage = "turn";
        game.deck.draw();
        const card = game.deck.draw();
        if (card) {
            card.faceUp = true;
            game.board.push(card);
        }
        advanceTurns(game);
    }
    else if (game.roundStage === "turn") {
        game.roundStage = "river";
        game.deck.draw();
        const card = game.deck.draw();
        if (card) {
            card.faceUp = true;
            game.board.push(card);
        }
        advanceTurns(game);
    }
    else if (game.roundStage === "river") {
        game.roundStage = "showdown";
        game.payoutWinners();
    }
}

//Checks if everyone but one player has folded
export function checkForEarlyWinner(game: Poker): Player | null {
    const active = game.players.filter(
        p => !p.folded
    );
    if (active.length === 1) {
        const winner = active[0];
        winner.bankroll.win(game.pot);
        game.pot = 0;
        return winner;
    }
    return null;
}

//moves action to the first active player after the dealer
export function advanceTurns(game: Poker) {
    let index = (game.dealerIndex + 1) % game.players.length;
    while (game.players[index].folded) {
        index = (index + 1) % game.players.length;
    }
    game.turns.turnIndex = index;
}

//Moves to the next eligible player
export function nextTurn(game: Poker) {
    const winner = checkForEarlyWinner(game);
    if (winner) {
        game.roundStage = "showdown";
        return;
    }
    //advance if everyone has completed the betting round
    if (game.isBettingRoundComplete()) {
        advanceStage(game);
        if (game.roundStage !== "showdown") {
            resetBets(game);
        }
    }
    //if every remaining player is all-in, reveal the rest of the board
    const activePlayers = game.players.filter(p => !p.folded);
    if (activePlayers.length > 0 && activePlayers.every(p => p.allIn)) {
        while (game.roundStage !== "showdown") {
            advanceStage(game);
        }
        return;
    }
    //find the next eligible player to play
    let attempts = 0;
    while (attempts < game.players.length) {
        game.turns.turnIndex = (game.turns.turnIndex + 1) % game.players.length;
        const player = game.players[game.turns.turnIndex];
        if (!player.folded && !player.allIn) {
            return;
        }
        attempts++;
    }
    //if not eligible players found end round
    while (game.roundStage !== "showdown") {
        advanceStage(game);
    }
}