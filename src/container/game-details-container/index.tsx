import React, { useState, useMemo, useEffect } from "react";

type GameDetailsProps = {
  details: any;
  resetPage: any;
};

const sumAmounts = (data: any[]) => {
  const values = Array.from(Object.values(data));
  return values.reduce((acc: any, val: any) => {
    if (val) {
      acc += val;
    }
    return acc;
  }, 0);
};

const getPayment = (amount: number, ratio: number[]) => {
  if (ratio[0] && ratio[1]) {
    return parseFloat(((amount * ratio[0]) / ratio[1]).toFixed(2));
  }
  return amount;
};

// Utility function to simplify debts
const simplifyDebts = (
  initialAmounts: any[],
  finalAmounts: any[],
  ratio: any[]
) => {
  const netAmounts: any = {};

  // Calculate net amounts (final - initial)
  for (let player in initialAmounts) {
    netAmounts[player] = finalAmounts[player] - initialAmounts[player];
  }

  const debtors = [];
  const creditors = [];

  // Separate debtors and creditors
  for (let player in netAmounts) {
    const net = netAmounts[player];
    if (net < 0) debtors.push({ player, amount: -net });
    else if (net > 0) creditors.push({ player, amount: net });
  }

  const transactions = [];

  // Simplify debts
  while (debtors.length && creditors.length) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    const payment = Math.min(debtor.amount, creditor.amount);
    transactions.push({
      from: debtor.player,
      to: creditor.player,
      amount: getPayment(payment, ratio),
    });

    debtor.amount -= payment;
    creditor.amount -= payment;

    // Remove settled debtor or creditor
    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }

  return transactions;
};

const GameDetails = ({ details, resetPage }: GameDetailsProps) => {
  const { players, initialAmount } = details;
  const playerAmounts = players.reduce((acc: any, player: any) => {
    acc[player] = initialAmount;
    return acc;
  }, {});
  const [initialAmounts, setInitialAmounts] = useState<any>(playerAmounts);
  const [finalAmounts, setFinalAmounts] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [winners, setWinners] = useState([]);
  const [remainingAmounts, setRemainingAmounts] = useState<any>({});
  const [ratio1, setRatio1] = useState<number>(1);
  const [ratio2, setRatio2] = useState<number>(1);

  const resetDetails = () => {
    setInitialAmounts(playerAmounts);
    setFinalAmounts({});
    setTransactions([]);
    setShowResults(false);
    setWinners([]);
    setRemainingAmounts({});
    setRatio1(1);
    setRatio2(1);
  };

  // Calculate remaining amounts
  const calculateRemainingAmounts = () => {
    const calculatedRemainingAmounts = players.reduce(
      (acc: any, player: string) => {
        const initial = initialAmounts[player] || 0;
        const final = finalAmounts[player] || 0;
        acc[player] = final - initial;
        return acc;
      },
      {}
    );

    setRemainingAmounts(calculatedRemainingAmounts);
  };

  useEffect(() => {
    const initialArray: any[] = Array.from(Object.values(initialAmounts));
    const finalArray: any[] = Array.from(Object.values(finalAmounts));

    let indices: any = [];
    let maxProfit = -Infinity; // Initialize to the smallest possible value

    // Calculate profits for each player
    const profits = finalArray.map((final: any, i) => final - initialArray[i]);

    // Find the maximum profit and corresponding indices
    for (let i = 0; i < profits.length; i++) {
      if (profits[i] > maxProfit) {
        maxProfit = profits[i]; // Update max profit
        indices = [i]; // Reset indices to the current index
      } else if (profits[i] === maxProfit) {
        indices.push(i); // Add to indices if the profit is equal to max
      }
    }

    setWinners(indices); // Set the winners based on indices
  }, [finalAmounts, initialAmounts]);

  useEffect(() => {
    if (showResults) {
      const simplifiedTransactions = simplifyDebts(
        initialAmounts,
        finalAmounts,
        [ratio1, ratio2]
      );
      setTransactions(simplifiedTransactions);
    }
  }, [finalAmounts, initialAmounts, ratio1, ratio2]);

  // Handle input changes for initial amounts
  const handleInitialChange = (e: any, player: string) => {
    setInitialAmounts({
      ...initialAmounts,
      [player]: e.target.value && Number(e.target.value),
    });
  };

  // Handle input changes for final amounts
  const handleFinalChange = (e: any, player: string) => {
    setFinalAmounts({
      ...finalAmounts,
      [player]: e.target.value && Number(e.target.value),
    });
  };

  // Calculate debts on form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const simplifiedTransactions = simplifyDebts(initialAmounts, finalAmounts, [
      ratio1,
      ratio2,
    ]);
    setTransactions(simplifiedTransactions);
    setShowResults(true);
    calculateRemainingAmounts();
  };

  const handleRatioChange = (e: any, type: number) => {
    if (type === 1) {
      setRatio1(e.target.value && Number(e.target.value));
    } else {
      setRatio2(e.target.value && Number(e.target.value));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100%",
        verticalAlign: "center",
        justifyContent: "100%",
        flexFlow: "column",
      }}
    >
      <h2> Poker SettleUp</h2>
      <form onSubmit={handleSubmit}>
        {players.map((player: any) => (
          <div key={player}>
            <label>{player}: </label>
            <input
              type="number"
              value={initialAmounts[player]}
              onChange={(e) => handleInitialChange(e, player)}
              required
            />
            <input
              style={{ marginLeft: "5px" }}
              type="number"
              value={finalAmounts[player]}
              onChange={(e) => handleFinalChange(e, player)}
              required
            />
          </div>
        ))}
        <br />
        <div style={{ fontSize: "12px", fontStyle: "italic" }}>
          <div>Remaining Amount</div>
          {sumAmounts(initialAmounts) - sumAmounts(finalAmounts)}
        </div>
        <br />
        <button style={{ width: "250px" }} type="submit">
          Calculate
        </button>
      </form>

      {transactions.length > 0 && (
        <div>
          <h3>Transactions</h3>
          <div>
            <label>Game to Real Proportions: </label>
            <input
              type="number"
              value={ratio1}
              onChange={(e) => handleRatioChange(e, 1)}
              required
              style={{ width: "30px" }}
            />
            :
            <input
              type="number"
              value={ratio2}
              onChange={(e) => handleRatioChange(e, 2)}
              required
              style={{ width: "30px" }}
            />
          </div>
          <br />
          {transactions.map((transaction, index) => (
            <div key={index}>
              {transaction.from} owes {transaction.to} Rs.{transaction.amount}
            </div>
          ))}
        </div>
      )}
      {showResults && (
        <div
          style={{
            display: "flex",
            flexFlow: "column wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h3>Results & Player Summary</h3>
          {winners.length ? (
            <>
              <div style={{ fontStyle: "italic" }}>
                {winners.length ? `Congratulations!!!` : ""}
                {winners.length > 1
                  ? ` ${winners
                      .map((i) => players[i])
                      .join(", ")} are the winners!!!`
                  : winners.length === 1 &&
                    ` ${players[winners[0]]} is the winner!!!`}
              </div>
              <br />
            </>
          ) : (
            <></>
          )}
          {Object.keys(remainingAmounts).length > 0 && (
            <div>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Rank
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Player
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Money Invested
                    </th>
                    <th style={{ border: "1px solid black", padding: "8px" }}>
                      Profit/Loss
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players
                    .map((player: string) => {
                      const invested = initialAmounts[player] || 0;
                      const profitLoss = remainingAmounts[player] || 0;
                      return { player, invested, profitLoss };
                    })
                    .sort((a: any, b: any) => b.profitLoss - a.profitLoss) // Sort by profit/loss in descending order
                    .map((item: any, index: number) => (
                      <tr key={item.player}>
                        <td
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          {item.player}
                        </td>
                        <td
                          style={{ border: "1px solid black", padding: "8px" }}
                        >
                          Rs.{item.invested}
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "8px",
                            color: item.profitLoss >= 0 ? "green" : "red",
                          }}
                        >
                          Rs.{item.profitLoss}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <br />
      <div
        style={{
          display: "flex",
          flexFlow: "column wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          style={{ width: "250px" }}
          onClick={() => {
            resetDetails();
            resetPage();
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default GameDetails;
