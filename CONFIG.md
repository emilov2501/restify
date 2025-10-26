# Configuration Guide

## restify.config.json

The Restify Route Generator can be configured using a `restify.config.json` file in your project root.

## Quick Start

Create a config file:

```bash
npm run gen:init
```

Or manually create `restify.config.json`:

```json
{
  "rootFolder": "src/api",
  "outputFile": "api-routes.gen.ts"
}
```

## Configuration Options

### `rootFolder` (required)

**Type:** `string`  
**Default:** `"src/api"`

The directory to scan for API route files.

```json
{
  "rootFolder": "api"
}
```

**Examples:**
- `"src/api"` - Standard location
- `"api"` - Root level
- `"src/routes"` - Custom folder
- `"backend/api"` - Nested structure

### `outputFile` (required)

**Type:** `string`  
**Default:** `"api-routes.gen.ts"`

The output file path for generated routes (relative to project root).

```json
{
  "outputFile": "src/generated/routes.gen.ts"
}
```

**Examples:**
- `"api-routes.gen.ts"` - Root level
- `"src/api-routes.gen.ts"` - In src folder
- `"generated/routes.ts"` - Custom location

### `watch` (optional)

**Type:** `boolean`  
**Default:** `false`

Enable watch mode by default.

```json
{
  "rootFolder": "src/api",
  "outputFile": "api-routes.gen.ts",
  "watch": true
}
```

## CLI Overrides

CLI arguments override config file values:

```bash
# Override rootFolder
npm run gen -- --dir custom/api

# Override outputFile
npm run gen -- --output custom-routes.gen.ts

# Override watch mode
npm run gen -- --watch

# Override multiple
npm run gen -- --dir api --output routes.ts --watch
```

## Examples

### Basic Setup

```json
{
  "rootFolder": "src/api",
  "outputFile": "api-routes.gen.ts"
}
```

```
project/
├── src/
│   └── api/
│       ├── users.ts
│       └── posts.ts
└── api-routes.gen.ts  ← Generated here
```

### Monorepo Setup

```json
{
  "rootFolder": "packages/backend/api",
  "outputFile": "packages/backend/api-routes.gen.ts"
}
```

```
monorepo/
├── packages/
│   ├── backend/
│   │   ├── api/
│   │   │   ├── users.ts
│   │   │   └── posts.ts
│   │   └── api-routes.gen.ts  ← Generated here
│   └── frontend/
└── restify.config.json
```

### Development Setup

```json
{
  "rootFolder": "src/api",
  "outputFile": "src/generated/api-routes.gen.ts",
  "watch": true
}
```

Run once:
```bash
npm run gen
```

The generator automatically watches for changes.

## Multiple Configurations

For multiple API sets, use different config files:

**restify.config.json** (default)
```json
{
  "rootFolder": "src/api/public",
  "outputFile": "public-routes.gen.ts"
}
```

**restify.admin.config.json**
```json
{
  "rootFolder": "src/api/admin",
  "outputFile": "admin-routes.gen.ts"
}
```

Then use with different scripts:

```json
{
  "scripts": {
    "gen:public": "tsx src/cli/index.ts",
    "gen:admin": "tsx src/cli/index.ts --dir src/api/admin --output admin-routes.gen.ts"
  }
}
```

## Best Practices

### 1. **Keep Config in Version Control**

```gitignore
# Don't ignore config file
# restify.config.json ❌
```

### 2. **Output File Location**

Place generated files in your source directory for TypeScript imports:

```json
{
  "outputFile": "src/api-routes.gen.ts"
}
```

### 3. **Consistent Naming**

Use clear names for API folders:

```
✅ Good:
src/api/
src/routes/
backend/api/

❌ Avoid:
src/stuff/
src/handlers/
src/endpoints/
```

### 4. **Monorepo Structure**

```json
{
  "rootFolder": "packages/api/src",
  "outputFile": "packages/api/routes.gen.ts"
}
```

### 5. **Watch Mode in Development**

Add to package.json:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run gen:watch\" \"vite\"",
    "build": "npm run gen && tsc && vite build"
  }
}
```

## Validation

The config file is validated on load. Invalid configurations will show helpful error messages:

```bash
✖ Failed to load config: rootFolder is required
```

## No Config File

If no config file exists, defaults are used:

```bash
ℹ 📄 No config file found, using defaults
ℹ    Root folder: src/api
ℹ    Output file: api-routes.gen.ts
```

## Troubleshooting

### Config not loading?

1. Check file location: `restify.config.json` must be in project root
2. Validate JSON syntax
3. Check file permissions

### Routes not generating?

1. Verify `rootFolder` path exists
2. Check that folder contains `.ts` files
3. Ensure files don't have syntax errors

### Output file not created?

1. Check write permissions
2. Verify output directory exists
3. Check for path typos

## Migration

### From CLI-only to Config

Before:
```bash
npm run gen -- --dir src/api --output routes.gen.ts
```

After:
```json
{
  "rootFolder": "src/api",
  "outputFile": "routes.gen.ts"
}
```

```bash
npm run gen
```

### From Old Scripts

Before `package.json`:
```json
{
  "scripts": {
    "gen": "restify-gen --dir src/api --output routes.gen.ts"
  }
}
```

After:
```json
{
  "scripts": {
    "gen": "restify-gen"
  }
}
```

Create `restify.config.json`:
```json
{
  "rootFolder": "src/api",
  "outputFile": "routes.gen.ts"
}
```

---

📚 [Main Documentation](./ROUTE_GENERATOR.md) | 🚀 [Quick Start](./QUICK_START.md)
