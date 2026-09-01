import { useState } from "react";
import { Blackjack } from "../engine/blackjack/Blackjack";
import { BettingControls } from "./BettingControls";
import styles from "../styles/blackjack/Blackjack.module.css"

type Props = {
    game: Blackjack;
    onBack: () => void;
};

export default function BlackjackTable({ game, onBack }: Props) {
    const [, forceUpdate] = useState(0);
    const currentPlayer = game.turns.currentPlayer;
    const resultDisplay = game.gameResults();

    const update = () => {
        forceUpdate(v => v + 1);
    };

    return (
        <div className={styles.table}>

            <div className={styles.topBar}>
                <button
                    onClick={onBack}
                    className={styles.menuButton}
                >
                    ← Menu
                </button>
            </div>

            <h1 className={styles.title}>Blackjack</h1>

            <div className={styles.dealerArea}>
                <h2>Dealer</h2>

                <div className={styles.cardArea}>
                    {game.dealer.hand.map((card, i) => (
                        <img
                            key={i}
                            src={card.getCardPath()}
                            className={styles.currentCard}
                        />
                    ))}
                </div>

                <h3 className={styles.score}>
                    Score: {game.getDealerDisplayScore()}
                </h3>
            </div>

            <div className={styles.gameInfo}>
                <h2>Current Turn: {currentPlayer.name}</h2>
            </div>

            {game.players.map((player, index) => (
                <div key={index} className={styles.playerArea}>

                    <h2>{player.name}</h2>

                    <div className={styles.cardArea}>
                        {player.hand.map((card, i) => (
                            <img
                                key={i}
                                src={card.getCardPath()}
                                className={styles.currentCard}
                            />
                        ))}
                    </div>

                    <h3 className={styles.score}>
                        Score: {player.hasStood || game.betConfirmed
                            ? game.getHandScore(player.hand)
                            : "?"}
                    </h3>


                    {game.betConfirmed &&
                        !game.roundOver &&
                        currentPlayer === player &&
                        !player.isBusted &&
                        !player.hasStood && (
                        <div className={styles.controls}>

                            <button
                                onClick={() => {
                                    game.playerHit();
                                    update();
                                }}
                                className={styles.hitButton}
                                >
                                    Hit
                                </button>

                            <button
                                onClick={() => {
                                    game.playerStand();
                                    update();
                                }}
                                className={styles.standButton}
                            >
                                Stand
                            </button>

                            {game.canSplit(player) && (
                                <button
                                    onClick={() => {
                                        game.split(player);
                                        update();
                                    }}
                                    className={styles.splitButton}
                                >
                                    Split
                                </button>
                            )}
                        </div>
                    )}

                    {currentPlayer === player && (
                        <div className={styles.bettingSection}>
                            <BettingControls
                                betAmount={game.currentBetInput}
                                balance={player.bankroll.getBalance()}
                                onChangeBet={(amt) => {
                                    game.changeBet(amt);
                                    update();
                                }}
                                onConfirmBet={() => {
                                    game.confirmBet();
                                    update();
                                }}
                                disabled={game.betConfirmed}
                            />
                        </div>
                    )}

                    {game.roundOver ? (
                        <h3 className={styles.message}>
                            Result: {resultDisplay[index]?.toUpperCase()}
                        </h3>
                    ) : player.isBusted ? (
                        <h3 className={styles.message}>BUST</h3>
                    ) : player.hasStood ? (
                        <h3 className={styles.message}>STAND</h3>
                    ) : null}

                </div>
            ))}

            {game.roundOver && (
                <div className={styles.gameOverMenu}>
                    <button
                        onClick={() => {
                            game.restartRound();
                            update();
                        }}
                        className={styles.restartButton}
                    >
                        Restart Round
                    </button>
                </div>
            )}

        </div>
    );
}