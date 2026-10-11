(() => {
  const $ = (id) => document.getElementById(id);
  const welcomeScreen = $("welcome-screen");
  const gameScreen = $("game-screen");
  const guessInput = $("guess-input");
  const guessForm = $("guess-form");
  const resultMessage = $("result-message");
  const historyList = $("history-list");
  const emptyHistory = $("empty-history");
  const winBanner = $("win-banner");
  const winCopy = $("win-copy");
  const newGameButton = $("new-game-button");
  const toast = $("toast");

  let secret = generateSecret();
  let attempts = 0;
  let history = [];
  let isWin = false;
  let toastTimer;
  let bestScore = readBestScore();

  function generateSecret() {
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    return digits.slice(0, 4).join("");
  }

  function readBestScore() {
    try {
      const value = Number(localStorage.getItem("cowbull-best"));
      return Number.isInteger(value) && value > 0 ? value : null;
    } catch (_) {
      return null;
    }
  }

  function saveBestScore(value) {
    try { localStorage.setItem("cowbull-best", String(value)); } catch (_) {}
  }

  function updateBestScore() {
    const display = bestScore === null ? "—" : bestScore;
    $("best-score").textContent = display;
    $("side-best-score").textContent = display === "—" ? display : `${display} attempts`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setMessage(message, type = "") {
    resultMessage.textContent = message;
    resultMessage.className = "result-message" + (type ? ` ${type}` : "");
  }

  function countClues(guess) {
    let cows = 0;
    let bulls = 0;
    for (let i = 0; i < 4; i++) {
      if (guess[i] === secret[i]) cows++;
      else if (secret.includes(guess[i])) bulls++;
    }
    return { bulls, cows };
  }

  function renderHistory() {
    historyList.innerHTML = "";
    $("history-count").textContent = `${history.length} ${history.length === 1 ? "guess" : "guesses"}`;
    if (history.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-history";
      empty.innerHTML = '<span>⌁</span><p>No guesses yet. Your first move is waiting.</p>';
      historyList.appendChild(empty);
      return;
    }
    history.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "history-item";
      const left = document.createElement("div");
      const guess = document.createElement("div");
      guess.className = "history-guess";
      guess.textContent = item.guess;
      const meta = document.createElement("div");
      meta.className = "history-meta";
      meta.textContent = `Attempt ${item.attempt}`;
      left.append(guess, meta);
      const badges = document.createElement("div");
      badges.className = "history-badges";
      const bull = document.createElement("span");
      bull.className = "mini-badge bull";
      bull.textContent = `${item.bulls} bulls`;
      const cow = document.createElement("span");
      cow.className = "mini-badge cow";
      cow.textContent = `${item.cows} cows`;
      badges.append(bull, cow);
      row.append(left, badges);
      historyList.appendChild(row);
    });
  }

  function updateAttempts() {
    $("attempt-count").textContent = attempts;
    $("side-attempt-count").textContent = attempts;
  }

  function resetRound() {
    secret = generateSecret();
    attempts = 0;
    history = [];
    isWin = false;
    guessInput.disabled = false;
    $("check-button").disabled = false;
    guessInput.value = "";
    winBanner.classList.add("hidden");
    newGameButton.classList.add("hidden");
    updateAttempts();
    renderHistory();
    setMessage("New code generated. Make your first guess.");
    guessInput.focus();
  }

  $("start-button").addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    updateBestScore();
    guessInput.focus();
  });

  $("home-button").addEventListener("click", () => {
    gameScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
  });

  guessInput.addEventListener("input", () => {
    // Keep only digits and limit to four characters.
    guessInput.value = guessInput.value.replace(/\D/g, "").slice(0, 4);
  });

  guessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (isWin) return;
    const guess = guessInput.value.trim();

    if (!/^[1-9]{4}$/.test(guess)) {
      setMessage("Enter exactly four digits from 1 to 9.", "error");
      showToast("Use four digits from 1–9.");
      guessInput.focus();
      return;
    }
    if (new Set(guess).size !== 4) {
      setMessage("Each digit must be unique. Remove repeated digits.", "error");
      showToast("Repeated digits are not allowed.");
      guessInput.focus();
      return;
    }

    attempts++;
    const { bulls, cows } = countClues(guess);
    history.unshift({ guess, bulls, cows, attempt: attempts });
    updateAttempts();
    renderHistory();
    guessInput.value = "";

    if (cows === 4) {
      isWin = true;
      setMessage(`🎉 You win in ${attempts} ${attempts === 1 ? "move" : "moves"}!`, "success");
      winCopy.textContent = `You cracked the code in ${attempts} ${attempts === 1 ? "attempt" : "attempts"}.`;
      winBanner.classList.remove("hidden");
      if (bestScore === null || attempts < bestScore) {
        bestScore = attempts;
        saveBestScore(bestScore);
        updateBestScore();
        showToast("New personal best! 🏆");
      }
      guessInput.disabled = true;
      $("check-button").disabled = true;
      newGameButton.classList.remove("hidden");
    } else {
      setMessage(`Bulls: ${bulls}  ·  Cows: ${cows}`, "");
      guessInput.focus();
    }
  });

  newGameButton.addEventListener("click", resetRound);
  updateBestScore();
})();