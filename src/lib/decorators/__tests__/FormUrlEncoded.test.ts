import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Collection } from "../Collection.ts";
import { Field } from "../Field.ts";
import { FormUrlEncoded } from "../FormUrlEncoded.ts";
import { POST } from "../POST.ts";

describe("FormUrlEncoded and Field decorators", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should send form-urlencoded data", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { token: "xyz123" },
			status: 200,
			headers: {},
		});

		@Collection("/auth")
		class AuthRepository extends Restify {
			@POST("/login")
			@FormUrlEncoded()
			login(
				@Field("email") _email: string,
				@Field("password") _password: string,
			): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new AuthRepository(axiosInstance);
		await repo.login("user@example.com", "secret123");

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.method).toBe("POST");
		expect(callArgs.url).toBe("/auth/login");
		expect(callArgs.headers["Content-Type"]).toBe(
			"application/x-www-form-urlencoded",
		);
		// Check that data contains both fields (order doesn't matter)
		expect(callArgs.data).toContain("email=user%40example.com");
		expect(callArgs.data).toContain("password=secret123");
	});

	it("should handle OAuth2 token request", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { access_token: "token", token_type: "bearer" },
			status: 200,
			headers: {},
		});

		@Collection("/oauth")
		class OAuthRepository extends Restify {
			@POST("/token")
			@FormUrlEncoded()
			getToken(
				@Field("grant_type") _grantType: string,
				@Field("username") _username: string,
				@Field("password") _password: string,
				@Field("client_id") _clientId: string,
			): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new OAuthRepository(axiosInstance);
		await repo.getToken("password", "john@example.com", "pass123", "app-id");

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.data).toContain("grant_type=password");
		expect(callArgs.data).toContain("username=john%40example.com");
		expect(callArgs.data).toContain("password=pass123");
		expect(callArgs.data).toContain("client_id=app-id");
	});

	it("should handle special characters in form fields", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/submit")
			@FormUrlEncoded()
			submit(
				@Field("name") _name: string,
				@Field("message") _message: string,
			): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.submit("John Doe", "Hello & Welcome!");

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.data).toContain("name=John+Doe");
		expect(callArgs.data).toContain("message=Hello+%26+Welcome%21");
	});

	it("should work without FormUrlEncoded decorator (no form encoding)", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/data")
			sendData(
				@Field("field1") _field1: string,
				@Field("field2") _field2: string,
			): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendData("value1", "value2");

		// Without @FormUrlEncoded, fields are not processed
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "POST",
				url: "/api/data",
				data: undefined,
			}),
		);
	});

	it("should handle empty form fields", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/submit")
			@FormUrlEncoded()
			submit(@Field("name") _name: string): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.submit("John");

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: "name=John",
			}),
		);
	});

	it("should handle numeric form field values", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/update")
			@FormUrlEncoded()
			update(
				@Field("id") _id: number,
				@Field("count") _count: number,
			): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.update(123, 456);

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.data).toContain("id=123");
		expect(callArgs.data).toContain("count=456");
	});

	it("should preserve other headers when using FormUrlEncoded", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/login")
			@FormUrlEncoded()
			login(
				@Field("email") _email: string,
				@Field("password") _password: string,
			): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.login("user@example.com", "pass");

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					"Content-Type": "application/x-www-form-urlencoded",
				}),
			}),
		);
	});
});
