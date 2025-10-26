import axios from "axios";
import { TodosApi } from "./examples/api/todos";

const instance = axios.create({
	baseURL: "https://jsonplaceholder.typicode.com",
	headers: {
		"Content-Type": "application/json",
	},
});

const productApi = new TodosApi(instance);

// Get all products
productApi.getAll();

// Get product by id
productApi.getById("123");
