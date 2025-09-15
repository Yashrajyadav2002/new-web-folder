function play(userChoice) {
  const choices = ["rock", "paper", "scissors"];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];

  let result = "";

  if (userChoice === computerChoice) {
    result = It's a Draw! Both chose ${userChoice};
  } else if (
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "paper" && computerChoice === "rock") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    result = 🎉 You Win! ${userChoice} beats ${computerChoice};
  } else {
    result = 😢 You Lose! ${computerChoice} beats ${userChoice};
  }

  document.getElementById("result").textContent = result;
}