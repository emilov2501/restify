import {
	Body,
	Collection,
	DELETE,
	GET,
	Logger,
	Path,
	POST,
	PUT,
	Query,
	QueryMap,
	Restify,
} from "../lib/index.ts";

interface Todo {
	id: number;
	title: string;
	completed: boolean;
}

interface CreateTodoDto {
	title: string;
	completed?: boolean;
}

interface UpdateTodoDto {
	title?: string;
	completed?: boolean;
}

@Collection("/todos")
export class TodoRepository extends Restify {
	@GET("")
	@Logger()
	getTodos(): Promise<{ data: Todo[] }> {
		return {} as Promise<{ data: Todo[] }>;
	}

	@GET("/:id")
	@Logger()
	getTodoById(@Path("id") _id: number): Promise<{ data: Todo }> {
		return {} as Promise<{ data: Todo }>;
	}

	@GET("")
	@Logger()
	getList(
		@Query("page") _page: number,
		@Query("limit") _limit: number,
	): Promise<{ data: Todo[] }> {
		return {} as Promise<{ data: Todo[] }>;
	}

	@GET("")
	@Logger()
	getFilteredTodos(
		@QueryMap() _filters: {
			completed?: boolean;
			title?: string;
			priority?: "low" | "medium" | "high";
		},
	): Promise<{ data: Todo[] }> {
		return {} as Promise<{ data: Todo[] }>;
	}

	@POST("")
	@Logger()
	createTodo(@Body() _todo: CreateTodoDto): Promise<{ data: Todo }> {
		return {} as Promise<{ data: Todo }>;
	}

	@PUT("/:id")
	@Logger()
	updateTodo(
		@Path("id") _id: number,
		@Body() _todo: UpdateTodoDto,
	): Promise<{ data: Todo }> {
		return {} as Promise<{ data: Todo }>;
	}

	@DELETE("/:id")
	@Logger()
	deleteTodo(@Path("id") _id: number): Promise<{ data: void }> {
		return {} as Promise<{ data: void }>;
	}
}
