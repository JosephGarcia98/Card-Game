/**
 * Tracks a player's chip balance.
 * Handles betting, winnings, and bankroll validation.
 */
export class Bankroll {
    balance: number;

    //everyone starts with 1000 chips
    constructor(startBalance: number = 1000) {
        this.balance = startBalance;
    }

    //removes the chips from the players balance
    bet(amount: number): void {
        if(amount > this.balance) {
            throw new Error("Not enough money to bet");
        }
        this.balance -= amount;
    }

    //add the amount won to the players balance
    win(amount: number): void {
        this.balance += amount;
    }

    //checks if player has 0 chips
    isBankrupt(): boolean {
        return this.balance <= 0;
    }

    //checks if player has enough chips
    canBet(amount: number): boolean {
        return amount <= this.balance;
    }

    //gets player chip count
    getBalance(): number {
        return this.balance;
    }
}