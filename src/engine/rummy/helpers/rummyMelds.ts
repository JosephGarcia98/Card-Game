/**
 * Handles melds
 * Checks and plays if player can place
 * or add to meld
 */
import { Rummy } from "../Rummy";
import { Player } from "../../../models/Player";
import * as Rules from "./rummyRules";

//Creates a new meld from selected cards in the players hand
export function playMeld(game: Rummy, player: Player, indices: number[]): boolean {
    if (game.turnPhase !== "play") return false;
    if (indices.length === 0) return false;
    const selected = indices.map(i => player.hand[i]);
    //checks if set is valid or not
    const valid = Rules.checkSet(game, selected) || Rules.checkRun(game, selected);
    if (!valid) return false;
    //checks if the required card is included before allowing the meld
    if (game.requiredMeldCard) {
        const includesRequired = selected.includes(game.requiredMeldCard);
        if (!includesRequired) return false;
    }
    player.melds.push(selected);
    //remove played cards from the player's hand
    player.hand = player.hand.filter((_, i) => !indices.includes(i));
    game.requiredMeldCard = null;
    return true;
}

//Adds a card from the player's hand to an existing meld
export function addToMeld(game: Rummy, player: Player, meldIndex: number, cardIndex: number): boolean {
    if (game.turnPhase !== "play") return false;
    const meld = player.melds[meldIndex];
    const card = player.hand[cardIndex];
    if (!meld || !card) return false;
    const newMeld = [...meld, card];
    //checks if the meld remains valid after adding the card
    const valid = Rules.checkSet(game, newMeld) || Rules.checkRun(game, newMeld);
    if (!valid) return false;
    if (game.requiredMeldCard && card === game.requiredMeldCard) {
        game.requiredMeldCard = null;
    }
    meld.push(card);
    player.hand.splice(cardIndex, 1);
    return true;
}