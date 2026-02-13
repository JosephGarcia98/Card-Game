export type suit = 'hearts' | 'clubs' | 'diamonds' | 'spades';
export type rank = 'A' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    suit: suit;
    rank: rank;
    value: number;
}