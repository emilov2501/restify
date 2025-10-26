# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.6](https://github.com/emilov2501/restify/compare/v1.0.5...v1.0.6) (2025-10-26)

### [1.0.5](https://github.com/emilov2501/restify/compare/v1.0.4...v1.0.5) (2025-10-26)


### Bug Fixes

* correct todo endpoint example ([2ec2d41](https://github.com/emilov2501/restify/commit/2ec2d41182b5a358b54b5ddc54f375a3cb176f83))

### [1.0.4](https://github.com/emilov2501/restify/compare/v1.0.0...v1.0.4) (2025-10-26)

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
