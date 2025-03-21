const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let games = {}; // Almacena las partidas activas

wss.on("connection", (ws) => {
  let gameId = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      gameId = data.gameId;
      if (!games[gameId]) {
        games[gameId] = { players: [], board: Array(9).fill(null), turn: "X" };
      }
      games[gameId].players.push(ws);
      ws.send(JSON.stringify({ type: "update", board: games[gameId].board, turn: games[gameId].turn }));
    }

    if (data.type === "move" && gameId && games[gameId]) {
      const game = games[gameId];
      if (!game.board[data.index] && data.player === game.turn) {
        game.board[data.index] = game.turn;
        game.turn = game.turn === "X" ? "O" : "X";

        // Enviar actualización a los jugadores
        game.players.forEach((player) =>
          player.send(JSON.stringify({ type: "update", board: game.board, turn: game.turn }))
        );
      }
    }
  });

  ws.on("close", () => {
    if (gameId && games[gameId]) {
      games[gameId].players = games[gameId].players.filter((player) => player !== ws);
      if (games[gameId].players.length === 0) {
        delete games[gameId];
      }
    }
  });
});

console.log("Servidor WebSocket corriendo en ws://localhost:8080");
