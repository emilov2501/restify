import { describe, expect, it } from "vitest";
import "reflect-metadata";
import { METADATA_KEYS } from "../../constants.ts";
import type { ParameterMetadata } from "../../types.ts";
import { Body } from "../Body.ts";
import { Header } from "../Header.ts";
import { Path } from "../Path.ts";
import { Query } from "../Query.ts";

describe("Parameter Decorators", () => {
	describe("@Query", () => {
		it("should add query parameter metadata", () => {
			class TestClass {
				testMethod(@Query("page") _page: number) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(1);
			expect(metadata[0]).toEqual({
				index: 0,
				type: "query",
				key: "page",
			});
		});

		it("should handle multiple query parameters", () => {
			class TestClass {
				testMethod(
					@Query("page") _page: number,
					@Query("limit") _limit: number,
				) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(2);
			// Decorators are executed in reverse order
			const pageParam = metadata.find((m) => m.key === "page");
			const limitParam = metadata.find((m) => m.key === "limit");
			expect(pageParam).toEqual({
				index: 0,
				type: "query",
				key: "page",
			});
			expect(limitParam).toEqual({
				index: 1,
				type: "query",
				key: "limit",
			});
		});
	});

	describe("@Path", () => {
		it("should add path parameter metadata", () => {
			class TestClass {
				testMethod(@Path("id") _id: number) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(1);
			expect(metadata[0]).toEqual({
				index: 0,
				type: "path",
				key: "id",
			});
		});

		it("should handle multiple path parameters", () => {
			class TestClass {
				testMethod(
					@Path("userId") _userId: number,
					@Path("postId") _postId: number,
				) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(2);
			const userIdParam = metadata.find((m) => m.key === "userId");
			const postIdParam = metadata.find((m) => m.key === "postId");
			expect(userIdParam).toEqual({
				index: 0,
				type: "path",
				key: "userId",
			});
			expect(postIdParam).toEqual({
				index: 1,
				type: "path",
				key: "postId",
			});
		});
	});

	describe("@Body", () => {
		it("should add body parameter metadata", () => {
			class TestClass {
				testMethod(@Body() _data: unknown) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(1);
			expect(metadata[0]).toEqual({
				index: 0,
				type: "body",
			});
		});
	});

	describe("@Header", () => {
		it("should add header parameter metadata", () => {
			class TestClass {
				testMethod(@Header("Authorization") _token: string) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(1);
			expect(metadata[0]).toEqual({
				index: 0,
				type: "header",
				key: "Authorization",
			});
		});

		it("should handle multiple headers", () => {
			class TestClass {
				testMethod(
					@Header("Authorization") _auth: string,
					@Header("Content-Type") _contentType: string,
				) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(2);
			const authParam = metadata.find((m) => m.key === "Authorization");
			const contentTypeParam = metadata.find((m) => m.key === "Content-Type");
			expect(authParam).toEqual({
				index: 0,
				type: "header",
				key: "Authorization",
			});
			expect(contentTypeParam).toEqual({
				index: 1,
				type: "header",
				key: "Content-Type",
			});
		});
	});

	describe("Mixed parameters", () => {
		it("should handle combination of different parameter types", () => {
			class TestClass {
				testMethod(
					@Path("id") _id: number,
					@Query("limit") _limit: number,
					@Body() _data: unknown,
					@Header("Authorization") _auth: string,
				) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(4);
			const pathParam = metadata.find((m) => m.index === 0);
			const queryParam = metadata.find((m) => m.index === 1);
			const bodyParam = metadata.find((m) => m.index === 2);
			const headerParam = metadata.find((m) => m.index === 3);

			expect(pathParam?.type).toBe("path");
			expect(queryParam?.type).toBe("query");
			expect(bodyParam?.type).toBe("body");
			expect(headerParam?.type).toBe("header");
		});
	});
});
