# Restify

A TypeScript library for HTTP requests with decorators, inspired by Retrofit.

## Features

- ✅ **Full type safety** - no `any` types
- 🎨 **Decorators** - clean and readable API
- 🔧 **Decomposed architecture** - each decorator in a separate file
- 📦 **Powered by axios** - reliable HTTP client with great features
- 🚀 **Easy to use** - like Retrofit for Android
- 🛠️ **CLI tool** - scaffold API clients with `restify-gen` command
- 🔄 **Response transformations** - transform response data automatically
- 📝 **Form data support** - `@FormUrlEncoded` and `@Field` decorators
- 🔒 **Credentials control** - `@WithCredentials` decorator
- 🪵 **Built-in logging** - `@Logger` decorator for debugging
- ⚠️ **Error handling** - `@OnError` decorator for custom error handling
- 🏷️ **Deprecation warnings** - `@Deprecated` decorator for API versioning
- 🔀 **Request/Response interceptors** - `@BeforeRequest` and `@AfterResponse` decorators
- 🔁 **Automatic retries** - `@Retry` decorator with exponential backoff
- 📊 **Progress tracking** - `@OnUploadProgress` and `@OnDownloadProgress` for file operations
- 🧪 **Mock support** - `@Mock` decorator for development and testing
- ❌ **Request cancellation** - `@Cancelable` decorator for automatic request cancellation

## Installation

```bash
npm install ts-restify

yarn add ts-restify

bun add ts-restify

pnpm add ts-restify
```

### Peer Dependencies

This library requires the following peer dependencies:

- `axios` ^1.0.0 - HTTP client
- `reflect-metadata` ^0.2.0 - Metadata reflection API

Make sure to install them in your project.

## CLI Tool

Restify includes a powerful CLI tool (`restify-gen`) to help you quickly scaffold and generate API client files.

### Installation

The CLI is included with the package and available as `restify-gen` command.

### Quick Start

1. **Initialize configuration**:

```bash
npx restify-gen init
```

This creates a `restify.config.json` file in your project root:

```json path=null start=null
{
  "$schema": "./node_modules/ts-restify/restify.config.schema.json",
  "rootFolder": "src/api",
  "outputFile": "src/apiRoutes.gen.ts",
  "makeCrud": true
}
```

2. **Create a new API file**:

```bash
npx restify-gen create users
```

This generates `src/api/users.ts` with CRUD template:

```typescript path=null start=null
import { Restify, Collection, GET, POST, PUT, DELETE, Path, Body } from "ts-restify";

interface User {
  id: number;
  // Add your fields here
}

@Collection("/users")
export class UsersAPI extends Restify {
  @GET("")
  getAll(): Promise<User[]> {
    return {} as Promise<User[]>;
  }

  @GET("/:id")
  getById(@Path("id") id: number): Promise<User> {
    return {} as Promise<User>;
  }

  @POST("")
  create(@Body() data: Partial<User>): Promise<User> {
    return {} as Promise<User>;
  }

  @PUT("/:id")
  update(@Path("id") id: number, @Body() data: Partial<User>): Promise<User> {
    return {} as Promise<User>;
  }

  @DELETE("/:id")
  delete(@Path("id") id: number): Promise<void> {
    return {} as Promise<void>;
  }
}
```

3. **Generate routes file**:

```bash
npx restify-gen
```

This scans your API folder and generates `src/apiRoutes.gen.ts` with all available routes.

### CLI Commands

#### `init` - Initialize configuration

```bash
npx restify-gen init
```

Creates `restify.config.json` with default settings.

#### `create` - Create new API file

```bash
npx restify-gen create <path>
```

**Examples:**

```bash
# Create users API
npx restify-gen create users

# Create nested path
npx restify-gen create users/posts
```

**Options:**
- With `makeCrud: true` (default): Generates full CRUD template
- With `makeCrud: false`: Generates empty class

#### Generate routes

```bash
npx restify-gen
```

Scans API folder and generates routes file.

**Options:**
- `-w, --watch` - Watch mode (regenerate on file changes)
- `-d, --dir <path>` - Override root folder
- `-o, --output <path>` - Override output file

**Examples:**

```bash
# Generate once
npx restify-gen

# Watch mode
npx restify-gen --watch

# Custom paths
npx restify-gen -d src/routes -o src/generated.ts
```

### Configuration File

`restify.config.json` schema:

```typescript path=null start=null
{
  // Path to root folder with API files
  rootFolder: string;        // default: "src/api"

  // Output file for generated routes
  outputFile: string;        // default: "src/apiRoutes.gen.ts"

  // Generate CRUD template for new files
  makeCrud: boolean;         // default: true
}
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

// Usage - pass axios instance
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    "Content-Type": "application/json",
  },
});

const todoRepo = new TodoRepository(axiosInstance);

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
- `@OnUploadProgress()` - Upload progress callback (0-100%)
- `@OnDownloadProgress()` - Download progress callback (0-100%)

### Class Decorators
- `@Collection(basePath)` - Base path for all class methods
- `@BaseUrl(url)` - Override base URL for specific repository

### Method Decorators
- `@Transform(fn)` - Transform response data
- `@TransformRequest(fn)` - Transform request body before sending
- `@ResponseType(type)` - Set response type (`json`, `text`, `blob`, `arraybuffer`)
- `@FormUrlEncoded()` - Set content-type to `application/x-www-form-urlencoded`
- `@WithCredentials()` - Include credentials in cross-origin requests
- `@Logger()` - Log request and response details
- `@OnError(handler)` - Custom error handler for the method
- `@Deprecated(message?)` - Mark method as deprecated with optional message
- `@BeforeRequest(interceptor)` - Intercept and modify request before sending
- `@AfterResponse(interceptor)` - Intercept and modify response after receiving
- `@Retry(options?)` - Automatically retry failed requests with exponential backoff
- `@Mock(options)` - Mock responses for development and testing
- `@Cancelable(options?)` - Automatically cancel previous requests

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

### Request Transformation

Transform request body before sending to the server:

```typescript
@Collection("/users")
class UserRepository extends Restify {
  @POST("")
  @TransformRequest<CreateUserDto>((user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    createdAt: new Date().toISOString()
  }))
  createUser(@Body() user: CreateUserDto): Promise<RestifyResponse<User>> {
    return {} as Promise<RestifyResponse<User>>;
  }

  @POST("/batch")
  @TransformRequest<Record<string, unknown>>((data) => ({
    ...data,
    timestamp: Date.now(),
    version: "v1"
  }))
  createBatch(@Body() data: Record<string, unknown>): Promise<RestifyResponse<void>> {
    return {} as Promise<RestifyResponse<void>>;
  }

  // Async transformation
  @POST("/secure")
  @TransformRequest<SecureData>(async (data) => ({
    ...data,
    encrypted: await encrypt(JSON.stringify(data))
  }))
  createSecure(@Body() data: SecureData): Promise<RestifyResponse<void>> {
    return {} as Promise<RestifyResponse<void>>;
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

### Request/Response Interceptors

```typescript
@Collection("/api")
class ApiRepository extends Restify {
  // Add custom headers before request
  @GET("/data")
  @BeforeRequest((config) => {
    config.headers = {
      ...config.headers,
      "X-Request-ID": crypto.randomUUID(),
      "X-Timestamp": Date.now().toString(),
    };
    return config;
  })
  getData(): Promise<RestifyResponse<Data>> {
    return {} as Promise<RestifyResponse<Data>>;
  }

  // Transform response after receiving
  @GET("/users")
  @AfterResponse((response) => {
    console.log("Response received:", response.status);
    return response;
  })
  getUsers(): Promise<RestifyResponse<User[]>> {
    return {} as Promise<RestifyResponse<User[]>>;
  }

  // Dynamic authentication token
  @POST("/secure")
  @BeforeRequest(async (config) => {
    const token = await getAuthToken();
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
    return config;
  })
  createSecure(@Body() data: SecureData): Promise<RestifyResponse<Result>> {
    return {} as Promise<RestifyResponse<Result>>;
  }
}
```

### Progress Tracking

Perfect for React applications with file uploads/downloads:

```typescript
import { Restify, POST, Body, OnUploadProgress } from "restify";

class FileAPI extends Restify {
  @POST("/upload")
  async uploadFile(
    @Body() file: FormData,
    @OnUploadProgress() onProgress?: (progress: number) => void
  ) {}

  @GET("/download/:id")
  async downloadFile(
    @Path("id") id: string,
    @OnDownloadProgress() onProgress?: (progress: number) => void
  ) {}
}

// React usage
function FileUploader() {
  const [progress, setProgress] = useState(0);
  const api = new FileAPI(axios.create({ baseURL: 'https://api.example.com' }));

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    await api.uploadFile(formData, (progress) => {
      setProgress(progress); // 0-100
    });
  };

  return <progress value={progress} max="100" />;
}
```

### Automatic Retries

```typescript
@Collection("/api")
class ApiRepository extends Restify {
  // Simple retry with defaults (3 attempts, 1s delay, 2x backoff)
  @GET("/unstable")
  @Retry()
  getUnstableData(): Promise<RestifyResponse<Data>> {
    return {} as Promise<RestifyResponse<Data>>;
  }

  // Custom retry configuration
  @GET("/flaky")
  @Retry({
    attempts: 5,
    delay: 2000,
    backoff: 1.5,
    maxDelay: 10000,
  })
  getFlakyData(): Promise<RestifyResponse<Data>> {
    return {} as Promise<RestifyResponse<Data>>;
  }

  // Custom retry condition (only retry on 503)
  @GET("/service")
  @Retry({
    attempts: 3,
    shouldRetry: (error: any) => {
      return error.response?.status === 503;
    },
  })
  getServiceData(): Promise<RestifyResponse<Data>> {
    return {} as Promise<RestifyResponse<Data>>;
  }

  // Combine with Logger to see retry attempts
  @GET("/external")
  @Logger()
  @Retry({ attempts: 3, delay: 1000 })
  getExternalData(): Promise<RestifyResponse<Data>> {
    return {} as Promise<RestifyResponse<Data>>;
  }
}
```

### Mock Support

Use the `@Mock` decorator to return mock data during development and testing without making real API calls:

```typescript
@Collection("/api")
class ApiRepository extends Restify {
  // Simple mock with static data
  @GET("/users")
  @Mock({
    data: [{ id: 1, name: "John" }, { id: 2, name: "Jane" }]
  })
  getUsers(): Promise<RestifyResponse<User[]>> {
    return {} as Promise<RestifyResponse<User[]>>;
  }

  // Mock with dynamic data
  @GET("/user/:id")
  @Mock({
    data: () => ({ id: 1, name: "John", email: "john@example.com" }),
    delay: 500 // Simulate network delay
  })
  getUser(@Path("id") id: string): Promise<RestifyResponse<User>> {
    return {} as Promise<RestifyResponse<User>>;
  }

  // Mock only in development (default behavior)
  @POST("/login")
  @Mock({
    data: { token: "mock-token-123", userId: 1 },
    status: 200,
    enabled: process.env.NODE_ENV !== "production" // Explicit control
  })
  login(@Body() credentials: Credentials): Promise<RestifyResponse<AuthResponse>> {
    return {} as Promise<RestifyResponse<AuthResponse>>;
  }

  // Mock with real request for Network tab visibility
  @GET("/products")
  @Mock({
    data: [{ id: 1, name: "Product 1" }],
    useRealRequest: true // Makes actual request but returns mock data
  })
  getProducts(): Promise<RestifyResponse<Product[]>> {
    return {} as Promise<RestifyResponse<Product[]>>;
  }
}
```

### Request Cancellation

Automatically cancel previous requests when a new one is made:

```typescript
@Collection("/api")
class SearchAPI extends Restify {
  // Cancel previous request when new search is triggered
  @GET("/search")
  @Cancelable() // Uses "latest" strategy by default
  search(@Query("q") query: string): Promise<RestifyResponse<SearchResult[]>> {
    return {} as Promise<RestifyResponse<SearchResult[]>>;
  }

  // Custom cancellation strategy
  @GET("/autocomplete")
  @Cancelable({ strategy: "latest" })
  autocomplete(@Query("q") query: string): Promise<RestifyResponse<string[]>> {
    return {} as Promise<RestifyResponse<string[]>>;
  }
}

// React usage example
function SearchComponent() {
  const [results, setResults] = useState([]);
  const api = new SearchAPI(axios.create({ baseURL: 'https://api.example.com' }));

  const handleSearch = async (query: string) => {
    // Previous search request will be automatically cancelled
    const response = await api.search(query);
    setResults(response.data);
  };

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

## Configuration

The library uses axios as its HTTP client. You must pass an axios instance to the constructor:

```typescript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token"
  },
});

const repo = new TodoRepository(axiosInstance);
```

**Axios Features:**
- Automatic JSON transformation
- Request/response interceptors
- Full axios configuration support

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
