import { Card, suit, rank } from "./Card";

const suits: suit [] = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks: rank [] =  ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function createDeck(): Card[] {
    const deck: Card[] = [];
    for(const suit of suits){
        for(const rank of ranks){
            let value = 0;
            if(rank === 'A') value = 11;
            else if(rank === 'J' || rank === 'Q'|| rank === 'K') value = 10;
            else value =  parseInt(rank);
            deck.push({ suit, rank, value });
        }
    }
    return deck;
}