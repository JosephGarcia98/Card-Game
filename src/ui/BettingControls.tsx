import { useState } from "react";
import styles from "../styles/menu/BettingControls.module.css"

type Props = {
    betAmount: number;
    balance: number;
    onChangeBet: (amount: number) => void;
    onConfirmBet: () => void;
    disabled?: boolean;
};

export function BettingControls({
    balance,
    onChangeBet,
    onConfirmBet,
    disabled = false
}: Props) {
    const [custom, setCustom] = useState(0);


    return (
        <div className={styles.bettingContainer}>
            <div className={styles.betBar}>
                <div className={styles.balance}>
                    Balance: {balance}
                </div>
                <div className={styles.betControls}>
                    <button
                        className={styles.adjustButton}
                        onClick={() => setCustom(prev => Math.max(0, prev - 100))}
                        disabled={disabled}
                    >
                        -100
                    </button>
                    <button
                        className={styles.adjustButton}
                        onClick={() => setCustom(prev => Math.max(0, prev - 10))}
                        disabled={disabled}
                    >
                        -10
                    </button>
                    <button
                        className={styles.adjustButton}
                        onClick={() => setCustom(prev => Math.max(0, prev - 5))}
                        disabled={disabled}
                    >
                        -5
                    </button>
                    <input
                        className={styles.betInput}
                        type="number"
                        value={custom}
                        onChange={(e) => setCustom(Number(e.target.value))}
                        disabled={disabled}
                    />
                    <button
                        className={styles.adjustButton}
                        onClick={() => setCustom(prev => prev + 5)}
                        disabled={disabled}
                    >
                        +5
                    </button>
                    <button
                        className={styles.adjustButton}
                        onClick={() => setCustom(prev => prev + 10)}
                        disabled={disabled}
                    >
                        +10
                    </button>
                    <button
                        className={styles.adjustButton}
                        onClick={() => setCustom(prev => prev + 100)}
                        disabled={disabled}
                    >
                        +100
                    </button>
                </div>
                <button
                    className={styles.confirmButton}
                    onClick={() => {
                        onChangeBet(custom);
                        onConfirmBet();
                        setCustom(0);
                    }}
                    disabled={disabled}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}