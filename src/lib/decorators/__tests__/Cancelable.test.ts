import { beforeEach, describe, expect, it, vi } from "vitest";
import { METADATA_KEYS } from "../../constants.ts";
import { Cancelable, getAbortController } from "../Cancelable.ts";
import "reflect-metadata";

describe("Cancelable", () => {
	it("should store default cancelable config in metadata", () => {
		class TestClass {
			@Cancelable()
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.CANCELABLE,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedConfig).toBeDefined();
		expect(storedConfig.strategy).toBe("latest");
	});

	it("should store custom strategy in metadata", () => {
		class TestClass {
			@Cancelable({ strategy: "all" })
			testMethod() {}
		}

		const storedConfig = Reflect.getMetadata(
			METADATA_KEYS.CANCELABLE,
			TestClass.prototype,
			"testMethod",
		);

		expect(storedConfig).toBeDefined();
		expect(storedConfig.strategy).toBe("all");
	});

	it("should create abort controller for method", () => {
		const instance = {};
		const propertyKey = "testMethod";

		const controller = getAbortController(instance, propertyKey, "latest");

		expect(controller).toBeInstanceOf(AbortController);
		expect(controller.signal.aborted).toBe(false);
	});

	it("should abort previous controller with 'latest' strategy", () => {
		const instance = {};
		const propertyKey = "testMethod";

		// Create first controller
		const controller1 = getAbortController(instance, propertyKey, "latest");
		expect(controller1.signal.aborted).toBe(false);

		// Create second controller - should abort first
		const controller2 = getAbortController(instance, propertyKey, "latest");
		expect(controller1.signal.aborted).toBe(true);
		expect(controller2.signal.aborted).toBe(false);

		// Create third controller - should abort second
		const controller3 = getAbortController(instance, propertyKey, "latest");
		expect(controller2.signal.aborted).toBe(true);
		expect(controller3.signal.aborted).toBe(false);
	});

	it("should not abort previous controller with 'all' strategy", () => {
		const instance = {};
		const propertyKey = "testMethod";

		// Create multiple controllers
		const controller1 = getAbortController(instance, propertyKey, "all");
		const controller2 = getAbortController(instance, propertyKey, "all");
		const controller3 = getAbortController(instance, propertyKey, "all");

		// None should be aborted
		expect(controller1.signal.aborted).toBe(false);
		expect(controller2.signal.aborted).toBe(false);
		expect(controller3.signal.aborted).toBe(false);
	});

	it("should maintain separate controllers per instance", () => {
		const instance1 = {};
		const instance2 = {};
		const propertyKey = "testMethod";

		// Create controllers for different instances
		const controller1 = getAbortController(instance1, propertyKey, "latest");
		const controller2 = getAbortController(instance2, propertyKey, "latest");

		expect(controller1).not.toBe(controller2);
		expect(controller1.signal.aborted).toBe(false);
		expect(controller2.signal.aborted).toBe(false);

		// Creating new controller for instance1 should not affect instance2
		const controller3 = getAbortController(instance1, propertyKey, "latest");
		expect(controller1.signal.aborted).toBe(true);
		expect(controller2.signal.aborted).toBe(false);
		expect(controller3.signal.aborted).toBe(false);
	});

	it("should maintain separate controllers per method", () => {
		const instance = {};
		const methodA = "methodA";
		const methodB = "methodB";

		// Create controllers for different methods
		const controllerA1 = getAbortController(instance, methodA, "latest");
		const controllerB1 = getAbortController(instance, methodB, "latest");

		expect(controllerA1).not.toBe(controllerB1);
		expect(controllerA1.signal.aborted).toBe(false);
		expect(controllerB1.signal.aborted).toBe(false);

		// Creating new controller for methodA should not affect methodB
		const controllerA2 = getAbortController(instance, methodA, "latest");
		expect(controllerA1.signal.aborted).toBe(true);
		expect(controllerB1.signal.aborted).toBe(false);
		expect(controllerA2.signal.aborted).toBe(false);
	});

	it("should properly handle abort signal", () => {
		const instance = {};
		const propertyKey = "testMethod";

		const controller = getAbortController(instance, propertyKey, "latest");
		const abortHandler = vi.fn();

		controller.signal.addEventListener("abort", abortHandler);

		// Create new controller to trigger abort
		getAbortController(instance, propertyKey, "latest");

		expect(abortHandler).toHaveBeenCalledOnce();
	});

	it("should handle symbol property keys", () => {
		const instance = {};
		const propertyKey = Symbol("testMethod");

		const controller1 = getAbortController(instance, propertyKey, "latest");
		const controller2 = getAbortController(instance, propertyKey, "latest");

		expect(controller1.signal.aborted).toBe(true);
		expect(controller2.signal.aborted).toBe(false);
	});
});
