const express = require("express");
const cors = require("cors");

const { v4, validate } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (request, response, next) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;
  return next();
};

const checksCreateTodosUserAvailability = (request, response, next) => {
  const { user } = request;

  if (user.pro || user.todos.length < 10) {
    next();
  }
  return response.status(403).json({ error: "Todo limit reached." });
};

const checksTodoExists = (request, response, next) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  const { id } = request.params;
  if (!validate(id)) {
    return response.status(400).json({ error: "Id param invalid." });
  }

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found." });
  }

  request.todo = user.todos[todoIndex];
  request.user = user;
  return next();
};

const findUserById = (request, response, next) => {
  const { id } = request.params;
  const user = users.find((user) => user.id === id);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;
  return next();
};

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const hasUser = users.some((user) => user.username === username);
  if (hasUser) {
    return response.status(400).json({ error: "User already exists." });
  }

  const userObject = { id: v4(), name, username, todos: [] };
  users.push(userObject);

  return response.status(201).send(userObject);
});

app.get("/users/:id", findUserById, (request, response) => {
  const { user } = request;

  return response.json(user);
});

app.patch("/users/:id/pro", findUserById, (request, response) => {
  const { user } = request;

  if (user.pro) {
    return response
      .status(400)
      .json({ error: "Pro plan is already activated." });
  }

  user.pro = true;

  return response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post(
  "/todos",
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;

    const todoObject = {
      id: v4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    };

    user.todos.push(todoObject);
    return response.status(201).send(todoObject);
  }
);

app.put("/todos/:id", checksTodoExists, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).send(todo);
});

app.patch("/todos/:id/done", checksTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { user, todo } = request;

    const todoIndex = user.todos.indexOf(todo);

    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
  }
);

module.exports = {
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById,
};
