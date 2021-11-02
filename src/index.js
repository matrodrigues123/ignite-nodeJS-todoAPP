import express from "express";
import cors from "cors";
import { v4 } from "uuid";

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

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const hasUser = users.some((user) => user.username === username);
  if (hasUser) {
    return response.status(400).json({ error: "User already exists." });
  }

  users.push({ id: v4(), name, username, todos: [] });
  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });
  return response.status(201).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { newTitle, newDeadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    title: newTitle,
    deadline: newDeadline,
  };
  return response.status(200).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  user.todos[todoIndex].done = true;

  return response.status(200).json(user.todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  user.todos.splice(todoIndex, 1);

  return response.status(200).json(user.todos);
});

app.listen(3333);
