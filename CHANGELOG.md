# Changelog

## [1.0.0](https://github.com/emilov2501/restify/releases/tag/v1.0.0) (2025-10-24)

**Initial release with full feature set:**

### Core Features
- HTTP method decorators: `@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`
- Parameter decorators: `@Query`, `@Path`, `@Body`, `@Header`, `@QueryMap`
- `@Collection` decorator for base path configuration
- `@BaseUrl` class decorator for declarative base URL setup
- Axios as the underlying HTTP client

### Advanced Features
- `@BeforeRequest` and `@AfterResponse` interceptor decorators
- `@OnError` decorator for error handling
- `@Retry` decorator with exponential backoff
- `@Transform` decorator with full type inference
- `@Logger` decorator with beautiful console logging (using consola)
- `@Deprecated` decorator with warning and strict mode
- `@ResponseType` decorator for blob, arraybuffer, and other response types
- `@WithCredentials` decorator for cookie support
- `@FormUrlEncoded` and `@Field` decorators for form data submission
- FormData support for file uploads

### Documentation & Tooling
- Comprehensive README with usage examples
- TypeScript type declarations
- Biome for linting and formatting
- Commitlint with Husky hooks
- Vitest for testing
- Full test coverage with axios
