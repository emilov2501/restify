# Restify

TypeScript библиотека для HTTP запросов с декораторами, вдохновлённая Retrofit.

## Особенности

- ✅ **Полная типобезопасность** - без использования `any`
- 🎨 **Декораторы** - чистый и читаемый API
- 🔧 **Декомпозиция** - каждый декоратор в отдельном файле
- 📦 **Минималистичный** - использует нативный `fetch`
- 🚀 **Простота использования** - как Retrofit на Android

## Установка

```bash
npm install reflect-metadata
```

## Использование

### Базовый пример

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

// Использование
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

## Декораторы

### HTTP методы
- `@GET(path)` - GET запрос
- `@POST(path)` - POST запрос
- `@PUT(path)` - PUT запрос
- `@DELETE(path)` - DELETE запрос
- `@PATCH(path)` - PATCH запрос

### Параметры
- `@Query(key)` - Query параметр
- `@QueryMap()` - Динамические query параметры из объекта (для фильтров)
- `@Path(key)` - Path параметр (в URL)
- `@Body()` - Request body
- `@Header(key)` - HTTP заголовок

### Класс
- `@Collection(basePath)` - Базовый путь для всех методов класса

## Конфигурация

```typescript
interface RestifyConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  client?: "fetch" | "axios"; // По умолчанию "fetch"
}
```

### HTTP Клиенты

Библиотека поддерживает два HTTP клиента:

#### Fetch (по умолчанию)
```typescript
const repo = new TodoRepository({
  baseURL: "https://api.example.com",
});
```

#### Axios

**Способ 1: Передать готовый axios instance (рекомендуется)**
```typescript
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: { Authorization: "Bearer token" },
});

// Просто передай instance
const repo = new TodoRepository(axiosInstance);
```

**Способ 2: Использовать RestifyConfig**
```typescript
const repo = new TodoRepository({
  baseURL: "https://api.example.com",
});
```

**Преимущества Axios:**
- Автоматическая трансформация JSON
- Отмена запросов
- Прогресс загрузки
- Interceptors для запросов и ответов

## Структура проекта

```
src/
├── lib/
│   ├── Restify.ts           # Базовый класс
│   ├── types.ts             # TypeScript интерфейсы
│   ├── constants.ts         # Константы для метаданных
│   ├── decorators/
│   │   ├── Collection.ts    # @Collection
│   │   ├── GET.ts           # @GET
│   │   ├── POST.ts          # @POST
│   │   ├── PUT.ts           # @PUT
│   │   ├── DELETE.ts        # @DELETE
│   │   ├── PATCH.ts         # @PATCH
│   │   ├── Query.ts         # @Query
│   │   ├── Path.ts          # @Path
│   │   ├── Body.ts          # @Body
│   │   ├── Header.ts        # @Header
│   │   └── index.ts         # Экспорт всех декораторов
│   └── index.ts             # Главный экспорт
└── examples/
    ├── TodoRepository.ts    # Пример репозитория
    └── usage.ts             # Пример использования
```

## TypeScript конфигурация

Убедитесь, что в `tsconfig.json` включены декораторы:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Лицензия

MIT
