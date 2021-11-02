const express = require("express");
const cors = require("cors");

const { v4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (request, response, next) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found." });
  }

  request.user = user;
  return next();
};

const checksExistsTodo = (request, response, next) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found." });
  }

  request.todoIndex = todoIndex;
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

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
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
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user, todoIndex } = request;

    user.todos[todoIndex].title = title;
    user.todos[todoIndex].deadline = deadline;

    return response.status(200).send(user.todos[todoIndex]);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { user, todoIndex } = request;

    user.todos[todoIndex].done = true;

    return response.status(200).json(user.todos[todoIndex]);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { user, todoIndex } = request;

    user.todos.splice(todoIndex, 1);

    return response.status(204).json(user.todos);
  }
);

module.exports = app;
