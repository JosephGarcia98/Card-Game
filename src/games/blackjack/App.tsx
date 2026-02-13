import React, { useState } from "react";
import { createDeck } from "../../models/deck"
import { shuffle } from "../../models/shuffle";
import { Card } from "../../models/Card";
import CardComponets from "../../models/cardComponets";
import { calculateHand } from "../../games/blackjack/calculateHand";

const App: React.FC = () => {
    const [deck, setDeck] = useState<Card[]>([]);
    const [player, setPlayer] = useState<Card[]>([]);
    const [dealer, setDealer] = useState<Card[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState(" ");
    const [dealerRev, setDealerRev] = useState(false);

    function startGame(){
        const newDeck = shuffle(createDeck());
        const playerHand = [newDeck.pop()!, newDeck.pop()!];
        const dealerHand = [newDeck.pop()!, newDeck.pop()!];
        setDeck(newDeck);
        setPlayer(playerHand);
        setDealerRev(false);
        setDealer(dealerHand);
        const playerScore = calculateHand(playerHand);
        const dealerScore = calculateHand(dealerHand);
        if(playerScore === 21 || dealerScore === 21){
            setDealerRev(true);
            if(playerScore === 21 && dealerScore === 21)
                setMessage("Both Have Blackjack! Push")
            if(playerScore === 21)
                setMessage("Blackjack! You Win!")
            if(dealerScore === 21)
                setMessage("Dealer Blackjack! You Lose");
            setGameOver(true);
        }else {
            setGameOver(false);
            setMessage("");
        }
    }

    function hit() {
        if(gameOver) return;
        const newDeck = [...deck];
        const newPlayer = [...player, newDeck.pop()!];
        setDeck(newDeck);
        setPlayer(newPlayer);
        if(calculateHand(newPlayer) > 21) {
            setDealerRev(true);
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
        setDealerRev(true);
        while (calculateHand(dealerHand) < 17){
            dealerHand.push(newDeck.pop()!);
        }
        const dealerScore = calculateHand(dealerHand);
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
  <div
    style={{
      backgroundColor: "#0B6623", // casino green
      padding: 20,
      borderRadius: 15,
      boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      color: "#fff",
      fontFamily: "sans-serif",
    }}
  >
    <h1 style={{ textAlign: "center", marginBottom: 20 }}>🃏Blackjack🃏</h1>
    <div style={{ marginBottom: 20, textAlign: "center", fontSize: 18 }}>
      <span style={{ color: "#FFD700", fontWeight: "bold" }}>
      </span>
    </div>
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
      <button
        onClick={startGame}
        disabled={!gameOver && deck.length > 0}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#FFD700",
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        }}
      >
        {deck.length === 0 ? "Start Game" : "Restart"}
      </button>
      <button
        onClick={hit}
        disabled={deck.length === 0 || gameOver}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#FF4500",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        }}
      >
        Hit
      </button>
      <button
        onClick={stand}
        disabled={deck.length === 0 || gameOver}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#1E90FF",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        }}
      >
        Stand
      </button>
    </div>
    <div style={{ marginBottom: 20 }}>
      <h2>Dealer ({dealerRev ? calculateHand(dealer) : "?"})</h2>
      <div
        style={{
          display: "flex",
          gap: -40,
          border: "2px solid #006400",
          borderRadius: 10,
          padding: 10,
          backgroundColor: "#004400",
          minHeight: 150,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {dealer.map((card, i) => (
          <CardComponets
            key={i}
            card={card}
            hidden={!dealerRev && i === 0}
          />
        ))}
      </div>
    </div>
    <div>
      <h2>Player ({calculateHand(player)})</h2>
      <div
        style={{
          display: "flex",
          gap: -40,
          border: "2px solid #006400",
          borderRadius: 10,
          padding: 10,
          backgroundColor: "#004400",
          minHeight: 150,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {player.map((card, i) => (
          <CardComponets key={i} card={card} />
        ))}
      </div>
    </div>
    <h2 style={{ textAlign: "center", marginTop: 20 }}>{message}</h2>
    {gameOver && (
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          onClick={startGame}
          style={{
            padding: "10px 25px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#FFD700",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
          }}
        >
          Play Again
        </button>
      </div>
    )}
  </div>
);

}
export default App;