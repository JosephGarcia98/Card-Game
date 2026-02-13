import React from 'react';
import { Card } from './Card';

interface cardProp {
    card: Card;
    hidden?: boolean;
}

const CardComponets: React.FC<cardProp> = ({ card, hidden = false }) => {
    return (
    <div style={{ width: 100, height: 140, marginRight: -40, perspective: 600 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s",
          transform: hidden ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <img
          src={`/cardsPNG/${card.suit}/${card.rank}.png`}
          alt={`${card.value} of ${card.suit}`}
          style={{
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            borderRadius: 10,
          }}
        />
        <img
          src="/cardsPNG/back.png"
          alt="Card back"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            backfaceVisibility: "hidden",
            borderRadius: 10,
            transform: "rotateY(180deg)",
          }}
        />
      </div>
    </div>
  );
};

export default CardComponets;