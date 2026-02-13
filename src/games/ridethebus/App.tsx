import React, { useState } from "react"; 
import { createDeck } from "../../models/deck";
import { shuffle } from "../../models/shuffle";
import { Card } from "../../models/Card";
import CardComponets from "../../models/cardComponets";
import { Stage, checkColorGuess, checkHighLow, checkInOut, checkSuit} from "./ridethebus";

const App: React.FC = () => {
    const[deck, setDeck] = useState<Card[]>([]);
    const[cards, setCards] = useState<Card[]>([]);
    const[round, setRound] = useState<Stage>("color")
    const[message, setMessage] = useState("");
    const[gameOver, setGameOver] = useState(true);

    function startGame() {
        const newdeck = shuffle(createDeck());
        setDeck(newdeck);
        setCards([]);
        setRound("color");
        setMessage("Red or Black");
        setGameOver(false);
    }

    function drawCard(){
        const newDeck = [...deck];
        const card = newDeck.pop()!;
        setDeck(newDeck);
        setCards(prev => [...prev, card]);
        return card;
    }

    function wrongAnswer() { 
        setMessage("Wrong! Back to the Front");
        setRound("color");
        setCards([]);
    }

    function makeGuess(guess: string) {
        if(gameOver) return;
        if(round === "color"){
            const card = drawCard();
            if(checkColorGuess(card, guess)){
                setRound("highlow");
                setMessage("Higher or Lower");
            }else wrongAnswer();
        }else if(round === "highlow"){
            const card = drawCard();
            if(checkHighLow(cards[0], card, guess)){
                setRound("inout");
                setMessage("Inside or Outside")
            }else wrongAnswer();
        }else if(round === "inout"){
            const card = drawCard();
            if(checkInOut(cards[0], cards[1], card, guess)){
                setRound("suit");
                setMessage("Pick a suit");
            }else wrongAnswer();
        }else if(round === "suit"){
            const card = drawCard();
            if(checkSuit(card, guess)){
                setRound("win");
                setMessage("🎉YOU WIN🎉");
                setGameOver(true);
            }else wrongAnswer();
        }
    }

  return (
    <div style={{ backgroundColor: "#0B6623", padding: 20, borderRadius: 15, minHeight: "80vh", color: "white" }}>
      <h1 style={{ textAlign: "center" }}>🚌 Ride The Bus 🚌</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={startGame}>Start</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {cards.map((c, i) => <CardComponets key={i} card={c} />)}
      </div>

      <h2 style={{ textAlign: "center" }}>{message}</h2>

      {!gameOver && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {round === "color" && (
            <>
              <button onClick={() => makeGuess("red")}>Red</button>
              <button onClick={() => makeGuess("black")}>Black</button>
            </>
          )}

          {round === "highlow" && (
            <>
              <button onClick={() => makeGuess("higher")}>Higher</button>
              <button onClick={() => makeGuess("lower")}>Lower</button>
            </>
          )}

          {round === "inout" && (
            <>
              <button onClick={() => makeGuess("inside")}>Inside</button>
              <button onClick={() => makeGuess("outside")}>Outside</button>
            </>
          )}

          {round === "suit" && (
            <>
              <button onClick={() => makeGuess("hearts")}>♥</button>
              <button onClick={() => makeGuess("diamonds")}>♦</button>
              <button onClick={() => makeGuess("clubs")}>♣</button>
              <button onClick={() => makeGuess("spades")}>♠</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;