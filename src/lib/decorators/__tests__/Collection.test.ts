import { describe, expect, it } from "vitest";
import "reflect-metadata";
import { METADATA_KEYS } from "../../constants.ts";
import { Collection } from "../Collection.ts";

describe("@Collection decorator", () => {
	it("should set collection metadata on class", () => {
		@Collection("/api/users")
		class TestRepository {}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.COLLECTION,
			TestRepository,
		);

		expect(metadata).toEqual({ basePath: "/api/users" });
	});

	it("should work with empty path", () => {
		@Collection("")
		class TestRepository {}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.COLLECTION,
			TestRepository,
		);

		expect(metadata).toEqual({ basePath: "" });
	});

	it("should work with root path", () => {
		@Collection("/")
		class TestRepository {}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.COLLECTION,
			TestRepository,
		);

		expect(metadata).toEqual({ basePath: "/" });
	});

	it("should work with nested paths", () => {
		@Collection("/api/v1/users")
		class TestRepository {}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.COLLECTION,
			TestRepository,
		);

		expect(metadata).toEqual({ basePath: "/api/v1/users" });
	});
});
