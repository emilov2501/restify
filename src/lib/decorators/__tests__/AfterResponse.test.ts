import type { AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { METADATA_KEYS } from "../../constants.ts";
import { AfterResponse } from "../AfterResponse.ts";
import "reflect-metadata";

describe("AfterResponse", () => {
	it("should store interceptor in metadata", () => {
		const interceptor = (response: AxiosResponse) => {
			response.data = { ...response.data, modified: true };
			return response;
		};

		class TestClass {
			@AfterResponse(interceptor)
			testMethod() {}
		}

		const storedInterceptor = Reflect.getMetadata(
			METADATA_KEYS.AFTER_RESPONSE,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedInterceptor).toBe(interceptor);
	});

	it("should allow async interceptor", () => {
		const asyncInterceptor = async (response: AxiosResponse) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			response.data = { ...response.data, processed: true };
			return response;
		};

		class TestClass {
			@AfterResponse(asyncInterceptor)
			testMethod() {}
		}

		const storedInterceptor = Reflect.getMetadata(
			METADATA_KEYS.AFTER_RESPONSE,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedInterceptor).toBe(asyncInterceptor);
	});
});
