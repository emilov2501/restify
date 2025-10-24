import { describe, expect, it } from "vitest";
import { METADATA_KEYS } from "../../constants.ts";
import { Retry } from "../Retry.ts";
import "reflect-metadata";

describe("Retry", () => {
	it("should store default retry config in metadata", () => {
		class TestClass {
			@Retry()
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.RETRY,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedConfig).toBeDefined();
		expect(storedConfig.attempts).toBe(3);
		expect(storedConfig.delay).toBe(1000);
		expect(storedConfig.backoff).toBe(2);
		expect(storedConfig.maxDelay).toBe(30000);
		expect(typeof storedConfig.shouldRetry).toBe("function");
	});

	it("should store custom retry config in metadata", () => {
		const customShouldRetry = () => true;

		class TestClass {
			@Retry({
				attempts: 5,
				delay: 2000,
				backoff: 1.5,
				maxDelay: 10000,
				shouldRetry: customShouldRetry,
			})
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.RETRY,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedConfig).toBeDefined();
		expect(storedConfig.attempts).toBe(5);
		expect(storedConfig.delay).toBe(2000);
		expect(storedConfig.backoff).toBe(1.5);
		expect(storedConfig.maxDelay).toBe(10000);
		expect(storedConfig.shouldRetry).toBe(customShouldRetry);
	});

	it("should use default shouldRetry that retries on 5xx errors", () => {
		class TestClass {
			@Retry()
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.RETRY,
			TestClass.prototype,
			"testMethod",
		);

		// Should retry on 500
		expect(storedConfig.shouldRetry({ response: { status: 500 } })).toBe(true);

		// Should retry on 503
		expect(storedConfig.shouldRetry({ response: { status: 503 } })).toBe(true);

		// Should not retry on 404
		expect(storedConfig.shouldRetry({ response: { status: 404 } })).toBe(false);

		// Should not retry on 400
		expect(storedConfig.shouldRetry({ response: { status: 400 } })).toBe(false);

		// Should retry on network error (no response)
		expect(storedConfig.shouldRetry(new Error("Network error"))).toBe(true);
	});

	it("should allow custom shouldRetry logic", () => {
		class TestClass {
			@Retry({
				shouldRetry: (error: unknown) => {
					// Only retry on 503 Service Unavailable
					if (
						error &&
						typeof error === "object" &&
						"response" in error &&
						error.response &&
						typeof error.response === "object" &&
						"status" in error.response
					) {
						return (error.response as { status: number }).status === 503;
					}
					return false;
				},
			})
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.RETRY,
			TestClass.prototype,
			"testMethod",
		);

		// Should retry only on 503
		expect(storedConfig.shouldRetry({ response: { status: 503 } })).toBe(true);

		// Should not retry on other errors
		expect(storedConfig.shouldRetry({ response: { status: 500 } })).toBe(false);
		expect(storedConfig.shouldRetry({ response: { status: 404 } })).toBe(false);
		expect(storedConfig.shouldRetry(new Error("Network error"))).toBe(false);
	});

	it("should allow partial config", () => {
		class TestClass {
			@Retry({ attempts: 2 })
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.RETRY,
			TestClass.prototype,
			"testMethod",
		);

		// Custom value
		expect(storedConfig.attempts).toBe(2);

		// Defaults
		expect(storedConfig.delay).toBe(1000);
		expect(storedConfig.backoff).toBe(2);
		expect(storedConfig.maxDelay).toBe(30000);
	});
});
