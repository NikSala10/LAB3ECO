const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use("/pantalla", express.static(path.join(__dirname, "Pantalla-Client")));
app.use("/player", express.static(path.join(__dirname, "Player-Client")));

let players = [];
let gameResult = "";
let gameReset = false;
let timeoutId = null;

app.get('/ataques', (req, res) => { 
  const ready = players.length === 2 && players.every(p => p.ataque);
  res.json({ players, ready });
});

app.post('/ataques', (request, res) => { 
  const {player, name, ataque} = request.body;

  let existingPlayer = players.find(p => p.player === player);

  if (existingPlayer) {
      existingPlayer.name = name || existingPlayer.name; 
      if (ataque) {
          existingPlayer.ataque = ataque; 
      }
  } else {
      players.push({ player, name, ataque: ataque || null }); 
  }

  if (players.length === 2) {
    if (!timeoutId) {
        startAttackTimer(); 
    }

    if (players.every(p => p.ataque)) {
        clearTimeout(timeoutId); 
        timeoutId = null;
        winnerGame(); 
    }
}

  res.json({ players, ready: players.length === 2 });
});

app.get("/jugadores-listos", (req, res) => {
  const ready = players.length === 2 && players.every(p => p.name); 
  res.json({ ready });
});

app.post("/estado", (req, res) => {
  players.forEach(p => {
    if (!p.ataque) { 
      p.ataque = "piedra";
    }
  });
  res.json({ message: "Tiempo terminado, ataques asignados" });
});

app.get("/estado", (req, res) => {
  const ready = players.length === 2 && players.every(p => p.name); 
  res.json({ ready });
});

function startAttackTimer() {
  timeoutId = setTimeout(() => {
      const p1 = players.find(p => p.player === 1);
      const p2 = players.find(p => p.player === 2);

      if (!p1.ataque && p2.ataque) {
          gameResult = `${p2.name} gana automáticamente porque ${p1.name} no eligió a tiempo`;
      } else if (!p2.ataque && p1.ataque) {
          gameResult = `${p1.name} gana automáticamente porque ${p2.name} no eligió a tiempo`;
      } else {
          gameResult = "Nadie eligió, partida cancelada";
      }

      console.log(gameResult);
  }, 10000);
}

function winnerGame() {
  const [p1, p2] = players;
  let resultado = "";

  if (p1.ataque === p2.ataque) {
      resultado = "Empate";
  } else if (
      (p1.ataque === "piedra" && p2.ataque === "tijera") ||
      (p1.ataque === "papel" && p2.ataque === "piedra") ||
      (p1.ataque === "tijera" && p2.ataque === "papel")
  ) {
      resultado = `${p1.name} gana`;
  } else {
      resultado = `${p2.name} gana`;
  }

  gameResult = resultado;
}


app.get("/resultado", (req, res) => {
  res.json({ resultado: gameResult || "Esperando resultados..." });
});


function resetGame() {
  players = [];
  gameResult = "";
  gameReset = true; 
  timeoutId = null;

  setTimeout(() => {
    gameReset = false;
  }, 1000);
}

app.post("/reset", (req, res) => {
  resetGame();
  res.json({ message: "Partida reiniciada" });
});

app.get("/reset-status", (req, res) => {
  res.json({ reset: gameReset });
});

app.listen(5050);
