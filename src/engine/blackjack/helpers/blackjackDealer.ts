/**
 * Handles the dealer's actions and displayed hand value
 */
import { Blackjack } from "../Blackjack";
import { getHandScore } from "./blackjackRules";

//Starts the dealers turn
export function dealerTurn(game: Blackjack) {
    //Reveal all face down cards
    for (const card of game.dealer.hand) {
        card.faceUp = true;
    }
    //Keeps drawing until they hit 17 or more
    while (getHandScore(game.dealer.hand) < 17) {
        const card = game.deck.draw()!;
        card.faceUp = true;
        game.dealer.drawCard(card);
    }
}

//Shows the dealers visible score while hiding face-down cards
export function getDealerDisplayScore(game: Blackjack): string | number {
    const hiddenCard = game.dealer.hand.find(card => !card.faceUp);
    //show the full score once all cards are revealed
    if (!hiddenCard) return getHandScore(game.dealer.hand);
    const score = getHandScore(game.dealer.hand.filter(card => card.faceUp));
    return `${score} + ?`;
}