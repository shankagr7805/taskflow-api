// Point this at wherever the backend is running. Change the port here if
// you changed PORT in backend/.env
const API_BASE = "http://localhost:5001/api/v1";

let state = {
  token: localStorage.getItem("taskflow_token") || null,
  user: JSON.parse(localStorage.getItem("taskflow_user") || "null"),
};

document.getElementById("apiBaseLabel").textContent = API_BASE;

// ---------- small DOM helpers ----------
const $ = (id) => document.getElementById(id);

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = `message message--${type}`;
  el.classList.remove("hidden");
}

function hideMessage(el) {
  el.classList.add("hidden");
}

// ---------- API wrapper ----------
async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---------- session ----------
function saveSession(token, user) {
  state = { token, user };
  localStorage.setItem("taskflow_token", token);
  localStorage.setItem("taskflow_user", JSON.stringify(user));
}

function clearSession() {
  state = { token: null, user: null };
  localStorage.removeItem("taskflow_token");
  localStorage.removeItem("taskflow_user");
}

function renderAuthState() {
  const loggedIn = !!state.token;
  $("authScreen").classList.toggle("hidden", loggedIn);
  $("dashboard").classList.toggle("hidden", !loggedIn);
  $("userBar").classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    $("userEmail").textContent = state.user.email;
    $("userRole").textContent = state.user.role;
    $("userRole").classList.toggle("badge--admin", state.user.role === "admin");
    $("adminPanel").classList.toggle("hidden", state.user.role !== "admin");
    $("taskListTitle").textContent = state.user.role === "admin" ? "All tasks" : "Your tasks";
    loadTasks();
    if (state.user.role === "admin") loadUsers();
  }
}

// ---------- tabs ----------
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab--active"));
    tab.classList.add("tab--active");
    const target = tab.dataset.tab;
    $("loginForm").classList.toggle("hidden", target !== "login");
    $("registerForm").classList.toggle("hidden", target !== "register");
    hideMessage($("authMessage"));
  });
});

// ---------- auth forms ----------
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMessage($("authMessage"));
  const form = new FormData(e.target);

  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email: form.get("email"), password: form.get("password") },
    });
    saveSession(data.token, data.user);
    renderAuthState();
  } catch (err) {
    showMessage($("authMessage"), err.message, "error");
  }
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMessage($("authMessage"));
  const form = new FormData(e.target);

  try {
    const data = await api("/auth/register", {
      method: "POST",
      body: {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        adminCode: form.get("adminCode") || undefined,
      },
    });
    saveSession(data.token, data.user);
    renderAuthState();
  } catch (err) {
    showMessage($("authMessage"), err.message, "error");
  }
});

$("logoutBtn").addEventListener("click", () => {
  clearSession();
  renderAuthState();
});

// ---------- tasks ----------
function statusBadge(status) {
  return `<span class="badge badge--${status}">${status}</span>`;
}

function priorityBadge(priority) {
  return `<span class="badge badge--${priority}">${priority} priority</span>`;
}

function renderTasks(tasks) {
  const list = $("taskList");

  if (!tasks.length) {
    list.innerHTML = `<p class="empty-state">No tasks yet. Add one above to get started.</p>`;
    return;
  }

  list.innerHTML = tasks
    .map(
      (task) => `
    <div class="task" data-id="${task.id}">
      <div class="task__main">
        <p class="task__title">${escapeHtml(task.title)}</p>
        <div class="task__meta">
          ${statusBadge(task.status)}
          ${priorityBadge(task.priority)}
          ${task.owner && state.user.role === "admin" ? `<span class="badge">${escapeHtml(task.owner.name)}</span>` : ""}
        </div>
        ${task.description ? `<p class="task__desc">${escapeHtml(task.description)}</p>` : ""}
      </div>
      <div class="task__actions">
        <select class="status-select">
          <option value="pending" ${task.status === "pending" ? "selected" : ""}>pending</option>
          <option value="in_progress" ${task.status === "in_progress" ? "selected" : ""}>in_progress</option>
          <option value="done" ${task.status === "done" ? "selected" : ""}>done</option>
        </select>
        <button class="btn btn--small btn--danger-outline delete-btn">Delete</button>
      </div>
    </div>`
    )
    .join("");

  list.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const id = e.target.closest(".task").dataset.id;
      try {
        await api(`/tasks/${id}`, { method: "PUT", body: { status: e.target.value } });
        loadTasks();
      } catch (err) {
        showMessage($("taskMessage"), err.message, "error");
      }
    });
  });

  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".task").dataset.id;
      try {
        await api(`/tasks/${id}`, { method: "DELETE" });
        loadTasks();
      } catch (err) {
        showMessage($("taskMessage"), err.message, "error");
      }
    });
  });
}

async function loadTasks() {
  hideMessage($("taskMessage"));
  const status = $("statusFilter").value;
  const query = status ? `?status=${status}` : "";

  try {
    const data = await api(`/tasks${query}`);
    renderTasks(data.tasks);
    $("cacheIndicator").classList.toggle("hidden", !data.fromCache);
  } catch (err) {
    showMessage($("taskMessage"), err.message, "error");
  }
}

$("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  try {
    await api("/tasks", {
      method: "POST",
      body: {
        title: form.get("title"),
        description: form.get("description") || undefined,
        priority: form.get("priority"),
      },
    });
    e.target.reset();
    loadTasks();
  } catch (err) {
    showMessage($("taskMessage"), err.message, "error");
  }
});

$("statusFilter").addEventListener("change", loadTasks);
$("refreshBtn").addEventListener("click", loadTasks);

// ---------- admin panel ----------
async function loadUsers() {
  try {
    const data = await api("/admin/users");
    $("userList").innerHTML = data.users
      .map(
        (u) => `
      <div class="task">
        <div class="task__main">
          <p class="task__title">${escapeHtml(u.name)} <span class="badge">${u.email}</span></p>
        </div>
        <span class="badge ${u.role === "admin" ? "badge--admin" : ""}">${u.role}</span>
      </div>`
      )
      .join("");
  } catch (err) {
    // admin panel is non critical, fail quietly here
  }
}

// ---------- utils ----------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- boot ----------
renderAuthState();
