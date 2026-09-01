import {useGame} from "../context/GameContext";
import {Poker} from "../engine/poker/Poker";
import {Blackjack} from "../engine/blackjack/Blackjack";
import {RideTheBus} from "../engine/ridethebus/RideTheBus";
import {Rummy} from "../engine/rummy/Rummy";
import PokerTable from "./PokerTable";
import BlackjackTable from "./BlackjackTable";
import RummyTable from "./RummyTable";
import RideBusTable from "./RideBusTable";

export default function GameScreen() {
    const {game, exitGame} = useGame();

    if(!game) return null;
    if(game instanceof Poker) {
        return <PokerTable game={game} onBack={exitGame} />;
    }
    if(game instanceof Blackjack) {
        return <BlackjackTable game={game} onBack={exitGame}/>;
    }
    if(game instanceof Rummy) {
        return <RummyTable game={game} onBack={exitGame}/>;
    }
    if(game instanceof RideTheBus) {
        return <RideBusTable game={game} onBack={exitGame}/>;
    }
    return <div>Game Not Available </div>
}