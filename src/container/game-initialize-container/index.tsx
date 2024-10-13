import React, { useState } from "react";
import GameDetails from "../game-details-container";

const GameInitialize = () => {
  const [players, setPlayers] = useState<any[]>([
    { name: "deepak", status: "added" },
    { name: "amit", status: "added" },
    { name: "kiran", status: "added" },
  ]);
  const [initialAmount, setInitialAmount] = useState(500);
  const [showDetails, setShowDetails] = useState(false);

  // Handle change for player name input
  const handlePlayerChange = (index: any, event: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = event.target.value;
    setPlayers(updatedPlayers);
  };

  // Handle change for initial amount
  const handleAmountChange = (event: any) => {
    setInitialAmount(Number(event.target.value));
  };

  // Add a new player input field
  const handleAddPlayer = () => {
    setPlayers([
      ...players.map((p) => ({ ...p, status: "added" })),
      { name: "" },
    ]);
  };

  // Remove a player input field
  const handleRemovePlayer = (index: any) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  // Submit the form and initialize player amounts
  const handleSubmit = (event: any) => {
    event.preventDefault();
    setShowDetails(true);
  };

  return !showDetails ? (
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
      <h2>Poker Game Settings</h2>
      <form onSubmit={handleSubmit}>
        <h3>Enter Initial Amount</h3>
        <input
          type="number"
          value={initialAmount}
          onChange={handleAmountChange}
        />

        <h3>Enter Player Names</h3>
        {players.map((player, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Enter player name"
              value={player.name}
              onChange={(e) => handlePlayerChange(index, e)}
            />
            {player.status === "added" && players.length > 1 && (
              <button
                style={{ marginLeft: "5px" }}
                type="button"
                onClick={() => handleRemovePlayer(index)}
              >
                Remove
              </button>
            )}
            {index === players.length - 1 && (
              <button
                style={{ marginLeft: "5px" }}
                type="button"
                onClick={handleAddPlayer}
              >
                Add
              </button>
            )}
          </div>
        ))}

        <br />
        <button style={{ width: "250px" }} type="submit">
          Submit
        </button>
      </form>
    </div>
  ) : (
    <GameDetails
      details={{
        players: players
          .filter((p) => p.name !== "")
          .map((p) => p.name.toUpperCase()),
        initialAmount,
      }}
    />
  );
};

export default GameInitialize;
