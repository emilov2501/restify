# 🚀 Quick Start - Restify Route Generator

## Installation

```bash
npm install ts-restify
npm install -D tsx
```

## Configuration

Create `restify.config.json` in your project root:

```bash
npm run gen:init
```

Or manually:

```json
{
  "rootFolder": "src/api",
  "outputFile": "api-routes.gen.ts"
}
```

📖 [Full Configuration Guide](./CONFIG.md)

## Commands

### Create new API endpoint
```bash
# Simple endpoint
npm run gen:create -- users

# With path parameter
npm run gen:create -- users/\$id

# Nested resource
npm run gen:create -- posts/\$postId/comments
```

### Generate routes
```bash
# One-time generation
npm run gen

# Watch mode (recommended for development)
npm run gen:watch
```

## File Structure

```
api/
  users.ts              → GET/POST /users
  users/$id.ts          → GET/DELETE /users/:id
  posts/
    $postId/
      comments.ts       → GET/POST /posts/:postId/comments
```

## Generated Code Example

When you run:
```bash
npm run gen:create -- products
```

You get:
```typescript
import { GET, POST, Body, Logger } from '../lib/index.ts';
import { Restify } from '../lib/Restify.ts';

export class ProductsApi extends Restify {
  @GET("")
  @Logger()
  async get() {
    // GET /products
    return { data: { message: "Hello from /products" } };
  }

  @POST("")
  @Logger()
  async create(@Body() body: unknown) {
    // POST /products
    return { data: { message: "Created", body } };
  }
}
```

## Generated Types

After running `npm run gen`, you get:

**api-routes.gen.ts**
```typescript
export type RoutePath = 
  | '/products'
  | '/products/:id'
  | '/users'
  | '/users/:id';

export type RouteParams = {
  '/products/:id': { id: string };
  '/users/:id': { id: string };
};
```

## Workflow

### Option 1: CLI Command
```bash
# Create file
npm run gen:create -- orders

# Edit generated file
vim api/orders.ts

# Generate routes
npm run gen
```

### Option 2: Watch Mode (Recommended)
```bash
# Start watcher
npm run gen:watch

# In another terminal, create new file
touch api/orders.ts

# Template is auto-generated! ✨
# Edit the file, routes auto-update! 🔄
```

## Integration with Dev Workflow

**package.json**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run gen:watch\" \"vite\"",
    "build": "npm run gen && tsc && vite build"
  }
}
```

## Tips

1. **Use $ for parameters**: `$id`, `$userId`, `$postId`
2. **Watch mode**: Best for active development
3. **PascalCase**: File names convert to class names (users → UsersApi)
4. **Auto-import**: Templates include correct import paths

## Examples

### REST CRUD
```bash
npm run gen:create -- products          # List/Create
npm run gen:create -- products/\$id     # Get/Update/Delete
```

### Nested Resources
```bash
npm run gen:create -- users/\$userId/posts
npm run gen:create -- users/\$userId/posts/\$postId
```

### Multiple Words
```bash
npm run gen:create -- user-profiles      # → UserProfilesApi
npm run gen:create -- order-items        # → OrderItemsApi
```

---

📚 [Full Documentation](./ROUTE_GENERATOR.md) | 🐛 [Report Issue](https://github.com/emilov2501/restify/issues)
