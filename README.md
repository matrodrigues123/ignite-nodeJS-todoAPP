# Ignite (Node.JS): Challenge 1

### Intro
This challenge consists of a Todo APP in Node.JS, including user creation and todo CRUD. The user can be 'premium' or 'free', the latter being limited to 10 todos. The intent of this project is to study and train the concepts of Node.JS, including Middleware, Express and unit testing (jest).

## Routes

### POST `/users`

The route receives `name` and `username` from the application's body and should be stored in the following format:  

```jsx
{ 
	id: 'uuid', // should be uuid
	name: 'Matheus Rodrigues', 
	username: 'mat', 
	todos: []
}
```
### GET `/users/:id`

Finds users by ID.

### PATCH `/users/:id/pro`

Change the user status to pro if it currently isn't.

### GET `/todos`

The route should receive the property `username` from the header and return a list with this user's todos.

### POST `/todos`

The route receives `title` and `deadline` from the body and `username` from the header. The new *todo* should be stored in this user's todo list. The todos should be in the following format: 

```jsx
{ 
	id: 'uuid', // should be uuid
	title: 'Task name',
	done: false, 
	deadline: '2021-02-27T00:00:00.000Z', 
	created_at: '2021-02-22T00:00:00.000Z'
}
```

**Note**: The property `done` should always be initialized as false upon the creation of a new *todo*.


### PUT `/todos/:id`

The route receives `title` and `deadline` from the body and `username` from the header. The only alteration should be `title` and `deadline` from the todo that has the same `id` as the one present in this route's params.

### PATCH `/todos/:id/done`

The route receives `username` from the header and changes the property `done` to `true` on the *todo* that has the same `id` as the one present in this route's params.

### DELETE `/todos/:id`

The route receives `username` from the header and deletes the *todo* that has the same `id` as the one present in this route's params.
