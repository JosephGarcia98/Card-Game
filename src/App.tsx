import React from "react";
import { GameProvider, useGame } from "./context/GameContext";
import Menu from "./ui/Menu";
import GameScreen from "./ui/GameScreen";

function AppContent() {
  const { game } = useGame();

  return game ? <GameScreen /> : <Menu />;
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}