import { useGame } from "../context/GameContext";
import styles from "../styles/menu/Menu.module.css"

export default function Menu() {
    const {
        startPoker,
        startBlackjack,
        startRummy,
        startRideTheBus
    } = useGame();

    return (
        <div className={styles.menu}>
            <h1 className={styles.title}>Casino Card Games</h1>
            <button className={styles.button} onClick={startPoker}>Poker</button>
            <button className={styles.button} onClick={startBlackjack}>Blackjack</button>
            <button className={styles.button} onClick={startRummy}>Rummy</button>
            <button className={styles.button} onClick={startRideTheBus}>Ride The Bus</button>
        </div>
    );
}