import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Body } from "../Body.ts";
import { Collection } from "../Collection.ts";
import { POST } from "../POST.ts";
import { TransformRequest } from "../TransformRequest.ts";

describe("TransformRequest decorator", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should transform request data before sending", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { success: true },
			status: 200,
			headers: {},
		});

		interface CreateUserDto {
			firstName: string;
			lastName: string;
		}

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/users")
			@TransformRequest<CreateUserDto>((user) => ({
				...user,
				fullName: `${user.firstName} ${user.lastName}`,
			}))
			createUser(@Body() user: CreateUserDto): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.createUser({ firstName: "John", lastName: "Doe" });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "POST",
				url: "/api/users",
				data: {
					firstName: "John",
					lastName: "Doe",
					fullName: "John Doe",
				},
			}),
		);
	});

	it("should work with async transform functions", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { id: 1 },
			status: 200,
			headers: {},
		});

		interface CreateData {
			value: number;
		}

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/data")
			@TransformRequest<CreateData>(async (data) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return {
					...data,
					timestamp: "2024-01-01T00:00:00Z",
				};
			})
			sendData(@Body() data: CreateData): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendData({ value: 42 });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: {
					value: 42,
					timestamp: "2024-01-01T00:00:00Z",
				},
			}),
		);
	});

	it("should handle object serialization", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { success: true },
			status: 200,
			headers: {},
		});

		class CustomObject {
			constructor(
				public id: number,
				public name: string,
			) {}
		}

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/objects")
			@TransformRequest<CustomObject>((obj) => ({
				id: obj.id,
				name: obj.name,
			}))
			sendObject(@Body() obj: CustomObject): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const customObj = new CustomObject(1, "Test");
		await repo.sendObject(customObj);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: {
					id: 1,
					name: "Test",
				},
			}),
		);
	});

	it("should preserve status and headers", async () => {
		const _mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { id: 1 },
			status: 201,
			headers: { "x-custom-header": "value" },
		});

		interface CreateItemDto {
			name: string;
		}

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/items")
			@TransformRequest<CreateItemDto>((item) => ({
				...item,
				createdAt: new Date().toISOString(),
			}))
			createItem(@Body() item: CreateItemDto): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.createItem({ name: "Item 1" });

		expect(result.status).toBe(201);
		expect(result.headers).toHaveProperty("x-custom-header", "value");
	});

	it("should not transform if body is undefined", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/empty")
			@TransformRequest(() => ({
				transformed: true,
			}))
			sendEmpty(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendEmpty();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: undefined,
			}),
		);
	});

	it("should work without TransformRequest decorator", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { success: true },
			status: 200,
			headers: {},
		});

		interface CreateDto {
			value: string;
		}

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/data")
			sendData(@Body() data: CreateDto): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendData({ value: "test" });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: { value: "test" },
			}),
		);
	});

	it("should handle array transformation", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { success: true },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/items")
			@TransformRequest<number[]>((items) => items.map((item) => item * 2))
			sendItems(@Body() items: number[]): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendItems([1, 2, 3]);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: [2, 4, 6],
			}),
		);
	});

	it("should normalize payload structure", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { id: 1 },
			status: 200,
			headers: {},
		});

		interface RawDto {
			user_name: string;
			user_email: string;
		}

		@Collection("/api")
		class ApiRepository extends Restify {
			@POST("/normalize")
			@TransformRequest<RawDto>((data) => ({
				userName: data.user_name,
				userEmail: data.user_email,
			}))
			sendNormalized(@Body() data: RawDto): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.sendNormalized({
			user_name: "john",
			user_email: "john@example.com",
		});

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				data: {
					userName: "john",
					userEmail: "john@example.com",
				},
			}),
		);
	});
});
