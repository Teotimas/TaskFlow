const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "tasks.json");
const AUTH_TOKEN = "taskflow-demo-token";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use("/api", (req, res, next) => {
  if (!req.get("X-Client-Name")) {
    return res.status(400).json({ message: "Truksta X-Client-Name header." });
  }

  next();
});

function isAuthorized(req) {
  return req.headers.authorization === `Bearer ${AUTH_TOKEN}`;
}

function requireAuth(req, res, next) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ message: "Truksta arba neteisingas Authorization header." });
  }

  next();
}

async function readTasks() {
  const data = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(data);
}

async function saveTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function validateTaskInput(body, partial = false) {
  const errors = [];
  const allowedPriorities = ["low", "medium", "high"];
  const allowedStatuses = ["active", "done"];

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length < 3) {
      errors.push("title turi buti bent 3 simboliu tekstas.");
    }
  }

  if (!partial || body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.trim().length < 3) {
      errors.push("description turi buti bent 3 simboliu tekstas.");
    }
  }

  if (!partial || body.priority !== undefined) {
    if (!allowedPriorities.includes(body.priority)) {
      errors.push("priority turi buti low, medium arba high.");
    }
  }

  if (!partial || body.deadline !== undefined) {
    if (typeof body.deadline !== "string" || Number.isNaN(Date.parse(body.deadline))) {
      errors.push("deadline turi buti data, pvz. 2026-05-30.");
    }
  }

  if (body.status !== undefined && !allowedStatuses.includes(body.status)) {
    errors.push("status turi buti active arba done.");
  }

  return errors;
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "studentas" && password === "slaptazodis") {
    return res.json({
      token: AUTH_TOKEN,
      user: { username: "studentas", name: "Studentas" }
    });
  }

  return res.status(401).json({ message: "Neteisingas vartotojo vardas arba slaptazodis." });
});

app.get("/api/tasks", requireAuth, async (req, res) => {
  const { status, priority, search } = req.query;
  let tasks = await readTasks();

  if (status) {
    tasks = tasks.filter((task) => task.status === status);
  }

  if (priority) {
    tasks = tasks.filter((task) => task.priority === priority);
  }

  if (search) {
    const query = search.toLowerCase();
    tasks = tasks.filter((task) =>
      `${task.title} ${task.description}`.toLowerCase().includes(query)
    );
  }

  res.json(tasks);
});

app.get("/api/tasks/:id", requireAuth, async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find((item) => item.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Uzduotis nerasta." });
  }

  res.json(task);
});

app.post("/api/tasks", requireAuth, async (req, res) => {
  const errors = validateTaskInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validacijos klaida.", errors });
  }

  const tasks = await readTasks();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    priority: req.body.priority,
    deadline: req.body.deadline,
    status: "active",
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", requireAuth, async (req, res) => {
  const errors = validateTaskInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validacijos klaida.", errors });
  }

  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((item) => item.id === Number(req.params.id));

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Uzduotis nerasta." });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    priority: req.body.priority,
    deadline: req.body.deadline,
    status: req.body.status || tasks[taskIndex].status,
    updatedAt: new Date().toISOString()
  };

  await saveTasks(tasks);
  res.json(tasks[taskIndex]);
});

app.patch("/api/tasks/:id/status", requireAuth, async (req, res) => {
  const errors = validateTaskInput(req.body, true);

  if (errors.length > 0 || req.body.status === undefined) {
    return res.status(400).json({
      message: "Validacijos klaida.",
      errors: errors.length > 0 ? errors : ["status yra privalomas."]
    });
  }

  const tasks = await readTasks();
  const task = tasks.find((item) => item.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ message: "Uzduotis nerasta." });
  }

  task.status = req.body.status;
  task.updatedAt = new Date().toISOString();

  await saveTasks(tasks);
  res.json(task);
});

app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
  const tasks = await readTasks();
  const taskExists = tasks.some((item) => item.id === Number(req.params.id));

  if (!taskExists) {
    return res.status(404).json({ message: "Uzduotis nerasta." });
  }

  const remainingTasks = tasks.filter((item) => item.id !== Number(req.params.id));
  await saveTasks(remainingTasks);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`TaskFlow sistema paleista: http://localhost:${PORT}`);
});
