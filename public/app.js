const API_URL = "/api";
const tokenKey = "taskflowToken";

const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const taskForm = document.querySelector("#taskForm");
const tasksList = document.querySelector("#tasksList");
const loginMessage = document.querySelector("#loginMessage");
const formMessage = document.querySelector("#formMessage");
const logoutBtn = document.querySelector("#logoutBtn");
const userBadge = document.querySelector("#userBadge");
const cancelEditBtn = document.querySelector("#cancelEditBtn");
const formMode = document.querySelector("#formMode");

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setLoggedIn(isLoggedIn) {
  loginView.classList.toggle("d-none", isLoggedIn);
  appView.classList.toggle("d-none", !isLoggedIn);
  logoutBtn.classList.toggle("d-none", !isLoggedIn);
  userBadge.classList.toggle("d-none", !isLoggedIn);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      "X-Client-Name": "TaskFlow-FE",
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors ? data.errors.join(" ") : data.message);
  }

  return data;
}

function getTaskPayload() {
  return {
    title: document.querySelector("#title").value,
    description: document.querySelector("#description").value,
    priority: document.querySelector("#priority").value,
    deadline: document.querySelector("#deadline").value
  };
}

function resetForm() {
  taskForm.reset();
  document.querySelector("#taskId").value = "";
  document.querySelector("#priority").value = "medium";
  formMode.textContent = "Sukurti nauja uzduoti";
  cancelEditBtn.classList.add("d-none");
  formMessage.textContent = "";
}

function buildQuery() {
  const params = new URLSearchParams();
  const status = document.querySelector("#statusFilter").value;
  const priority = document.querySelector("#priorityFilter").value;
  const search = document.querySelector("#searchFilter").value.trim();

  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  if (search) params.set("search", search);

  return params.toString() ? `?${params.toString()}` : "";
}

function renderTasks(tasks) {
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="text-secondary py-4 text-center">Uzduociu nerasta.</div>';
    return;
  }

  tasksList.innerHTML = tasks.map((task) => `
    <article class="task-card ${task.status === "done" ? "done" : ""}">
      <div class="d-flex flex-column flex-md-row justify-content-between gap-2">
        <div>
          <h3 class="h5 task-title mb-1">${task.title}</h3>
          <p class="text-secondary mb-2">${task.description}</p>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge badge-priority-${task.priority}">${task.priority}</span>
            <span class="badge text-bg-light">${task.status}</span>
            <span class="badge text-bg-light">${task.deadline}</span>
          </div>
        </div>
        <div class="task-actions d-flex flex-md-column gap-2">
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${task.id}">Redaguoti</button>
          <button class="btn btn-sm btn-outline-success" data-action="toggle" data-id="${task.id}" data-status="${task.status}">
            ${task.status === "done" ? "Aktyvi" : "Atlikta"}
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${task.id}">Trinti</button>
        </div>
      </div>
    </article>
  `).join("");
}

async function loadTasks() {
  const tasks = await request(`/tasks${buildQuery()}`);
  renderTasks(tasks);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-Name": "TaskFlow-FE" },
      body: JSON.stringify({
        username: document.querySelector("#username").value,
        password: document.querySelector("#password").value
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    localStorage.setItem(tokenKey, data.token);
    setLoggedIn(true);
    await loadTasks();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#taskId").value;
  const method = id ? "PUT" : "POST";
  const path = id ? `/tasks/${id}` : "/tasks";

  try {
    await request(path, {
      method,
      body: JSON.stringify(getTaskPayload())
    });
    formMessage.className = "small text-success";
    formMessage.textContent = "Issaugota.";
    resetForm();
    await loadTasks();
  } catch (error) {
    formMessage.className = "small text-danger";
    formMessage.textContent = error.message;
  }
});

tasksList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.dataset.id;

  try {
    if (button.dataset.action === "edit") {
      const task = await request(`/tasks/${id}`);
      document.querySelector("#taskId").value = task.id;
      document.querySelector("#title").value = task.title;
      document.querySelector("#description").value = task.description;
      document.querySelector("#priority").value = task.priority;
      document.querySelector("#deadline").value = task.deadline;
      formMode.textContent = `Redaguojama uzduotis #${task.id}`;
      cancelEditBtn.classList.remove("d-none");
    }

    if (button.dataset.action === "toggle") {
      const nextStatus = button.dataset.status === "done" ? "active" : "done";
      await request(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      await loadTasks();
    }

    if (button.dataset.action === "delete") {
      await request(`/tasks/${id}`, { method: "DELETE" });
      await loadTasks();
    }
  } catch (error) {
    formMessage.className = "small text-danger";
    formMessage.textContent = error.message;
  }
});

document.querySelector("#refreshBtn").addEventListener("click", loadTasks);
document.querySelector("#statusFilter").addEventListener("change", loadTasks);
document.querySelector("#priorityFilter").addEventListener("change", loadTasks);
document.querySelector("#searchFilter").addEventListener("input", loadTasks);
cancelEditBtn.addEventListener("click", resetForm);

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  setLoggedIn(false);
  resetForm();
});

if (getToken()) {
  setLoggedIn(true);
  loadTasks();
} else {
  setLoggedIn(false);
}
