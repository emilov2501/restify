import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Collection } from "../Collection.ts";
import { GET } from "../GET.ts";
import { POST } from "../POST.ts";
import { WithCredentials } from "../WithCredentials.ts";

describe("WithCredentials decorator", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should enable withCredentials for all methods when applied to class", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { user: "john" },
			status: 200,
			headers: {},
		});

		@WithCredentials()
		@Collection("/api")
		class AuthRepository extends Restify {
			@GET("/profile")
			getProfile(): Promise<unknown> {
				return Promise.resolve();
			}

			@POST("/logout")
			logout(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new AuthRepository(axiosInstance);
		await repo.getProfile();
		await repo.logout();

		expect(mockRequest).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				withCredentials: true,
			}),
		);
		expect(mockRequest).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				withCredentials: true,
			}),
		);
	});

	it("should enable withCredentials only for specific method", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/public")
			getPublicData(): Promise<unknown> {
				return Promise.resolve();
			}

			@GET("/private")
			@WithCredentials()
			getPrivateData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getPublicData();
		await repo.getPrivateData();

		// First call - no credentials
		expect(mockRequest).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				url: "/api/public",
				withCredentials: undefined,
			}),
		);

		// Second call - with credentials
		expect(mockRequest).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				url: "/api/private",
				withCredentials: true,
			}),
		);
	});

	it("should allow method decorator to override class decorator", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@WithCredentials() // Enable for all by default
		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/data")
			getData(): Promise<unknown> {
				return Promise.resolve();
			}

			@GET("/public")
			@WithCredentials(false) // Explicitly disable for this method
			getPublicData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getData();
		await repo.getPublicData();

		// First call - with credentials (from class)
		expect(mockRequest).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				withCredentials: true,
			}),
		);

		// Second call - no credentials (method override)
		expect(mockRequest).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				withCredentials: false,
			}),
		);
	});

	it("should work without WithCredentials decorator", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/data")
			getData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getData();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "/api/data",
				withCredentials: undefined,
			}),
		);
	});

	it("should send cookies with cross-origin requests", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { authenticated: true },
			status: 200,
			headers: {},
		});

		@WithCredentials()
		@Collection("/auth")
		class AuthRepository extends Restify {
			@GET("/check")
			checkAuth(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new AuthRepository(axiosInstance);
		const result = await repo.checkAuth();

		expect(result.data).toEqual({ authenticated: true });
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/auth/check",
				withCredentials: true,
			}),
		);
	});

	it("should preserve other request options when using WithCredentials", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@WithCredentials()
		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/data")
			sendData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendData();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "POST",
				url: "/api/data",
				withCredentials: true,
			}),
		);
	});
});
