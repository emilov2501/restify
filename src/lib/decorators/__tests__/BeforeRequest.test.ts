import type { AxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { METADATA_KEYS } from "../../constants.ts";
import { BeforeRequest } from "../BeforeRequest.ts";
import "reflect-metadata";

describe("BeforeRequest", () => {
	it("should store interceptor in metadata", () => {
		const interceptor = (config: AxiosRequestConfig) => {
			config.headers = { ...config.headers, "X-Custom": "value" };
			return config;
		};

		class TestClass {
			@BeforeRequest(interceptor)
			testMethod() {}
		}

		const storedInterceptor = Reflect.getMetadata(
			METADATA_KEYS.BEFORE_REQUEST,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedInterceptor).toBe(interceptor);
	});

	it("should allow async interceptor", () => {
		const asyncInterceptor = async (config: AxiosRequestConfig) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			config.headers = { ...config.headers, "X-Async": "true" };
			return config;
		};

		class TestClass {
			@BeforeRequest(asyncInterceptor)
			testMethod() {}
		}

		const storedInterceptor = Reflect.getMetadata(
			METADATA_KEYS.BEFORE_REQUEST,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedInterceptor).toBe(asyncInterceptor);
	});
});
