import React, { createContext, useContext, useState } from "react";
import { Poker } from "../engine/poker/Poker";
import { Blackjack } from "../engine/blackjack/Blackjack";
import { RideTheBus } from "../engine/ridethebus/RideTheBus";
import { Rummy } from "../engine/rummy/Rummy";
import { Player } from "../models/Player";

type GameContextType = {
    game: Poker | Blackjack | RideTheBus | Rummy | null;
    startPoker: () => void;
    startBlackjack: () => void;
    startRideTheBus: () => void;
    startRummy: () => void;
    exitGame: () => void;
};

/**
 * Provides the current game instance and functions for
 * starting or exiting supported card games
 */
const GameContext = createContext<GameContextType | null>(null);

//hook for accessing the shared game context.
export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("GameContext not found");
    return context;
};

/**
 * Supplies the active game state and game management
 * functions to all components in the application
 */
export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [game, setGame] = useState<Poker | Blackjack | RideTheBus | Rummy | null>(null);

    function startPoker() {
        const players = [
            new Player("You", 1000, true),
            new Player("Chris", 1000, false),
            new Player("John", 1000, false),
            new Player("Jayna", 1000, false)
        ];
        const poker = new Poker(players);
        poker.start();
        setGame(poker);
    }

    function startBlackjack() {
        const blackjack = new Blackjack([
            new Player("You", 1000, true),
        ]);
        blackjack.start();
        setGame(blackjack);
    }

    function startRideTheBus() {
        const ridethebus = new RideTheBus([
            new Player("You", 1000, true),
        ]);
        ridethebus.start();
        setGame(ridethebus);
    }

    function startRummy() {
        const players  = [
            new Player("You", 1000, true),
            new Player("Jim", 1000, false),
            new Player("Tony", 1000, false),
            new Player("Emma", 1000, false)
        ];
        const rummy = new Rummy(players);
        rummy.start();
        setGame(rummy);
    }

    function exitGame() {
        setGame(null);
    }

    return (
        <GameContext.Provider value={{ game, startPoker, startBlackjack, startRideTheBus, startRummy, exitGame }}>
            {children}
        </GameContext.Provider>
    );
};