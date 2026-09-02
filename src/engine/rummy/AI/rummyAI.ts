/**
 * Controls the AI for Rummy
 * Simulates possible future game states to estimate
 * which actions will give the AI the best position
 * Then uses these estimates to make a choice
 */
import { Rummy } from "../Rummy";
import { Player } from "../../../models/Player";
import {Card, Suit, Rank} from "../../../models/Card";

//Possible actions the AI can take
type RummyAction =
    | { action: "drawDeck" }
    | { action: "drawDiscard" }
    | { action: "playMeld"; indices: number[] }
    | { action: "addToMeld"; meldIndex: number; cardIndex: number }
    | { action: "discard"; index: number };

//Number of simulated actions tested
const SIMULATIONS = 3000;

//Receives the game and player and controls the AI's turn
//Calls the other methods to bring the whole thing together
export function playTurn(game: Rummy, player: Player): void {
    if (player.isHuman) return;
    if (game.gameOver) return;
    if (game.roundOver) return;
    if (game.getCurrentPlayer() !== player) return;
    //Draw phase
    if (game.turnPhase === "draw") {
        if (game.deck.cards.length === 0) {
            game.skipWhenDeckEmpty(player);
            return;
        }
        const drawn = performAIDraw(game, player);
        if (!drawn) {
            if (game.deck.cards.length === 0) {
                game.skipWhenDeckEmpty(player);
            }
            return;
        }
    }
    //Finds and plays the best available melds
    if (game.turnPhase === "play" && !game.gameOver && !game.roundOver) {
        while (game.turnPhase === "play" && !game.gameOver && !game.roundOver) {
            const actions = generateMeldActions(game, player);
            if (actions.length === 0) break;
            const action = chooseAction(game, player, actions);
            if (!action) break;
            const success = executeAction(game, player, action);
            //Tries another valid action if the chosen one fails
            if (!success) {
                const fallback = actions.find(candidate => candidate !== action);
                if (!fallback) break;
                const fallbackSuccess = executeAction(game, player, fallback);
                if (!fallbackSuccess) break;
            }
        }
        if (game.turnPhase === "play" && !game.gameOver && !game.roundOver) {
            game.finishPlayPhase();
        }
    }
    //Discard phase
    if (game.turnPhase === "discard" && !game.gameOver && !game.roundOver) {
        performAIDiscard(game, player);
    }
}

//Attempts to draw a card
//Prefers the discard pile when the card can help make a meld
function performAIDraw(game: Rummy, player: Player): boolean {
    if (game.discardPile.length > 0) {
        const topDiscard = game.discardPile[game.discardPile.length - 1];
        if (isUsefulDiscard(game, player, topDiscard)) {
            if (game.drawFromDiscard(player)) return true;
        }
    }
    if (game.deck.cards.length > 0) {
        if (game.drawFromDeck(player)) return true;
    }
    if (game.discardPile.length > 0) {
        if (game.drawFromDiscard(player)) return true;
    }
    return false;
}

//Checks if a discard could help create a set or run
function isUsefulDiscard(game: Rummy, player: Player, discard: Card): boolean {
    for (const card of player.hand) {
        if (card.rank === discard.rank) return true;
        if (card.suit === discard.suit) {
            const difference = Math.abs(game.getOrder(card) - game.getOrder(discard));
            if (difference <= 2) return true;
        }
    }
    return false;
}

//Finds all possible new melds and cards that can be added to existing melds
function generateMeldActions(game: Rummy, player: Player): RummyAction[] {
    const actions: RummyAction[] = [];
    //Checks every combination of three cards for a valid set or run
    for (let i = 0; i < player.hand.length; i++) {
        for (let j = i + 1; j < player.hand.length; j++) {
            for (let k = j + 1; k < player.hand.length; k++) {
                const indices = [i, j, k];
                const cards = [player.hand[i], player.hand[j], player.hand[k]];
                const valid = game.checkSet(cards) || game.checkRun(cards);
                if (!valid) continue;
                //Required meld cards must be included in the meld
                if (game.requiredMeldCard && !cards.some(card => card === game.requiredMeldCard)) {
                    continue;
                }
                actions.push({action: "playMeld", indices});
            }
        }
    }

    //Checks if a card can be added to an existing meld
    for (let meldIndex = 0; meldIndex < player.melds.length; meldIndex++) {
        const meld = player.melds[meldIndex];
        for (let cardIndex = 0; cardIndex < player.hand.length; cardIndex++) {
            const card = player.hand[cardIndex];
            const newMeld = [...meld, card];
            const valid = game.checkSet(newMeld) || game.checkRun(newMeld);
            if (!valid) continue;
            actions.push({action: "addToMeld", meldIndex, cardIndex});
        }
    }
    return actions;
}

//Simulates available actions and picks the one with the highest score
function chooseAction(game: Rummy, player: Player, actions: RummyAction[]): RummyAction | null {
    if (actions.length === 0) return null;
    if (actions.length === 1) return actions[0];
    let bestAction = actions[0];
    let bestScore = -Infinity;
    let simulations = 0;
    while (simulations < SIMULATIONS) {
        for (const action of actions) {
            if (simulations >= SIMULATIONS) break;
            const score = simulateAction(game, player, action);
            simulations++;
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }
    }
    if (simulations === 0 || !Number.isFinite(bestScore)) {
        return actions[0];
    }
    return bestAction;
}

//Creates a copy of the game, performs the action, and evaluates the result
function simulateAction(game: Rummy, player: Player, action: RummyAction): number {
    let simGame: Rummy;
    try {
        simGame = cloneGame(game, player);
    } catch {
        return -1000;
    }
    const simPlayer = simGame.players.find(p => p.name === player.name);
    if (!simPlayer) return -1000;
    try {
        const success = executeAction(simGame, simPlayer, action);
        if (!success) return -1000;
        return simulateFutureState(simGame, simPlayer);
    } catch {
        return -1000;
    }
}

//Simulates future turns to see how the selected action affects the game
function simulateFutureState(game: Rummy, player: Player): number {
    if (game.gameOver || game.roundOver) {
        return evaluatePosition(game, player);
    }
    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer) return evaluatePosition(game, player);
    //Simulates the AI player's future turn
    if (currentPlayer.name === player.name) {
        if (game.turnPhase === "draw") {
            const success = performSimulatedDraw(game, currentPlayer);
            if (!success) return evaluatePosition(game, player);
        }
        if (game.turnPhase === "play") {
            const actions = generateMeldActions(game, currentPlayer);
            //Random future actions create different possible game states
            if (actions.length > 0) {
                const action = actions[Math.floor(Math.random() * actions.length)];
                executeAction(game, currentPlayer, action);
            }
            if (game.turnPhase === "play") {
                game.finishPlayPhase();
            }
        }
        if (game.turnPhase === "discard") {
            performSimulatedDiscard(game, currentPlayer);
        }
    } else {
        simulateOpponentTurn(game, currentPlayer);
    }
    return simulateFutureState(game, player);
}

//Simulates drawing during future turns
function performSimulatedDraw(game: Rummy, player: Player): boolean {
    if (game.discardPile.length > 0) {
        const discard = game.discardPile[game.discardPile.length - 1];
        if (isUsefulDiscard(game, player, discard)) {
            if (game.drawFromDiscard(player)) return true;
        }
    }
    if (game.deck.cards.length > 0) {
        if (game.drawFromDeck(player)) return true;
    }
    if (game.discardPile.length > 0) {
        if (game.drawFromDiscard(player)) return true;
    }
    return false;
}

//Simulates an opponent's turn with randomized decisions
function simulateOpponentTurn(game: Rummy, player: Player): void {
    if (game.turnPhase === "draw") {
        performSimulatedDraw(game, player);
    }
    if (game.turnPhase === "play") {
        const actions = generateMeldActions(game, player);
        if (actions.length > 0) {
            const action = actions[Math.floor(Math.random() * actions.length)];
            executeAction(game, player, action);
        }
        if (game.turnPhase === "play") {
            game.finishPlayPhase();
        }
    }
    if (game.turnPhase === "discard") {
        performSimulatedDiscard(game, player);
    }
}

//Discards a card during simulations
function performSimulatedDiscard(game: Rummy, player: Player): boolean {
    if (player.hand.length === 0) return false;
    const index = getBestDiscard(game, player);
    if (index < 0 || index >= player.hand.length) return false;
    if (game.playerDiscard(player, index)) return true;
    for (let i = 0; i < player.hand.length; i++) {
        if (game.playerDiscard(player, i)) return true;
    }
    return false;
}

//Chooses and discards the card with the lowest discard score
function performAIDiscard(game: Rummy, player: Player): boolean {
    if (player.hand.length === 0) return false;
    const preferred = getBestDiscard(game, player);
    if (preferred >= 0 && preferred < player.hand.length) {
        if (game.playerDiscard(player, preferred)) return true;
    }
    for (let i = 0; i < player.hand.length; i++) {
        if (i === preferred) continue;
        if (game.playerDiscard(player, i)) return true;
    }
    return false;
}

//Finds the card with the lowest discard score
function getBestDiscard(game: Rummy, player: Player): number {
    if (player.hand.length === 0) return -1;
    let bestIndex = 0;
    let lowestScore = Infinity;
    for (let i = 0; i < player.hand.length; i++) {
        const card = player.hand[i];
        let score = game.getValue(card);
        score -= getCardPotential(game, player, card);
        if (score < lowestScore) {
            lowestScore = score;
            bestIndex = i;
        }
    }
    return bestIndex;
}

//Calculates how much potential a card has for a future set or run
function getCardPotential(game: Rummy, player: Player, card: Card): number {
    let potential = 0;
    for (const other of player.hand) {
        if (other === card) continue;
        if (card.rank === other.rank) {
            potential += 3;
        }
        if (card.suit === other.suit) {
            const difference = Math.abs(game.getOrder(card) - game.getOrder(other));
            if (difference === 1) {
                potential += 4;
            } else if (difference === 2) {
                potential += 2;
            }
        }
    }
    return potential;
}

//Executes the selected AI action
function executeAction(game: Rummy, player: Player, action: RummyAction): boolean {
    try {
        switch (action.action) {
            case "drawDeck":
                return game.drawFromDeck(player);

            case "drawDiscard":
                return game.drawFromDiscard(player);

            case "playMeld":
                return game.playMeld(player, action.indices);

            case "addToMeld":
                return game.addToMeld(player, action.meldIndex, action.cardIndex);

            case "discard":
                return game.playerDiscard(player, action.index);

            default:
                return false;
        }
    } catch {
        return false;
    }
}

//Scores the current position
//Higher score means the AI is in a better position
//Rewards cards in melds and cards with future meld potential
//Penalizes cards still remaining in the hand
function evaluatePosition(game: Rummy, player: Player): number {
    let score = 0;
    for (const meld of player.melds) {
        score += meld.reduce((total, card) => total + game.getValue(card), 0);
        score += meld.length * 3;
    }
    score -= player.hand.length * 8;
    for (let i = 0; i < player.hand.length; i++) {
        const card = player.hand[i];
        for (let j = i + 1; j < player.hand.length; j++) {
            const other = player.hand[j];
            if (card.rank === other.rank) {
                score += 3;
            }
            if (card.suit === other.suit) {
                const difference = Math.abs(game.getOrder(card) - game.getOrder(other));
                if (difference === 1) {
                    score += 5;
                } else if (difference === 2) {
                    score += 2;
                }
            }
        }
    }
    return score;
}

//Creates a copy of the game for simulations
//Keeps the AI's cards known while randomly assigning unknown cards
//to opponents and the simulated deck
function cloneGame(game: Rummy, perspectivePlayer: Player): Rummy {
    const knownCards = getKnownCards(game, perspectivePlayer);
    const unknownCards = createUnknownDeck(knownCards);
    shuffleCards(unknownCards);
    const clonedPlayers = game.players.map(original => {
        const cloned = new Player(original.name, 0, original.isHuman);
        cloned.score = original.score;
        cloned.folded = original.folded;
        cloned.currentBet = original.currentBet;
        cloned.hasStood = original.hasStood;
        cloned.isBusted = original.isBusted;
        cloned.allIn = original.allIn;
        cloned.totalContribution = original.totalContribution;
        if (original === perspectivePlayer) {
            cloned.hand = [...original.hand];
        } else {
            cloned.hand = [];
        }
        cloned.melds = original.melds.map(meld => [...meld]);
        return cloned;
    });
    const simGame = new Rummy(clonedPlayers);
    simGame.discardPile = [...game.discardPile];
    simGame.targerScore = game.targerScore;
    simGame.roundOver = game.roundOver;
    simGame.turnPhase = game.turnPhase;
    simGame.currentPlayerIndex = game.currentPlayerIndex;
    simGame.gameOver = game.gameOver;
    simGame.winner = null;
    simGame.requiredMeldCard = game.requiredMeldCard;
    simGame.lastPickup = game.lastPickup
        ? {
            cards: [...game.lastPickup.cards],
            index: game.lastPickup.index
        }
        : null;
    //Opponent hands are hidden, so unknown cards are randomly dealt
    for (const original of game.players) {
        if (original === perspectivePlayer) continue;
        const cloned = simGame.players.find(p => p.name === original.name);
        if (!cloned) continue;
        for (let i = 0; i < original.hand.length; i++) {
            if (unknownCards.length === 0) break;
            const randomIndex = Math.floor(Math.random() * unknownCards.length);
            const [card] = unknownCards.splice(randomIndex, 1);
            if (card) cloned.hand.push(card);
        }
    }
    //Any unknown cards left become the simulated deck
    simGame.deck.cards = unknownCards;
    return simGame;
}

//Gets every card visible to the AI
function getKnownCards(game: Rummy, player: Player): Card[] {
    const known: Card[] = [];
    known.push(...player.hand);
    for (const meld of player.melds) {
        known.push(...meld);
    }
    for (const opponent of game.players) {
        if (opponent === player) continue;
        for (const meld of opponent.melds) {
            known.push(...meld);
        }
    }
    known.push(...game.discardPile);
    return known;
}

//Creates a standard 52 card deck and removes known cards
function createUnknownDeck(knownCards: Card[]): Card[] {
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            const alreadyKnown = knownCards.some(card => card.suit === suit && card.rank === rank);
            if (!alreadyKnown) {
                deck.push(new Card(suit, rank));
            }
        }
    }
    return deck;
}

//Randomizes the cards using Fisher-Yates
function shuffleCards(cards: Card[]): void {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}