import React, { useState } from "react";
import { createDeck } from "../../models/deck"
import { shuffle } from "../../models/shuffle";
import { card } from "../../models/card";
import CardComponets from "../../models/cardComponets";
import { calculateHand } from "../../games/blackjack/calculateHand";

function App () {
    const [deck, setDeck] = useState<card[]>([]);
    const [player, setPlayer] = useState<card[]>([]);
    const [dealer, setDealer] = useState<card[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState(" ");

    function startGame(){
        const newDeck = shuffle(createDeck());
        const playerHand = [newDeck.pop()!, newDeck.pop()!];
        const dealerHand = [newDeck.pop()!, newDeck.pop()!];
        setDeck(newDeck);
        setPlayer(playerHand);
        setDealer(dealerHand);
    }

    function hit() {
        if(gameOver) return;
        const newDeck = [...deck];
        const newPlayer = [...player, newDeck.pop()!];
        setDeck(newDeck);
        setPlayer(newPlayer);
        if(calculateHand(newPlayer) > 21) {
            setMessage("You Busted!");
            setGameOver(true);
        }
    }

    function stand () {
        if(gameOver) return;
        let newDeck = [...deck];
        let dealerHand = [...dealer];
        const playerScore = calculateHand(player);
        let result = "";
        while (calculateHand(dealerHand) < 17){
            dealerHand.push(newDeck.pop()!);
        }
        const dealerScore = calculateHand(dealer);
        if(dealerScore > 21 || playerScore > dealerScore) {
            result = "You Win";
        }else if (dealerScore > playerScore || playerScore > 21){
            result = "You Lose";
        }else {
            result = "Push"
        }
        setDealer(dealerHand);
        setDeck(newDeck);
        setMessage(result);
        setGameOver(true);
    }

    return (
            <div style={{ padding: 20 }}>
      <h1>Blackjack</h1>

      <button onClick={startGame}>Start Game</button>
      <button onClick={hit}>Hit</button>
      <button onClick={stand}>Stand</button>

      <h2>Dealer ({calculateHand(dealer)})</h2>
      <div style={{ display: "flex" }}>
        {dealer.map((card, i) => (
          <CardComponets key={i} card={card} />
        ))}
      </div>

      <h2>Player ({calculateHand(player)})</h2>
      <div style={{ display: "flex" }}>
        {player.map((card, i) => (
          <CardComponets key={i} card={card} />
        ))}
      </div>

      <h2>{message}</h2>
    </div>
  );
}