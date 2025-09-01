function addTask() {
  let input = document.getElementById("taskInput");
  let taskText = input.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  let li = document.createElement("li");
  li.innerHTML = `
    <span onclick="toggleComplete(this)">${taskText}</span>
    <button class="delete-btn" onclick="deleteTask(this)">X</button>
  `;

  document.getElementById("taskList").appendChild(li);
  input.value = "";
}

function toggleComplete(task) {
  task.parentElement.classList.toggle("completed");
}

function deleteTask(btn) {
  btn.parentElement.remove();
}
