/**
 * Handles turn management
 * Controls drawing cards, discarding cards
 * and moving between player turns
 */
import { Rummy } from "../Rummy";
import { Player } from "../../../models/Player";
import * as Rules from "./rummyRules";

//Returns the player whose turn it currently is
export function getCurrentPlayer(game: Rummy): Player {
    return game.players[game.currentPlayerIndex];
}

//Draws top card from the deck
export function drawFromDeck(game: Rummy, player: Player): boolean {
    if (game.gameOver) return false;
    if (game.turnPhase !== "draw") return false;
    const card = game.deck.draw();
    if (!card) return skipWhenDeckEmpty(game, player);
    card.faceUp = true;
    player.drawCard(card);
    Rules.sortHand(game, player);
    game.turnPhase = "play";
    return true;
}

//When the deck is empty every player has the option to pick up or skip
// //if every player skips the round ends
export function skipWhenDeckEmpty(game: Rummy, player: Player): boolean {
    if (game.deck.cards.length > 0) return false;
    if (game.skipPlayers.includes(player)) return false;
    game.skipPlayers.push(player);
    if (game.skipPlayers.length === game.players.length) {
        game.endRound();
        return true;
    }
    game.currentPlayerIndex =
        (game.currentPlayerIndex + 1) % game.players.length;
    game.turnPhase = "draw";
    return true;
}

//Draws top card from discard pile
export function drawFromDiscard(game: Rummy, player: Player): boolean {
    if (game.turnPhase !== "draw") return false;
    const card = game.discardPile.pop();
    if (!card) return false;
    player.drawCard(card);
    Rules.sortHand(game, player);
    game.turnPhase = "play";
    return true;
}

//Takes a card and any cards above it from the discard pile
export function takeFromDiscard(game: Rummy, player: Player, index: number): boolean {
    if (game.turnPhase !== "draw") return false;
    const taken = game.discardPile.splice(index);
    taken.forEach(card => player.drawCard(card));
    Rules.sortHand(game, player);
    //stores the required card that must be used in a meld
    game.requiredMeldCard = taken[0];
    game.lastPickup = {cards: taken, index: index};
    game.turnPhase = "play";
    return true;
}

//Puts all card picked up takeFromDiscard and puts them back
export function undoPickup(game: Rummy, player: Player): boolean {
    if (!game.lastPickup) return false;
    if (game.requiredMeldCard === null) return false;
    const { cards, index } = game.lastPickup;
    //removes picked up cards back from the player's hand
    player.hand = player.hand.filter(card => !cards.includes(card));
    game.discardPile.splice(index, 0, ...cards);
    game.requiredMeldCard = null;
    game.lastPickup = null;
    game.turnPhase = "draw";
    return true;
}

//Places a card into the discard pile and ends the player's turn
export function playerDiscard(game: Rummy, player: Player, index: number): boolean {
    if (game.turnPhase !== "discard") return false;
    if (game.requiredMeldCard) return false;
    const discard = player.hand.splice(index, 1)[0];
    if (!discard) return false;
    game.discardPile.push(discard);
    endTurn(game);
    return true;
}

//Moves player from play pahse to discard
export function finishPlayPhase(game: Rummy) {
    if (game.turnPhase === "play") {
        game.turnPhase = "discard";
    }
}

//Ends the current player's turn and moves to the next player
export function endTurn(game: Rummy) {
    const player = getCurrentPlayer(game);
    if (player.hand.length === 0) {
        game.endRound();
        return;
    }
    game.turnPhase = "draw";
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
}