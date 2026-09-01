/**
 * Controls the AI for Poker
 * Simualtes possible future combinations to estimate 
 * chance of winning
 * Then uses these estimates to mkae a choice
 */
import { Poker } from "../Poker";
import { Player } from "../../../models/Player";
import {Card, Suit, Rank} from "../../../models/Card";

//Possible actions the AI can take 
type PokerAction = {
    action: "fold" | "check" | "call" | "raise";
    raiseAmount?: number;
};

//Stores the results of the simmulation games
type simResults = {
    wins: number;
    losses: number;
    ties: number;
    winRate: number;
    loseRate:number;
    tieRate: number;
    equity: number
};

//Number of hands tested
const SIMULATIONS = 3000;
//Adds a randomness to the AI so its not as predictable 
const RANDOMNESS = 0.15;

//Recives results and picks and acts on a action
//Calls the other methods to brings the whole thing together
export function playTurn(game: Poker, player: Player): void {
    if (game.checkForEarlyWinner()) return;
    if (player.isHuman || player.folded || player.allIn) return;
    const results = simulate(game, player, SIMULATIONS);
    const action = chooseAction(game, player, results);
    game.handleAction(
        player,
        action.action,
        action.raiseAmount ?? 0
    );
    game.nextTurn();
}

//Simualtes 3K possible hand combos
//Returns resultd of these games
//Makes copy of board and plays on the original and restores it once done
function simulate(game: Poker, player: Player, simulations: number): simResults {
    let wins = 0;
    let ties = 0;
    let losses = 0;
    const knownCards = getKnownCards(game);
    for (let simulation = 0; simulation < simulations; simulation++) {
        const deck = createUnknownDeck(knownCards);
        const simOppHand = new Map<Player, Card[]>();
        for (const opponent of game.players) {
            if (opponent === player || opponent.folded) {
                continue;
            }
            const hand: Card[] = [ drawRandomCard(deck), drawRandomCard(deck)];
            simOppHand.set(opponent, hand);
        }
        const simBoard = [...game.board];
        while (simBoard.length < 5) {
            simBoard.push(drawRandomCard(deck));
        }
        //Copy of board is made to not lose it
        const originalBoard = game.board;
        //Copies of the hands
        const originalHands = new Map<Player, Card[]>();
        for (const opponent of game.players) {
            originalHands.set(opponent, opponent.hand);
        }
        try {
            game.board = simBoard;
            const playerScore = game.getBestHand(player);
            let bestOpponentScore = -1;
            for (const [opponent, hand] of simOppHand) {
                opponent.hand = hand;
                const opponentScore = game.getBestHand(opponent);
                if (opponentScore > bestOpponentScore) {
                    bestOpponentScore = opponentScore;
                }
            }
            if (playerScore > bestOpponentScore) {
                wins++;
            } else if (playerScore === bestOpponentScore) {
                ties++;
            } else {
                losses++;
            }
        } finally {
            //Restore the board and hands to return the game to its original state 
            game.board = originalBoard;
            for (const opponent of game.players) {
                const originalHand = originalHands.get(opponent);
                if (originalHand) {
                    opponent.hand = originalHand;
                }
            }
        }
    }
    const winRate = wins / simulations;
    const tieRate = ties / simulations;
    const loseRate = losses / simulations;
    const equity = winRate + (tieRate / 2);
    return {wins, ties, losses, winRate, tieRate, loseRate, equity};
}

//returns array of all knowns cards
function getKnownCards(game: Poker): Card[] {
    const knownCards: Card[] = [];
    for (const player of game.players) {
        knownCards.push(...player.hand);
    }
    knownCards.push(...game.board);
    return knownCards;
}

//Creates a deck containing all cards that are not already known
//if a known card appaers skips it 
//if a card created isnt already known then it is pushed on to a new deck 
//Creates deck from scratch to remove known cards
function createUnknownDeck(knownCards: Card[]): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            const alreadyKnown = knownCards.some(card => card.suit === suit && card.rank === rank);
            if(!alreadyKnown) deck.push(new Card(suit, rank));
        }
    }
    return deck;
}

//Returns a random card
function drawRandomCard(deck: Card[]): Card {
    const index = Math.floor(Math.random() * deck.length);
    const [card] = deck.splice(index, 1);
    return card;
}

//CChose an action and returns in PokerAction
//Picks based off of simResults
function chooseAction(game: Poker, player: Player, results: simResults): PokerAction {
    const equity = results.equity;
    const toCall = Math.max(0, game.activeBet - player.currentBet);
    const balance = player.bankroll.getBalance();
    //Adds a randomness to the AI
    if(Math.random() < RANDOMNESS) return randomAction(game, player, equity, toCall);
    if (toCall === 0) {
        if(equity >= 0.70 && balance >= game.lastRaise) {
            return {action: "raise", raiseAmount: getRaiseAmount(game, player)};
        }
        return { action: "check"};
    }
    //Determines how much to bet
    const potOdds = toCall/(game.pot + toCall);
    if (equity >= 0.70 && balance >= game.lastRaise && equity > potOdds + 0.20) {
        return { action: "raise", raiseAmount: getRaiseAmount(game, player)};
    }
    if (equity >= potOdds) {
        return {action: "call"};
    }
    if (toCall === 0) {
        return{action: "check"}
    }
    return {action: "fold"};
}

//How much the AI should Raise
function getRaiseAmount(game: Poker, player: Player): number {
    const balance = player.bankroll.getBalance();
    if (balance <= 0) {
        return 0;
    }
    let raiseAmount = game.lastRaise * 2;
    raiseAmount = Math.min(raiseAmount, balance);
    if(raiseAmount < game.lastRaise) {
        raiseAmount = game.lastRaise;
    }
    return Math.floor(raiseAmount);
}

//Makes a random moves
//Still based on strength on the player hand
//Possible complete Random actions that ignores logic 
function randomAction(game: Poker, player: Player, equity: number, toCall: number): PokerAction {
    const balance = player.bankroll.getBalance();
    if (Math.random() < RANDOMNESS) {
        return getRandomAction(game, player, toCall);
    }
    if (equity >= 0.80) {
        if (balance >= game.lastRaise && Math.random() < 0.70) {
            return {action: "raise", raiseAmount: getRaiseAmount(game, player)};
        }
        if (toCall > 0) {
            return {action: "call"};
        }
        return {action: "check"};
    }
    if (equity >= 0.40) {
        const options: PokerAction[] = [];
        if (toCall > 0) {
            options.push({action: "call"});
        } else {
            options.push({action: "check"});
        }
        if (balance >= game.lastRaise) {
            options.push({action: "raise", raiseAmount: getRaiseAmount(game, player)});
        }
        if (toCall > 0) {
            options.push({action: "fold"});
        }
        return options[Math.floor(Math.random() * options.length)];
    }
    if (balance >= game.lastRaise && Math.random() < 0.35) {
        return {action: "raise", raiseAmount: getRaiseAmount(game, player)};
    }
    if (toCall === 0) {
        return {action: "check"};
    }
    return {action: "fold"};
}

//15% Chances the AI ignores all logic
//Records all possible actions that are avaliable 
//Once all options are recorded one is randomly picked
function getRandomAction(game: Poker, player: Player, toCall: number): PokerAction {
    const balance = player.bankroll.getBalance();
    const options: PokerAction[] = [];
    if (toCall === 0) {
        options.push({action: "check"});
    } else {
        options.push({action: "call"});
        options.push({action: "fold"});
    }
    if (balance >= game.lastRaise) {
        options.push({
            action: "raise",
            raiseAmount: getRaiseAmount(game, player)
        });
    }
    return options[Math.floor(Math.random() * options.length)];
}