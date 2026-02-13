import { Card } from '../../models/Card';

export function calculateHand(hand: Card[]): number {
    let total = 0;
    let aceCount = 0;
    for (const Card of hand){
        total += Card.value;
        if(Card.rank === 'A') aceCount++;
    }
    while(total > 21 && aceCount > 0){
        total -= 10;
        aceCount--;
    }
    return total;
}