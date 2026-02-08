import React from 'react';
import {card} from './card';

interface cardProp {
    card: card;
    hidden?: boolean;
}

const CardComponets: React.FC<cardProp> = ({ card, hidden }) => {
    if(hidden){
        return (
        <img 
        src="/cardsPng/back.png" 
        alt="card back" 
        style={{ 
            width: '60px', 
            height: '90px', 
            margin: '4px' 
        }}
        />
    );
}

    const imagePath = `/cardsPng/${card.suit}/${card.rank}.png`;

    return (
        <img
        src = {imagePath} 
        alt={`${card.rank} of ${card.suit}`}
        style = {{
            width: '60px', 
            height: '90px', 
            margin: '4px'             
        }}
        />
    );
};

export default CardComponets;