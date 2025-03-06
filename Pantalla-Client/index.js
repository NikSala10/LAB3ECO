document.getElementById("start-game-btn").addEventListener("click", () => {
  window.open("http://localhost:5050/player/?player=1", "_blank");
  window.open("http://localhost:5050/player/?player=2", "_blank");
});

document.getElementById("resultado").style.display = "none"
document.getElementById("about-player").style.display = "none"

function checkPlayersReady() {
  fetch("http://localhost:5050/estado")
    .then(response => response.json())
    .then(data => {
      if (data.ready) {
        document.getElementById("screen-message").style.display = "none"; 
        document.getElementById("about-player").style.display = "block"; 
        startCountdown();
      } else {
        setTimeout(checkPlayersReady, 1000); 
      }
    })
    .catch(error => console.error("Error verificando jugadores:", error));
}

function startCountdown() {
  let timeCount = 10;
  const countdownSpan = document.getElementById("contador");

  if (!countdownSpan) {
    console.error("Elemento 'contador' no encontrado");
    return;
  }

  countdownSpan.innerText = `Tiempo restante: ${timeCount} segundos`;

  const interval = setInterval(() => {
    timeCount--;
    countdownSpan.innerText = `Tiempo restante: ${timeCount} segundos`;

    if (timeCount === 0) {
      clearInterval(interval);
      countdownSpan.innerText = "¡Tiempo terminado!";
      countdownSpan.style.fontWeight = "bold";
      notifyTimeUp();
    }
  }, 1000);
}

function showResults() {
  setInterval(() => {
    fetch("http://localhost:5050/resultado")
      .then(response => response.json())
      .then(data => {
        const results = document.getElementById("resultado")
        results.style.display = "block"
        results.innerText = data.resultado;

        setTimeout(() => {
          results.style.display = "none";
          resetGame(); 
        }, 5000);
      
      })
      
      .catch(error => console.error("Error obteniendo resultados:", error));
  }, 1000);
}

function notifyTimeUp() {
  fetch("http://localhost:5050/estado", { method: "POST" })
    .then(() => showResults()) 
    .catch(error => console.error("Error notificando fin de tiempo:", error));
}

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

function resetGame() {
  document.getElementById("start-game-btn").style.display = "none"
  fetch("http://localhost:5050/reset", { method: "POST" })
    .catch(error => console.error("Error reiniciando el juego:", error));
}
checkPlayersReady();





