# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.5.4](https://github.com/emilov2501/restify/compare/v1.5.3...v1.5.4) (2025-12-03)


### Bug Fixes

* add full URL to error logging when logger is enabled ([c1d805d](https://github.com/emilov2501/restify/commit/c1d805d07845ca9dd22f4ae6d5173c3d4701f5a7))

### [1.5.3](https://github.com/emilov2501/restify/compare/v1.5.2...v1.5.3) (2025-12-02)


### Bug Fixes

* improve logger to show full URL with protocol and domain ([86105ba](https://github.com/emilov2501/restify/commit/86105bae775a811fb1e705be938fbe5017c73286))

### [1.5.2](https://github.com/emilov2501/restify/compare/v1.5.1...v1.5.2) (2025-12-02)


### Features

* improve logger HTTP Request ([2f8fc0a](https://github.com/emilov2501/restify/commit/2f8fc0a727021746298b90fdcf546a70b0822e72))
* improve logger to show full URL with HTTP method ([cb14035](https://github.com/emilov2501/restify/commit/cb140357d79ed4fdee0e186510cafb5543c5398b))

### [1.5.1](https://github.com/emilov2501/restify/compare/v1.5.0...v1.5.1) (2025-11-04)


### Documentation

* add @TransformRequest decorator documentation with examples ([bc424e7](https://github.com/emilov2501/restify/commit/bc424e778c131b9192fd63b16db773398df24dfb))

## [1.5.0](https://github.com/emilov2501/restify/compare/v1.4.3...v1.5.0) (2025-11-04)


### Features

* add TransformRequest decorator for request data transformation ([d8c6471](https://github.com/emilov2501/restify/commit/d8c6471d60962980d3f4c97efdb2c054f6d6d681))

### [1.4.3](https://github.com/emilov2501/restify/compare/v1.4.2...v1.4.3) (2025-10-29)


### Documentation

* remove project structure section from README ([82e7383](https://github.com/emilov2501/restify/commit/82e7383fb8d78e67e14e818833e6a6a1a8fb20c6))

### [1.4.2](https://github.com/emilov2501/restify/compare/v1.4.1...v1.4.2) (2025-10-29)


### Code Refactoring

* use axios transformResponse option for response transformation ([ab4dacb](https://github.com/emilov2501/restify/commit/ab4dacbde21237d262c68beba5a6fdc0480368a6))

### [1.4.1](https://github.com/emilov2501/restify/compare/v1.4.0...v1.4.1) (2025-10-27)


### Documentation

* add Mock and Cancelable decorators documentation to README ([8e848db](https://github.com/emilov2501/restify/commit/8e848db6ca592ce33bc63bce8d51d50b19544812))

## [1.4.0](https://github.com/emilov2501/restify/compare/v1.3.2...v1.4.0) (2025-10-27)


### Features

* add Cancelable decorator for automatic request cancellation ([ce2ede6](https://github.com/emilov2501/restify/commit/ce2ede63b500343708285a838a4134fbe1ea5511))
* add Mock decorator with tests ([b1d9d2b](https://github.com/emilov2501/restify/commit/b1d9d2bc9485b928dd436606268853479d10ef48))
* add useRealRequest option to Mock decorator for Network tab visibility ([ebba947](https://github.com/emilov2501/restify/commit/ebba947e7fcb069698bee8f9ecb7788409b361b3))


### Bug Fixes

* resolve TypeScript error in Mock decorator data type assertion ([04383eb](https://github.com/emilov2501/restify/commit/04383eb07e3960222dcedb3f37511b8a86a8210d))

### [1.3.2](https://github.com/emilov2501/restify/compare/v1.3.1...v1.3.2) (2025-10-27)


### Documentation

* add installation commands for yarn, bun, pnpm ([3ffa027](https://github.com/emilov2501/restify/commit/3ffa027ef46052408304afd117193ee4c7346b12))

### [1.3.1](https://github.com/emilov2501/restify/compare/v1.3.0...v1.3.1) (2025-10-27)


### Documentation

* add CLI tool documentation to README ([880632b](https://github.com/emilov2501/restify/commit/880632be059d148889682eac74544d27ba4e5ff4))

## [1.3.0](https://github.com/emilov2501/restify/compare/v1.1.0...v1.3.0) (2025-10-27)


### Features

* add CLI generator for API routes ([566bfe7](https://github.com/emilov2501/restify/commit/566bfe7517ca4ddb5ca56c929c0f61a4df48d79b))
* add flat API structure with resource-specific method names and type-safe initApis generator ([f1f8ab3](https://github.com/emilov2501/restify/commit/f1f8ab394569db9025bc4db1a4afcc3cb80a3911))
* include nested paths in method names generation ([32cf886](https://github.com/emilov2501/restify/commit/32cf88655f3bd8661e08adc8d5e0fcc33b590fae))
* support nested paths and kebab-case in route generation ([307ffbf](https://github.com/emilov2501/restify/commit/307ffbf2c9cd221f8063ebbf0e978f8f29bebe53))
* use unpkg CDN for schema URL in init command ([0521202](https://github.com/emilov2501/restify/commit/0521202c082e327489742ebe4ccb81ae830a977e))


### Bug Fixes

* improve route generator config and empty routes handling ([52fc183](https://github.com/emilov2501/restify/commit/52fc183e27d1095756f70058786feb0cf5d87821))


### Code Refactoring

* remove extra documentation files and update CLI structure ([0a78bf7](https://github.com/emilov2501/restify/commit/0a78bf74880e6fccdcc21b24db027ce918fb242a))

## [1.1.0](https://github.com/emilov2501/restify/compare/v1.0.6...v1.1.0) (2025-10-26)


### Features

* add @OnUploadProgress and @OnDownloadProgress decorators ([a45b2a0](https://github.com/emilov2501/restify/commit/a45b2a09d4aec89ae1e5d610954386eaa62f3485))


### Bug Fixes

* add .npmignore to include dist in published package ([fb3976a](https://github.com/emilov2501/restify/commit/fb3976adf52fef8be6081e251d36e1b40f284129))
* add node types to tsconfig ([b059a5e](https://github.com/emilov2501/restify/commit/b059a5eb7d6f3219af0698436f7a613fffb0d52d))


### Documentation

* add progress tracking examples ([408e25f](https://github.com/emilov2501/restify/commit/408e25f39d85b6f09940b4a9f3f8f0969bb5f298))
* update README with progress tracking decorators ([81bcfce](https://github.com/emilov2501/restify/commit/81bcfce0c01135c09530f2d6e7ad243ffcec7669))

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
