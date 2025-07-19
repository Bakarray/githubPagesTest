// DOM Elements
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

// State variables
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// Initialize the app
function init() {
  renderTasks();
  updateTaskCount();

  // Add event listeners
  addBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.dataset.filter;
      renderTasks();
    });
  });
}

// Add a new task
function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    showMessage("Please enter a task", "error");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date(),
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  updateTaskCount();

  // Reset input and focus
  taskInput.value = "";
  taskInput.focus();

  showMessage("Task added successfully!", "success");
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
  updateTaskCount();
}

// Delete a task
function deleteTask(taskId) {
  // Find the task element for animation
  const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.classList.add("slide-out");

    // Remove after animation completes
    setTimeout(() => {
      tasks = tasks.filter((task) => task.id !== taskId);
      saveTasks();
      renderTasks();
      updateTaskCount();
      showMessage("Task deleted", "info");
    }, 300);
  }
}

// Clear completed tasks
function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  updateTaskCount();
  showMessage("Completed tasks cleared", "info");
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update task count display
function updateTaskCount() {
  const activeTasks = tasks.filter((task) => !task.completed).length;
  const totalTasks = tasks.length;

  if (totalTasks === 0) {
    taskCount.textContent = "No tasks";
  } else if (activeTasks === 0) {
    taskCount.textContent = "All tasks completed!";
  } else {
    taskCount.textContent = `${activeTasks} of ${totalTasks} tasks remaining`;
  }
}

// Show temporary message
function showMessage(message, type) {
  // Remove any existing messages
  const existingMessage = document.querySelector(".message");
  if (existingMessage) existingMessage.remove();

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;

  // Style based on type
  messageEl.style.position = "fixed";
  messageEl.style.top = "20px";
  messageEl.style.left = "50%";
  messageEl.style.transform = "translateX(-50%)";
  messageEl.style.padding = "12px 25px";
  messageEl.style.borderRadius = "8px";
  messageEl.style.color = "white";
  messageEl.style.fontWeight = "600";
  messageEl.style.zIndex = "1000";
  messageEl.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  messageEl.style.animation = "fadeIn 0.3s ease";

  // Set background color based on type
  if (type === "success") {
    messageEl.style.backgroundColor = "#4caf50";
  } else if (type === "error") {
    messageEl.style.backgroundColor = "#ff6584";
  } else {
    messageEl.style.backgroundColor = "#6c63ff";
  }

  document.body.appendChild(messageEl);

  // Remove after 3 seconds
  setTimeout(() => {
    messageEl.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(() => {
      messageEl.remove();
    }, 500);
  }, 3000);
}

// Render tasks based on current filter
function renderTasks() {
  // Clear the task list
  taskList.innerHTML = "";

  // Apply filter
  let filteredTasks = tasks;
  if (currentFilter === "active") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  // Render tasks or empty state
  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='1.5'%3E%3Cpath d='M3 12h18M9 16h6M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4'/%3E%3C/svg%3E" alt="No tasks">
                    <p>No tasks found. Add a new task to get started!</p>
                `;
    taskList.appendChild(emptyState);
    return;
  }

  // Render tasks
  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";
    taskItem.dataset.id = task.id;

    taskItem.innerHTML = `
                    <div class="task-checkbox ${
                      task.completed ? "checked" : ""
                    }"></div>
                    <div class="task-text ${
                      task.completed ? "completed" : ""
                    }">${task.text}</div>
                    <button class="delete-btn" aria-label="Delete task">×</button>
                `;

    // Add event listeners
    const checkbox = taskItem.querySelector(".task-checkbox");
    checkbox.addEventListener("click", () => toggleTaskCompletion(task.id));

    const deleteBtn = taskItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(taskItem);
  });
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);

// Add fadeOut animation to keyframes for message removal
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, 0); }
                to { opacity: 0; transform: translate(-50%, -20px); }
            }
        `,
  styleSheet.cssRules.length
);
