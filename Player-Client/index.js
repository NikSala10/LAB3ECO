

const urlParams = new URLSearchParams(window.location.search);
const playerParam = urlParams.get("player"); 
const playerNumber = playerParam ? parseInt(playerParam, 10) : null; 

if (!playerNumber || playerNumber < 1 || playerNumber > 2) { 
  throw new Error("Player number not found or invalid");
} 

let playerNameGlobal = ""
const playerName = document.getElementById("player-name")
const fetchUrl = 'http://localhost:5050/ataques'

document.getElementById("piedra").disabled = true;
document.getElementById("papel").disabled = true;
document.getElementById("tijera").disabled = true;

async function fetchPlayerData() {
  try {
    playerNameGlobal = playerName.value
    if (!playerNameGlobal) {
      throw new Error("Por favor ingrese un nombre de jugador");
    }
    document.getElementById("waiting-message").innerText = playerNameGlobal + "," + " esperando al otro jugador...";
    document.getElementById("waiting-message").style.display = "block";


    const playerRequest = { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' ,
      },
      body: JSON.stringify({
        player: playerNumber,
        name: playerNameGlobal,
      }),
    }

    const response = await fetch(fetchUrl, playerRequest);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    playerName.value = "";
    document.getElementById("name").style.display = "none";

    checkPlayersReady();

  } catch (error) {
    console.error('Error al enviar datos:', error.message);
    alert(error.message)
  }
}

document.getElementById("send-btn").addEventListener("click", fetchPlayerData);

async function checkPlayersReady() {
  try {
    const response = await fetch("http://localhost:5050/jugadores-listos");
    const data = await response.json();

    if (data.ready) {
      document.getElementById("waiting-message").innerText = "¡Ambos jugadores están listos! Elige tu ataque.";
      document.getElementById("piedra").disabled = false;
      document.getElementById("papel").disabled = false;
      document.getElementById("tijera").disabled = false;
    } else {
      setTimeout(checkPlayersReady, 1000); 
    }
  } catch (error) {
    console.error("Error verificando jugadores listos:", error);
  }
}

let ataqueElegido = false;
let tiempoTerminado = false;

// Enviar ataque seleccionado
async function sendAttack(ataque) {
  if (ataqueElegido || tiempoTerminado) return; // Evita que se escojan dos opciones

  ataqueElegido = true;
    await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: playerNumber, ataque }),
    });

    document.getElementById("waiting-message").innerText = `${playerNameGlobal} Elegiste ${ataque}. Esperando resultados...`;
    document.getElementById("piedra").disabled = true;
    document.getElementById("papel").disabled = true;
    document.getElementById("tijera").disabled = true;
}

// Verificar si el tiempo se acabó y asignar ataque por defecto
async function checkTimeUp() {
    const response = await fetch("http://localhost:5050/estado");
    const data = await response.json();

    if (data.timeUp && !ataqueElegido) {
        tiempoTerminado = true;
        sendAttack("piedra"); // Si no elige, asigna "piedra"
    }
}

setInterval(checkTimeUp, 1000);

document.getElementById("piedra").addEventListener("click", () => sendAttack("piedra"));
document.getElementById("papel").addEventListener("click", () => sendAttack("papel"));
document.getElementById("tijera").addEventListener("click", () => sendAttack("tijera"));

function checkResetStatus() {
  fetch("http://localhost:5050/reset-status")
    .then(response => response.json())
    .then(data => {
      if (data.reset) {
        location.reload(); 
      }
    })
    .catch(error => console.error("Error verificando estado de reinicio:", error));
}

setInterval(checkResetStatus, 1000);