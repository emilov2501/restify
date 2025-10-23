import axios from "axios";
import { TodoRepository } from "./TodoRepository.ts";

const client = axios.create({
	baseURL: "https://jsonplaceholder.typicode.com",
	headers: {
		"Content-Type": "application/json",
	},
});

// Example usage
async function main() {
	const todoRepo = new TodoRepository(client);

	// Get all todos
	try {
		await todoRepo.getTodos();
	} catch (e) {
		console.log("hlelo");
		console.log(e);
	}

	// // Get todo by id
	// await todoRepo.getTodoById(1);

	// // Get paginated list
	// await todoRepo.getList(1, 10);

	// // Create new todo
	// todoRepo.createTodo({
	// 	title: "New Todo",
	// 	completed: false,
	// });

	// // Update todo
	// await todoRepo.updateTodo(1, {
	// 	completed: true,
	// });

	// // Delete todo
	// await todoRepo.deleteTodo(1);
}

main();
