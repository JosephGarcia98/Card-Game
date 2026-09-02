import { useEffect, useState } from "react";
import { Rummy } from "../engine/rummy/Rummy";
import styles from "../styles/rummy/Rummy.module.css";
type Props = {
    game: Rummy;
    onBack: () => void;
};
export default function RummyTable({ game, onBack }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [, update] = useState(0);
    const currentPlayer = game.getCurrentPlayer();
    function refresh() {
        update(n => n + 1);
    }
    useEffect(() => {
        if (game.gameOver || game.roundOver) {
            return;
        }
        const player = game.getCurrentPlayer();
        if (player.isHuman) {
            return;
        }
        const timer = setTimeout(() => {
            if (game.gameOver || game.roundOver) {
                return;
            }
            const current = game.getCurrentPlayer();
            if (current.isHuman) {
                return;
            }
            game.playTurn(current);
            refresh();
        }, 1000);
        return () => {
            clearTimeout(timer);
        };
    }, [
        game.currentPlayerIndex,
        game.turnPhase,
        game.roundOver,
        game.gameOver
    ]);
    function toggleSelect(index: number) {
        setSelected(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    }
    const deckEmpty = game.deck.cards.length === 0;
    const humanTurn = currentPlayer?.isHuman === true;
    const canSkip = deckEmpty && humanTurn && game.turnPhase === "draw" && !game.roundOver && !game.gameOver;
    return (
        <div className={styles.table}>
            <div className={styles.topBar}>
                <button className={styles.menuButton} onClick={onBack}>
                    ← Menu
                </button>
            </div>
            <h1 className={styles.title}>Rummy</h1>
            {game.gameOver && (
                <h2 className={styles.winner}>
                    Winner: {game.winner?.name}
                </h2>
            )}
            {game.roundOver && !game.gameOver && (
                <h2 className={styles.winner}>
                    Round Over
                </h2>
            )}
            <div className={styles.topRow}>
                {game.players.slice(1, 4).map((p, i) => {
                    const isCurrent = game.getCurrentPlayer() === p;
                    return (
                        <div key={i} className={`${styles.playerPanel} ${isCurrent ? styles.active : ""}`}>
                            <div className={styles.playerName}>
                                {p.name}: {p.score}
                            </div>
                            <div className={styles.cardRow}>
                                {p.hand.map((card, cardIndex) => (
                                    <img src="/cardsPNG/back.png" className={styles.smallCard} />
                                ))}
                            </div>
                            <div className={styles.meldArea}>
                                {p.melds.length === 0 && (
                                    <div className={styles.emptyMelds} />
                                )}
                                {p.melds.map((meld, meldIndex) => (
                                    <div key={meldIndex} className={styles.meldRow}>
                                        {meld.map((card, cardIndex) => (
                                            <img key={cardIndex} src={card.getCardPath()} className={styles.smallCard} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={styles.centerArea}>
                <div className={styles.deckPile}>
                    {deckEmpty ? (
                        <div className={styles.deckEmpty}>
                            Deck Empty
                        </div>
                    ) : (
                        <img
                            src="/cardsPNG/back.png"
                            className={styles.deckCard}
                            onClick={() => {
                                const player = game.getCurrentPlayer();
                                if (!player.isHuman) {
                                    return;
                                }
                                if (game.turnPhase !== "draw") {
                                    return;
                                }
                                game.drawFromDeck(player);
                                refresh();
                            }}
                        />
                    )}
                </div>
                <div className={styles.discardPile}>
                    {game.discardPile.map((card, index) => (
                        <img
                            key={index}
                            src={card.getCardPath()}
                            className={styles.currentCard}
                            onClick={() => {
                                const player = game.getCurrentPlayer();
                                if (!player.isHuman) {
                                    return;
                                }
                                if (game.turnPhase !== "draw") {
                                    return;
                                }
                                game.takeFromDiscard(player, index);
                                refresh();
                            }}
                        />
                    ))}
                </div>
            </div>
            {game.players.map((p, index) => {
                const isCurrent = game.getCurrentPlayer() === p;
                if (index !== 0) {
                    return null;
                }
                return (
                    <div key={index} className={`${styles.playerPanel} ${isCurrent ? styles.active : ""}`}>
                        <div className={styles.playerName}>
                            {p.name}: {p.score}
                        </div>
                        <div className={styles.cardRow}>
                            {p.hand.map((card, i) => (
                                <div key={i} className={styles.cardWrapper}>
                                    <img
                                        src={card.getCardPath()}
                                        className={`${styles.currentCard} ${selected.includes(i) ? styles.selectedCard : ""}`}
                                        onClick={() => toggleSelect(i)}
                                    />
                                    {game.turnPhase === "discard" && selected.includes(i) && (
                                        <button
                                            className={styles.discardBtn}
                                            onClick={() => {
                                                game.playerDiscard(p, i);
                                                setSelected([]);
                                                refresh();
                                            }}
                                        >
                                            Discard
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className={styles.meldArea}>
                            {p.melds.length === 0 && (
                                <div className={styles.emptyMelds} />
                            )}
                            {p.melds.map((meld, meldIndex) => (
                                <div key={meldIndex} className={styles.meldRow}>
                                    {meld.map((card, cardIndex) => (
                                        <img key={cardIndex} src={card.getCardPath()} className={styles.smallCard} />
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className={styles.controls}>
                            {canSkip ? (
                                <button
                                    className={styles.Buttons}
                                    onClick={() => {
                                        const success = game.skipWhenDeckEmpty(p);
                                        setSelected([]);
                                        console.log("Human skipped:", {
                                            success,
                                            player: p.name,
                                            skippedPlayers: game.skipPlayers.length,
                                            totalPlayers: game.players.length
                                        });
                                        refresh();
                                    }}
                                >
                                    Skip
                                </button>
                            ) : (
                                <button
                                    className={styles.Buttons}
                                    onClick={() => {
                                        if (game.turnPhase !== "draw") {
                                            return;
                                        }
                                        if (game.getCurrentPlayer() !== p) {
                                            return;
                                        }
                                        game.drawFromDeck(p);
                                        refresh();
                                    }}
                                    disabled={deckEmpty || !isCurrent}
                                >
                                    Draw Deck
                                </button>
                            )}
                            <button
                                className={styles.Buttons}
                                onClick={() => {
                                    if (selected.length === 0) {
                                        return;
                                    }
                                    if (game.turnPhase !== "play") {
                                        return;
                                    }
                                    game.playMeld(p, selected);
                                    setSelected([]);
                                    refresh();
                                }}
                            >
                                Play Meld
                            </button>
                            <button
                                className={styles.Buttons}
                                onClick={() => {
                                    if (game.turnPhase !== "play") {
                                        return;
                                    }
                                    game.finishPlayPhase();
                                    refresh();
                                }}
                            >
                                Discard
                            </button>
                            <button
                                className={styles.Buttons}
                                onClick={() => {
                                    game.undoPickup(p);
                                    refresh();
                                }}
                            >
                                Undo Pickup
                            </button>
                        </div>
                    </div>
                );
            })}
            {game.roundOver && !game.gameOver && (
                <button
                    className={styles.nextRoundBtn}
                    onClick={() => {
                        setSelected([]);
                        game.start();
                        refresh();
                    }}
                >
                    Next Round
                </button>
            )}
            {game.gameOver && (
                <button
                    className={styles.restartBtn}
                    onClick={() => {
                        setSelected([]);
                        game.restartGame();
                        refresh();
                    }}
                >
                    Restart Game
                </button>
            )}
        </div>
    );
}