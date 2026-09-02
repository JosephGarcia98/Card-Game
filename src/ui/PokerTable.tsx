import { useEffect, useState } from "react";
import { Poker } from "../engine/poker/Poker";
import { BettingControls } from "./BettingControls";
import styles from "../styles/poker/Poker.module.css";

type Props = {
    game: Poker;
    onBack: () => void;
};

export default function PokerTable({game, onBack}: Props) {
    const [, forceUpdate] = useState(0);

    const update = () => {
        forceUpdate(v => v + 1);
    };

    useEffect(() => {
        game.start();
        update();
    }, []);

    useEffect(() => {
        const player = game.turns.currentPlayer;
        if (
            !player.isHuman &&
            !player.folded &&
            !player.allIn &&
            game.roundStage !== "showdown"
        ) {
            const timer = setTimeout(() => {
                game.playTurn(player);
                update();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [
        game.turns.turnIndex,
        game.roundStage,
        game.pot,
        game.activeBet
    ]);

    return (
        <div className={styles.table}>

            <button className={styles.menuButton} onClick={onBack}>
                ← Menu
            </button>

            <div className={styles.topBar}>
                <div className={styles.gameInfo}>
                    <h2>Stage: {game.roundStage.toUpperCase()}</h2>
                    <h2>Pot: ${game.pot}</h2>
                    <h2>Active Bet: ${game.activeBet}</h2>
                    <h2>Turn: {game.turns.currentPlayer.name}</h2>
                </div>
            </div>

            <h1 className={styles.title}>Poker</h1>

            <div className={styles.topRow}>
                {game.players.slice(1).map((player, index) => {
                    const isCurrent = game.turns.currentPlayer === player;

                    return (
                        <div
                            key={index}
                            className={`${styles.playerSeat} ${isCurrent ? styles.active : ""}`}
                        >
                            <h3>{player.name}</h3>
                            <p>${player.bankroll.getBalance()}</p>

                            <div className={styles.cardRow}>
                                {player.folded ? (
                                    <p className={styles.folded}>FOLDED</p>
                                ) : (
                                    player.hand.map((_, i) => (
                                        <img
                                            key={i}
                                            src="/cardsPNG/back.png"
                                            className={styles.smallCard}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.centerArea}>

                <h2 className={styles.boardTitle}>Board</h2>

                <div className={styles.boardRow}>
                    {game.board.map((card, i) => (
                        <img
                            key={i}
                            src={card.getCardPath()}
                            className={styles.boardCard}
                        />
                    ))}
                </div>

                <div className={styles.pot}>
                    💰 ${game.pot}
                </div>

            </div>

            {game.players.map((player, index) => {
                const isCurrent = game.turns.currentPlayer === player;
                const isYou = index === 0;

                if (!isYou) return null;

                return (
                    <div key={index} className={styles.bottomPlayer}>

                        <div className={styles.playerHeader}>
                            <h3>{player.name}</h3>
                            <p>Balance: ${player.bankroll.getBalance()}</p>
                            <p>Bet: ${player.currentBet}</p>
                        </div>

                        <div className={styles.cardRow}>
                            {player.hand.map((card, i) => (
                                <img
                                    key={i}
                                    src={card.getCardPath()}
                                    className={styles.currentCard}
                                />
                            ))}
                        </div>

                        {game.roundStage !== "showdown" &&
                            isCurrent &&
                            !player.folded && (
                            <div className={styles.controls}>

                                <BettingControls
                                    betAmount={game.currentBetInput}
                                    balance={player.bankroll.getBalance()}
                                    onChangeBet={(amt) => {
                                        game.changeBet(amt);
                                        update();
                                    }}
                                    onConfirmBet={() => {
                                        game.confirmBet();
                                        game.nextTurn();
                                        update();
                                    }}
                                    disabled={false}
                                />

                                <div className={styles.actionButtons}>

                                    <button
                                        className={styles.button}
                                        onClick={() => {
                                            game.fold(player);
                                            game.nextTurn();
                                            update();
                                        }}
                                    >
                                        Fold
                                    </button>

                                    <button
                                        className={styles.button}
                                        onClick={() => {
                                            game.call(player);
                                            game.nextTurn();
                                            update();
                                        }}
                                    >
                                        Call
                                    </button>

                                    <button
                                        className={styles.button}
                                        onClick={() => {
                                            game.check(player);
                                            game.nextTurn();
                                            update();
                                        }}
                                    >
                                        Check
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>
                );
            })}

            {game.roundStage === "showdown" && (
                <div className={styles.gameOver}>
                    <h2>Showdown Complete</h2>

                    <button
                        className={styles.restartBtn}
                        onClick={() => {
                            game.handStarted = false;
                            game.start();
                            update();
                        }}
                    >
                        New Hand
                    </button>
                </div>
            )}

        </div>
    );
}