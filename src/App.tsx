import React, { useState } from 'react';
import { createDeck } from './models/deck';
import { shuffle } from './models/shuffle';
import CardComponent from './models/cardComponets';
import { card } from './models/card';

function App (){
    const [deck, setDeck] = useState<card[]>(() => shuffle(createDeck()));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Card Game App</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {deck.map((card, index) => (
          <CardComponent key={index} card={card} />
        ))}
      </div>
    </div>
  );
}

export default App;