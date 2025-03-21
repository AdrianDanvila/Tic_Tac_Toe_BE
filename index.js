const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let games = {}; // Almacena partidas activas

server.listen(PORT, () => {
  console.log(`✅ Servidor WebSocket corriendo en el puerto ${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("🔵 Nuevo jugador conectado");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("📩 Mensaje recibido:", data);

    if (data.type === "join") {
      let gameId = data.gameId;
      if (!games[gameId]) {
        games[gameId] = { players: [], board: Array(9).fill(null), turn: "X" };
      }

      let game = games[gameId];

      if (game.players.length < 2) {
        game.players.push(ws);
        const playerSymbol = game.players.length === 1 ? "X" : "O";
        ws.send(JSON.stringify({ type: "assign", player: playerSymbol, board: game.board, turn: game.turn }));
      } else {
        ws.send(JSON.stringify({ type: "full", message: "La sala está llena" }));
      }
    }

    if (data.type === "move") {
      let game = games[data.gameId];

      if (game && game.turn === data.player && !game.board[data.index]) {
        game.board[data.index] = data.player;
        game.turn = game.turn === "X" ? "O" : "X";

        game.players.forEach((player) => {
          if (player.readyState === WebSocket.OPEN) {
            player.send(JSON.stringify({ type: "update", board: game.board, turn: game.turn }));
          }
        });
      }
    }
  });

  ws.on("close", () => console.log("🔴 Jugador desconectado"));
});
