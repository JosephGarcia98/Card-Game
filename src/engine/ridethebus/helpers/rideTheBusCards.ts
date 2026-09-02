/**
 * Hnadles the cards and deck management
 */
import { RideTheBus } from "../RideTheBus";
import { Card } from "../../../models/Card";

//Draws a card and resets the deck
export function drawCard(game: RideTheBus): Card {
    let card = game.deck.draw();
    //If there is no card reset the deck
    if (!card) {
        game.deck.reset();
        card = game.deck.draw();
    }
    //Error throw if deck reset failed
    if (!card) {
        throw new Error("Deck Reset Failed");
    }
    card.faceUp = true;
    return card;
}