import { describe, expect, it } from "vitest";
import "reflect-metadata";
import { METADATA_KEYS } from "../../constants.ts";
import { DELETE } from "../DELETE.ts";
import { GET } from "../GET.ts";
import { PATCH } from "../PATCH.ts";
import { POST } from "../POST.ts";
import { PUT } from "../PUT.ts";

describe("HTTP Method Decorators", () => {
	describe("@GET", () => {
		it("should set GET method metadata", () => {
			class TestClass {
				@GET("/users")
				getUsers() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"getUsers",
			);

			expect(metadata).toEqual({
				method: "GET",
				path: "/users",
				propertyKey: "getUsers",
			});
		});

		it("should work with empty path", () => {
			class TestClass {
				@GET("")
				getRoot() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"getRoot",
			);

			expect(metadata).toEqual({
				method: "GET",
				path: "",
				propertyKey: "getRoot",
			});
		});

		it("should work with path parameters", () => {
			class TestClass {
				@GET("/users/:id")
				getUser() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"getUser",
			);

			expect(metadata).toEqual({
				method: "GET",
				path: "/users/:id",
				propertyKey: "getUser",
			});
		});
	});

	describe("@POST", () => {
		it("should set POST method metadata", () => {
			class TestClass {
				@POST("/users")
				createUser() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"createUser",
			);

			expect(metadata).toEqual({
				method: "POST",
				path: "/users",
				propertyKey: "createUser",
			});
		});
	});

	describe("@PUT", () => {
		it("should set PUT method metadata", () => {
			class TestClass {
				@PUT("/users/:id")
				updateUser() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"updateUser",
			);

			expect(metadata).toEqual({
				method: "PUT",
				path: "/users/:id",
				propertyKey: "updateUser",
			});
		});
	});

	describe("@DELETE", () => {
		it("should set DELETE method metadata", () => {
			class TestClass {
				@DELETE("/users/:id")
				deleteUser() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"deleteUser",
			);

			expect(metadata).toEqual({
				method: "DELETE",
				path: "/users/:id",
				propertyKey: "deleteUser",
			});
		});
	});

	describe("@PATCH", () => {
		it("should set PATCH method metadata", () => {
			class TestClass {
				@PATCH("/users/:id")
				patchUser() {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				TestClass.prototype,
				"patchUser",
			);

			expect(metadata).toEqual({
				method: "PATCH",
				path: "/users/:id",
				propertyKey: "patchUser",
			});
		});
	});
});
