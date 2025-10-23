import { describe, expect, it } from "vitest";
import "reflect-metadata";
import { METADATA_KEYS } from "../../constants.ts";
import type { ParameterMetadata } from "../../types.ts";
import { QueryMap } from "../QueryMap.ts";

describe("@QueryMap decorator", () => {
	it("should add queryMap parameter metadata", () => {
		class TestClass {
			testMethod(@QueryMap() _filters: Record<string, unknown>) {}
		}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.PARAMETERS,
			TestClass.prototype,
			"testMethod",
		) as ParameterMetadata[];

		expect(metadata).toHaveLength(1);
		expect(metadata[0]).toEqual({
			index: 0,
			type: "queryMap",
		});
	});

	it("should work with typed filter interfaces", () => {
		interface Filters {
			name?: string;
			age?: number;
			status?: string;
		}

		class TestClass {
			testMethod(@QueryMap() _filters: Filters) {}
		}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.PARAMETERS,
			TestClass.prototype,
			"testMethod",
		) as ParameterMetadata[];

		expect(metadata).toHaveLength(1);
		expect(metadata[0].type).toBe("queryMap");
	});

	it("should handle multiple parameters including QueryMap", () => {
		class TestClass {
			testMethod(
				@QueryMap() _filters: Record<string, unknown>,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				_otherParam: string,
			) {}
		}

		const metadata = Reflect.getMetadata(
			METADATA_KEYS.PARAMETERS,
			TestClass.prototype,
			"testMethod",
		) as ParameterMetadata[];

		expect(metadata).toHaveLength(1);
		expect(metadata[0].index).toBe(0);
		expect(metadata[0].type).toBe("queryMap");
	});
});
