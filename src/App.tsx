import React, {useState} from "react";
import Blackjack from "./games/blackjack/App";
import RideTheBus from "./games/ridethebus/App"

type Game = "menu" | "blackjack" | "ridethebus";

function App() {
  const [selectGame, setSelectGame] = useState<Game>("menu");

  return (
    <div>
      {selectGame === "menu" && (
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h1>Choose a Game</h1>
          <button onClick={() => setSelectGame("blackjack")}>Blackjack</button>
          <button onClick={() => setSelectGame("ridethebus")}>Ride The Bus</button>
        </div>
      )}

      {selectGame === "blackjack" && <Blackjack />}
      {selectGame === "ridethebus" && <RideTheBus />}
    </div>
  );
}

export default App;