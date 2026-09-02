/**
 * Handles side pot creation and winner payouts in Poker
 * Splits the pot distribution
 * Support side pots
 */
import { Poker } from "../Poker";
import { Player } from "../../../models/Player";

type SidePot = {
    amount: number;
    eligiblePlayers: Player[];
};

//Creates all main and side pots based on player contributions
export function createSidePot(game: Poker): SidePot[] {
    const sidePots: SidePot[] = [];
    //only player who have put into pot
    const activePlayers = game.players.filter(player => player.totalContribution > 0);
    //sort from smallest to largest contributions
    const contributions =[...activePlayers].sort((a, b) => a.totalContribution - b.totalContribution);
    let previousContribution = 0;
    while (contributions.length > 0) {
        const currentContribution = contributions[0].totalContribution;
        // for side pot, calculates the amount
        const potAmount = (currentContribution - previousContribution) * contributions.length; 
        sidePots.push({amount: potAmount, eligiblePlayers: contributions.filter(player => !player.folded)});
        previousContribution = currentContribution;
        contributions.shift();
    }
    return sidePots;
}

//Pays out or distributes both main and side pot
export function payoutWinners(game: Poker) {
    const sidePots = createSidePot(game);
    for (const sidePot of sidePots) {
        let bestScore = -1;
        let winners: Player[] = [];
        //find who had the best hand
        for (const player of sidePot.eligiblePlayers) {
            const score = game.getBestHand(player);
            if (score > bestScore) {
                bestScore = score;
                winners = [player];
            } else if (score === bestScore) {
                winners.push(player);
            }
        }
        //split between ties
        const splitAmount = sidePot.amount / winners.length;
        for (const winner of winners) {
            winner.bankroll.win(splitAmount);
        }
    }
    game.pot = 0;
}