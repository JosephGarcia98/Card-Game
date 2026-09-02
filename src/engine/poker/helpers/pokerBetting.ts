/**
 * Incharge of chips
 * Betting and payouts for Poker
 * Bet validation, confirmation
 */
import { Poker } from "../Poker";
import { Player } from "../../../models/Player";

type SidePot = {
    amount: number;
    eligiblePlayers: Player[];
};

//Handles every betting action a player can make
export function handleAction(game: Poker, player: Player, action: "fold" | "check" | "call" | "raise", raiseAmount: number = 0) {
    if (player.folded) return;
    switch (action) {
        case "fold":
            player.folded = true;
            break;
        case "check":
            //a player can only check if they have matched the current bet
            if (player.currentBet < game.activeBet) {
                throw new Error("Cannot check, must call or fold.");
            }
            break;
        case "call":
            const toCall = game.activeBet - player.currentBet;
            const balanceCall = player.bankroll.getBalance();
            //prevents from betting more chips then they have
            const amountCall = Math.min(toCall, balanceCall);
            player.bankroll.bet(amountCall);
            player.currentBet += amountCall;
            player.totalContribution += amountCall;
            game.pot += amountCall;
            if (player.bankroll.getBalance() === 0) {
                player.allIn = true;
            }
            break;
        case "raise":
            //checks that raise meets minimum
            if (raiseAmount < game.lastRaise && raiseAmount < player.bankroll.getBalance()) {
                throw new Error(
                    `Minimum raise is ${game.lastRaise}`
                );
            }
            const totalRaise = (game.activeBet - player.currentBet) + raiseAmount;
            const balanceRaise = player.bankroll.getBalance();
            const amountRaise = Math.min(totalRaise, balanceRaise);
            player.bankroll.bet(amountRaise);
            player.currentBet += amountRaise;
            player.totalContribution += amountRaise;
            game.pot += amountRaise;
            //updates the active bet when a new bet is made
            if (player.currentBet > game.activeBet) {
                game.lastRaise = raiseAmount;
                game.activeBet = player.currentBet;
                game.playersActed.clear();
            }
            if (player.bankroll.getBalance() === 0) {
                player.allIn = true;
            }
            break;
    }
    //records the player as having acted this betting round
    game.playersActed.add(player);
}

//Confirms how much the player has bet
export function changeBet(game: Poker, amount: number) {
    game.currentBetInput += amount;
    if (game.currentBetInput < 0) return;
    const max = game.turns.currentPlayer.bankroll.getBalance();
    if (game.currentBetInput > max) {
        game.currentBetInput = max;
    }
    game.currentBetInput =
        Math.floor(game.currentBetInput);
}

//Locks in bet and starts round
export function confirmBet(game: Poker) {
    const player = game.turns.currentPlayer;
    if (game.currentBetInput <= 0) return;
    raise(game, player, game.currentBetInput);
    game.currentBetInput = 0;
}

//Creates side pot for all in situtation
export function createSidePot(game: Poker): SidePot[] {
    const sidePots: SidePot[] = [];
    const activePlayers = game.players.filter(p => p.totalContribution > 0);
    const contrib = [...activePlayers].sort((a, b) => a.totalContribution - b.totalContribution);
    let prevContribution = 0;
    while (contrib.length > 0) {
        const currentContribution = contrib[0].totalContribution;
        const potAmount = (currentContribution - prevContribution) * contrib.length;
        sidePots.push({amount: potAmount, eligiblePlayers: contrib.filter(p => !p.folded)});
        prevContribution = currentContribution;
        contrib.shift();
    }
    return sidePots;
}

 //determines winners and distributes every side pot
export function payoutWinners(game: Poker) {
    const sidePots = createSidePot(game);
    for (const sidePot of sidePots) {
        let bestScore = -1;
        let winners: Player[] = [];
        for (const player of sidePot.eligiblePlayers) {
            const score = game.getBestHand(player);
            if (score > bestScore) {
                bestScore = score;
                winners = [player];
            } else if (score === bestScore) {
                winners.push(player);
            }
        }
        const split = sidePot.amount / winners.length;
        for (const winner of winners) {
            winner.bankroll.win(split);
        }
    }
    game.pot = 0;
}

//Folds the player's hand
export function fold(game: Poker,player: Player) {
    handleAction(game, player, "fold");
}

//Matches current bet
export function call(game: Poker,player: Player) {
    handleAction(game, player,"call");
}

//Checks without betting additional chips
export function check(game: Poker,player: Player) {
    handleAction(game, player, "check");
}

//Raises the current bet amound
export function raise(game: Poker, player: Player, amount: number) {
    handleAction(game, player, "raise", amount);
}