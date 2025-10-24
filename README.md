# Restify

A TypeScript library for HTTP requests with decorators, inspired by Retrofit.

## Features

- ✅ **Full type safety** - no `any` types
- 🎨 **Decorators** - clean and readable API
- 🔧 **Decomposed architecture** - each decorator in a separate file
- 📦 **Powered by axios** - reliable HTTP client with great features
- 🚀 **Easy to use** - like Retrofit for Android
- 🔄 **Response transformations** - transform response data automatically
- 🔌 **Flexible HTTP clients** - supports both fetch and axios
- 📝 **Form data support** - `@FormUrlEncoded` and `@Field` decorators
- 🔒 **Credentials control** - `@WithCredentials` decorator
- 🪵 **Built-in logging** - `@Logger` decorator for debugging
- ⚠️ **Error handling** - `@OnError` decorator for custom error handling
- 🏷️ **Deprecation warnings** - `@Deprecated` decorator for API versioning

## Installation

```bash
npm install axios reflect-metadata
```

## Usage

### Basic Example

```typescript
import { Restify, Collection, GET, POST, Query, Path, Body } from "./lib/index.ts";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Collection("/todos")
class TodoRepository extends Restify {
  @GET("")
  getTodos(): Promise<{ data: Todo[] }> {
    return {} as Promise<{ data: Todo[] }>;
  }

  @GET("/:id")
  getTodoById(@Path("id") id: number): Promise<{ data: Todo }> {
    return {} as Promise<{ data: Todo }>;
  }

  @GET("")
  getList(
    @Query("page") page: number,
    @Query("limit") limit: number
  ): Promise<{ data: Todo[] }> {
    return {} as Promise<{ data: Todo[] }>;
  }

  @POST("")
  createTodo(@Body() todo: CreateTodoDto): Promise<{ data: Todo }> {
    return {} as Promise<{ data: Todo }>;
  }

  @GET("")
  getFilteredTodos(
    @QueryMap() filters: {
      completed?: boolean;
      priority?: "low" | "medium" | "high";
    }
  ): Promise<{ data: Todo[] }> {
    return {} as Promise<{ data: Todo[] }>;
  }
}

// Usage
const todoRepo = new TodoRepository({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    "Content-Type": "application/json",
  },
});

const todos = await todoRepo.getTodos();
const todo = await todoRepo.getTodoById(1);
const paginated = await todoRepo.getList(1, 10);
```

## Decorators

### HTTP Methods
- `@GET(path)` - GET request
- `@POST(path)` - POST request
- `@PUT(path)` - PUT request
- `@DELETE(path)` - DELETE request
- `@PATCH(path)` - PATCH request

### Parameters
- `@Query(key)` - Query parameter
- `@QueryMap()` - Dynamic query parameters from object (for filters)
- `@Path(key)` - Path parameter (in URL)
- `@Body()` - Request body
- `@Header(key)` - HTTP header
- `@Field(key)` - Form field (use with `@FormUrlEncoded`)

### Class Decorators
- `@Collection(basePath)` - Base path for all class methods
- `@BaseUrl(url)` - Override base URL for specific repository

### Method Decorators
- `@Transform(fn)` - Transform response data
- `@ResponseType(type)` - Set response type (`json`, `text`, `blob`, `arraybuffer`)
- `@FormUrlEncoded()` - Set content-type to `application/x-www-form-urlencoded`
- `@WithCredentials()` - Include credentials in cross-origin requests
- `@Logger()` - Log request and response details
- `@OnError(handler)` - Custom error handler for the method
- `@Deprecated(message?)` - Mark method as deprecated with optional message

## Advanced Features

### Response Transformation

```typescript
@Collection("/users")
class UserRepository extends Restify {
  @GET("/:id")
  @Transform((data: any) => ({
    id: data.id,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email.toLowerCase()
  }))
  getUser(@Path("id") id: number): Promise<User> {
    return {} as Promise<User>;
  }
}
```

### Form URL Encoded

```typescript
@Collection("/auth")
class AuthRepository extends Restify {
  @POST("/login")
  @FormUrlEncoded()
  login(
    @Field("username") username: string,
    @Field("password") password: string
  ): Promise<AuthResponse> {
    return {} as Promise<AuthResponse>;
  }
}
```

### Error Handling

```typescript
@Collection("/api")
class ApiRepository extends Restify {
  @GET("/data")
  @OnError((error) => {
    console.error("Custom error handling:", error);
    throw new CustomError(error.message);
  })
  getData(): Promise<Data> {
    return {} as Promise<Data>;
  }
}
```

### Deprecation Warning

```typescript
@Collection("/api/v1")
class LegacyApiRepository extends Restify {
  @GET("/old-endpoint")
  @Deprecated("Use ApiV2Repository.newEndpoint() instead")
  oldMethod(): Promise<Data> {
    return {} as Promise<Data>;
  }
}
```

## Configuration

```typescript
interface RestifyConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}
```

### HTTP Client

The library uses axios as its HTTP client.

**Method 1: Pass axios instance (recommended)**
```typescript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: { Authorization: "Bearer token" },
});

// Just pass the instance
const repo = new TodoRepository(axiosInstance);
```

**Method 2: Use RestifyConfig**
```typescript
const repo = new TodoRepository({
  baseURL: "https://api.example.com",
});
```

**Axios Features:**
- Automatic JSON transformation
- Request cancellation
- Upload progress
- Request/response interceptors

## Project Structure

```
src/
├── lib/
│   ├── Restify.ts              # Base class
│   ├── types.ts                # TypeScript interfaces
│   ├── constants.ts            # Metadata constants
│   ├── decorators/
│   │   ├── Collection.ts       # @Collection
│   │   ├── BaseUrl.ts          # @BaseUrl
│   │   ├── GET.ts              # @GET
│   │   ├── POST.ts             # @POST
│   │   ├── PUT.ts              # @PUT
│   │   ├── DELETE.ts           # @DELETE
│   │   ├── PATCH.ts            # @PATCH
│   │   ├── Query.ts            # @Query
│   │   ├── QueryMap.ts         # @QueryMap
│   │   ├── Path.ts             # @Path
│   │   ├── Body.ts             # @Body
│   │   ├── Header.ts           # @Header
│   │   ├── Field.ts            # @Field
│   │   ├── Transform.ts        # @Transform
│   │   ├── ResponseType.ts     # @ResponseType
│   │   ├── FormUrlEncoded.ts   # @FormUrlEncoded
│   │   ├── WithCredentials.ts  # @WithCredentials
│   │   ├── Logger.ts           # @Logger
│   │   ├── OnError.ts          # @OnError
│   │   ├── Deprecated.ts       # @Deprecated
│   │   ├── __tests__/          # Decorator tests
│   │   └── index.ts            # Export all decorators
│   ├── __tests__/
│   │   └── Restify.test.ts     # Core tests
│   └── index.ts                # Main export
├── examples/
│   ├── TodoRepository.ts       # Repository example
│   ├── TransformExample.ts     # Transform decorator example
│   └── usage.ts                # Usage examples
└── main.ts                     # Entry point
```

## TypeScript Configuration

Make sure decorators are enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## License

MIT
