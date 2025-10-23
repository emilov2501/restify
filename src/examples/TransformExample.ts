import axios from "axios";
import { Restify } from "../lib/Restify.ts";
import { Collection } from "../lib/decorators/Collection.ts";
import { GET } from "../lib/decorators/GET.ts";
import { Transform } from "../lib/decorators/Transform.ts";
import type { RestifyResponse } from "../lib/types.ts";

interface Todo {
	id: number;
	title: string;
	completed: boolean;
}

interface User {
	id: number;
	firstName: string;
	lastName: string;
	age: number;
}

@Collection("/api")
class ExampleRepository extends Restify {
	// Transform знает что data это Todo[] благодаря дженерику
	@GET("/todos")
	@Transform<Todo[]>((data) => data.map((todo) => todo.title))
	getTodoTitles(): Promise<RestifyResponse<Todo[]>> {
		return {} as Promise<RestifyResponse<Todo[]>>;
	}

	// Transform знает что data это Todo[] благодаря дженерику
	@GET("/todos/active")
	@Transform<Todo[]>((data) => data.filter((todo) => !todo.completed))
	getActiveTodos(): Promise<RestifyResponse<Todo[]>> {
		return {} as Promise<RestifyResponse<Todo[]>>;
	}

	// Transform знает что data это User благодаря дженерику
	@GET("/user/:id")
	@Transform<User>((user) => ({
		...user,
		fullName: `${user.firstName} ${user.lastName}`,
		isAdult: user.age >= 18,
	}))
	getUserWithComputed(): Promise<RestifyResponse<User>> {
		return {} as Promise<RestifyResponse<User>>;
	}

	// Без Transform - возвращает как есть
	@GET("/todos")
	getTodos(): Promise<RestifyResponse<Todo[]>> {
		return {} as Promise<RestifyResponse<Todo[]>>;
	}
}

// Usage
const client = axios.create({
	baseURL: "https://jsonplaceholder.typicode.com",
});

const repo = new ExampleRepository(client);

// Типы работают правильно
console.log(await repo.getTodoTitles()); // string[]
console.log(await repo.getActiveTodos()); // Todo[]
console.log(await repo.getUserWithComputed()); // User & { fullName: string, isAdult: boolean }
console.log(await repo.getTodos()); // Todo[]
