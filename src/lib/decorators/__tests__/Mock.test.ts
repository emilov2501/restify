import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Collection } from "../Collection.ts";
import { GET } from "../GET.ts";
import { Mock } from "../Mock.ts";

interface User {
	id: number;
	name: string;
	email: string;
}

describe("@Mock", () => {
	let api: TestAPI;
	const originalEnv = process.env.NODE_ENV;

	@Collection("/api")
	class TestAPI extends Restify {
		@GET("/users")
		@Mock<User[]>({
			data: [
				{ id: 1, name: "John Doe", email: "john@example.com" },
				{ id: 2, name: "Jane Smith", email: "jane@example.com" },
			],
		})
		getUsers(): Promise<User[]> {
			return {} as Promise<User[]>;
		}

		@GET("/users/:id")
		@Mock<User>({
			data: () => ({
				id: 1,
				name: "John Doe",
				email: "john@example.com",
			}),
			delay: 100,
		})
		getUser(): Promise<User> {
			return {} as Promise<User>;
		}

		@GET("/posts")
		@Mock({
			data: [],
			status: 404,
		})
		getPosts(): Promise<unknown[]> {
			return {} as Promise<unknown[]>;
		}

		@GET("/comments")
		@Mock({
			data: ["comment1"],
			enabled: false,
		})
		getComments(): Promise<string[]> {
			return {} as Promise<string[]>;
		}
	}

	beforeEach(() => {
		const axiosInstance = axios.create({
			baseURL: "https://api.example.com",
		});
		api = new TestAPI(axiosInstance);
		process.env.NODE_ENV = "development";
	});

	it("should return mock data in development", async () => {
		const response = await api.getUsers();

		expect(response.status).toBe(200);
		expect(response.data).toEqual([
			{ id: 1, name: "John Doe", email: "john@example.com" },
			{ id: 2, name: "Jane Smith", email: "jane@example.com" },
		]);
	});

	it("should support function as mock data", async () => {
		const response = await api.getUser();

		expect(response.status).toBe(200);
		expect(response.data).toEqual({
			id: 1,
			name: "John Doe",
			email: "john@example.com",
		});
	});

	it("should simulate network delay", async () => {
		const startTime = Date.now();
		await api.getUser();
		const endTime = Date.now();

		expect(endTime - startTime).toBeGreaterThanOrEqual(100);
	});

	it("should support custom status code", async () => {
		const response = await api.getPosts();

		expect(response.status).toBe(404);
		expect(response.data).toEqual([]);
	});

	it("should not use mock when enabled is false", async () => {
		const axiosInstance = axios.create({
			baseURL: "https://api.example.com",
		});

		// Mock axios request
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockResolvedValue({
				data: ["real comment"],
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

		const testApi = new TestAPI(axiosInstance);
		const response = await testApi.getComments();

		expect(mockRequest).toHaveBeenCalled();
		expect(response.data).toEqual(["real comment"]);
	});

	it("should not use mock in production", async () => {
		process.env.NODE_ENV = "production";

		const axiosInstance = axios.create({
			baseURL: "https://api.example.com",
		});

		// Mock axios request
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockResolvedValue({
				data: [{ id: 99, name: "Real User", email: "real@example.com" }],
				status: 200,
				statusText: "OK",
				headers: {},
				config: {} as never,
			});

		const testApi = new TestAPI(axiosInstance);
		const response = await testApi.getUsers();

		expect(mockRequest).toHaveBeenCalled();
		expect(response.data).toEqual([
			{ id: 99, name: "Real User", email: "real@example.com" },
		]);

		process.env.NODE_ENV = originalEnv;
	});
});
