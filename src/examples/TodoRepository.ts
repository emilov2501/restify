import { Restify, Collection, GET, POST, PUT, DELETE, Query, Path, Body } from "../lib/index.ts";

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
  getTodos(): Promise<{ data: Todo[] }> {
    return {} as Promise<{ data: Todo[] }>;
  }

  @GET("/:id")
  getTodoById(@Path("id") _id: number): Promise<{ data: Todo }> {
    return {} as Promise<{ data: Todo }>;
  }

  @GET("")
  getList(
    @Query("page") _page: number,
    @Query("limit") _limit: number
  ): Promise<{ data: Todo[] }> {
    return {} as Promise<{ data: Todo[] }>;
  }

  @POST("")
  createTodo(@Body() _todo: CreateTodoDto): Promise<{ data: Todo }> {
    return {} as Promise<{ data: Todo }>;
  }

  @PUT("/:id")
  updateTodo(
    @Path("id") _id: number,
    @Body() _todo: UpdateTodoDto
  ): Promise<{ data: Todo }> {
    return {} as Promise<{ data: Todo }>;
  }

  @DELETE("/:id")
  deleteTodo(@Path("id") _id: number): Promise<{ data: void }> {
    return {} as Promise<{ data: void }>;
  }
}
