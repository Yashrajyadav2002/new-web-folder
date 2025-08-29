// Random number 1–100
let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

const guessInput   = document.getElementById('guess');
const submitBtn    = document.getElementById('submitBtn');
const resetBtn     = document.getElementById('resetBtn');
const messageEl    = document.getElementById('message');
const attemptCount = document.getElementById('attemptCount');

function setMessage(text, type = 'hint') {
  messageEl.textContent = text;
  messageEl.className = type; // sets class to success/error/hint
}

function validateGuess(value) {
  if (value === '' || isNaN(value)) return 'Please enter a number.';
  const num = Number(value);
  if (num < 1 || num > 100) return 'Enter a number between 1 and 100.';
  return null;
}

function checkGuess() {
  const value = guessInput.value.trim();
  const error = validateGuess(value);
  if (error) {
    setMessage(error, 'error');
    return;
  }

  const userGuess = Number(value);
  attempts++;
  attemptCount.textContent = attempts.toString();

  if (userGuess === randomNumber) {
    setMessage('🎉 Correct! You guessed it!', 'success');
    guessInput.disabled = true;
    submitBtn.disabled = true;
  } else if (userGuess > randomNumber) {
    setMessage('📉 Too high! Try again.', 'hint');
  } else {
    setMessage('📈 Too low! Try again.', 'hint');
  }

  guessInput.focus();
  guessInput.select();
}

function resetGame() {
  randomNumber = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  attemptCount.textContent = '0';
  guessInput.value = '';
  guessInput.disabled = false;
  submitBtn.disabled = false;
  setMessage('New game started. Start guessing…', 'hint');
  guessInput.focus();
}

// Events
submitBtn.addEventListener('click', checkGuess);
resetBtn.addEventListener('click', resetGame);

// Allow Enter key to submit
guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkGuess();
});

// Initial focus
guessInput.focus();