import { useState, useEffect } from "react";
import { RideTheBus } from "../engine/ridethebus/RideTheBus";
import { BettingControls } from "./BettingControls";
import styles from "../styles/ridethebus/RideTheBus.module.css"

type Props = {
    game: RideTheBus;
    onBack: () => void;
};

export default function RideBusTable({ game, onBack }: Props) {
    const [currentCard, setCurrentCard] = useState<string | null>(null);
    const [, forceUpdate] = useState(0);
    const player = game.players[0];

    const update = () => {
        forceUpdate(v => v + 1);
    };

    return (
        <div className={styles.table}>
            <button
                onClick={onBack}
                className={styles.menuButton}
            >
                ← Menu
            </button>
            <h1 className={styles.title}>Ride The Bus</h1>
            <div className={styles.progress}>
                <div className={game.currentRound >= 0 ? styles.activeStep : styles.step}>
                    Red/Black
                </div>
                <div className={game.currentRound >= 1 ? styles.activeStep : styles.step}>
                    High/Low
                </div>
                <div className={game.currentRound >= 2 ? styles.activeStep : styles.step}>
                    Inside/Outside
                </div>
                <div className={game.currentRound >= 3 ? styles.activeStep : styles.step}>
                    Suit
                </div>
            </div>
            <div className={styles.cardArea}>
                {game.revealedCards.map((card, index) => (
                    <img
                        key={index}
                        src={card.getCardPath()}
                        className={styles.revealedCard}
                    />
                ))}
                {!game.showCurrentCard && !game.gameOver && (
                    <img
                        src="/cardsPNG/back.png"
                        className={styles.currentCard}
                    />
                )}
                {game.showCurrentCard && game.currentCard && (
                    <img
                        src={game.currentCard.getCardPath()}
                        className={styles.currentCard}
                    />
                )}
            </div>
            <h2 className={styles.message}>
                {game.message}
            </h2>
            {game.betConfirmed && !game.gameOver && (
                <button
                    className={styles.cashOut}
                    onClick={() => {
                        game.cashOut();
                        update();
                    }}
                >
                    Cash Out
                </button>
            )}
            <div className={styles.controls}>
                {!game.gameOver && game.currentRound === 0 && (
                    <>
                        <button onClick={() => {
                            game.guess("red");
                            update();
                        }}>
                            Red
                        </button>
                        <button onClick={() => {
                            game.guess("black");
                            update();
                        }}>
                            Black
                        </button>
                    </>
                )}
                {!game.gameOver && game.currentRound === 1 && (
                    <>
                        <button onClick={() => {
                            game.guess("high");
                            update();
                        }}>
                            High
                        </button>
                        <button onClick={() => {
                            game.guess("low");
                            update();
                        }}>
                            Low
                        </button>
                    </>
                )}
                {!game.gameOver && game.currentRound === 2 && (
                    <>
                        <button onClick={() => {
                            game.guess("in");
                            update();
                        }}>
                            Inside
                        </button>
                        <button onClick={() => {
                            game.guess("out");
                            update();
                        }}>
                            Outside
                        </button>
                    </>
                )}
                {!game.gameOver && game.currentRound === 3 && (
                    <>
                        <button onClick={() => {
                            game.guess("hearts");
                            update();
                        }}> 
                        ♥ Hearts
                        </button>
                        <button onClick={() => {
                            game.guess("spades");
                            update();
                        }}>
                            ♠ Spades
                        </button>
                        <button onClick={() => {
                            game.guess("clubs");
                            update();
                        }}>
                            ♣ Clubs
                        </button>
                        <button onClick={() => {
                            game.guess("diamonds");
                            update();
                        }}>
                            ♦ Diamonds
                        </button>
                    </>
                )}
            </div>
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
                    disabled={
                        game.betConfirmed ||
                        game.currentRound > 0
                    }
                />
            </div>
            {game.gameOver && (
                <div className={styles.gameOverMenu}>
                    <button
                        onClick={() => {
                            game.restart();
                            update();
                        }}
                        className={styles.restartButton}
                    >
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
}