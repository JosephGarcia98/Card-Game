/**
 * Handles player and the dealers actions 
 * Incldues turn behvior and hand management
 */

import { Blackjack } from "..//Blackjack";
import { Player } from "../../../models/Player";

//Controls AI logic
//No purpose until more players can be added
export function playTurn(game: Blackjack, player: Player): void {
    if (player.isHuman) return;
    const upCard = game.dealer.hand[0];
    const dealerValue = game.getCardValue(upCard);
    while (true) {
        const playerValue = game.getHandScore(player.hand);
        if (playerValue >= 21) break;
        if (playerValue <= 11) {
            player.drawCard(
                game.deck.draw()!
            );
        }
        else if (playerValue >= 12 && playerValue <= 16) {
            if (dealerValue >= 7) {
                player.drawCard(
                    game.deck.draw()!
                );
            }
            else {
                break;
            }
        }
        else {
            break;
        }
    }
}

//Draws a card and checks for a bust 
export function hit(game: Blackjack, player: Player) {
    const card = game.deck.draw();
    if (!card) return;
    card.faceUp = true;
    player.drawCard(card);
    if (
        game.getHandScore(player.hand) > 21
    ) {
        player.isBusted = true;
        game.turns.nextTurn();
    }
}

//Ends the players turn
export function stand(game: Blackjack, player: Player) {
    player.hasStood = true;
    game.turns.nextTurn();
}

//Checks if for a turn 1 blackjack
export function checkBlackjack(game: Blackjack, player: Player): boolean {
    if (game.getHandScore(player.hand) !== 21) {
        return false;
    }
    player.hasStood = true;
    if (player !== game.dealer) {
        game.turns.nextTurn();
    }
    return true;
}

//Checks if player can split, 2 cards of the same rank
export function canSplit(game: Blackjack,player: Player): boolean {
    return player.isHuman && player.hand.length === 2 && player.hand[0].rank === player.hand[1].rank;
}

//Splits the two cards into two hand 
export function split(game: Blackjack, player: Player) {
    if (!canSplit(game, player)) return;
    const cardToMove = player.hand.pop()!;
    const splitHand =
        new Player(
            `${player.name} (Split)`,
            player.bankroll.getBalance(),
            player.isHuman
        );
    splitHand.drawCard(cardToMove);
    const card1 = game.deck.draw()!;
    const card2 = game.deck.draw()!;
    card1.faceUp = true;
    card2.faceUp = true;
    player.drawCard(card1);
    splitHand.drawCard(card2);
    const index = game.players.indexOf(player);
    game.players.splice(index + 1, 0, splitHand);
    game.turns.players = game.players;
    checkBlackjack(game, player);
    checkBlackjack(game, splitHand);
}