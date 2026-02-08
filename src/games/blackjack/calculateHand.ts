import { card } from '../../models/card';

export function calculateHand(hand: card[]): number {
    let total = 0;
    let aceCount = 0;
    for (const card of hand){
        total += card.value;
        if(card.rank === 'A') aceCount++;
    }
    while(total > 21 && aceCount > 0){
        total -= 10;
        aceCount--;
    }
    return total;
}