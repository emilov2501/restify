import axios from "axios";
import { TodoRepository } from "./TodoRepository.ts";

const client = axios.create({
	baseURL: "https://jsonplaceholder.typicode.com",
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// Example usage
const todoRepo = new TodoRepository(client);

// Get all todos
const allTodos = await todoRepo.getTodos();
console.log("All todos:", allTodos.data);

// Get todo by id
const todo = await todoRepo.getTodoById(1);
console.log("Todo by id:", todo.data);

// Get paginated list
const paginatedTodos = await todoRepo.getList(1, 10);
console.log("Paginated todos:", paginatedTodos.data);

// Create new todo
const newTodo = await todoRepo.createTodo({
	title: "New Todo",
	completed: false,
});
console.log("Created todo:", newTodo.data);

// Update todo
const updatedTodo = await todoRepo.updateTodo(1, {
	completed: true,
});
console.log("Updated todo:", updatedTodo.data);

// Delete todo
await todoRepo.deleteTodo(1);
console.log("Todo deleted");
