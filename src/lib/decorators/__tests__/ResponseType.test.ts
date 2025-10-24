import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Collection } from "../Collection.ts";
import { GET } from "../GET.ts";
import { Path } from "../Path.ts";
import { ResponseType } from "../ResponseType.ts";

describe("ResponseType decorator", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should set responseType to blob for file downloads", async () => {
		const mockBlob = new Blob(["test content"], { type: "application/pdf" });
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: mockBlob,
			status: 200,
			headers: { "content-type": "application/pdf" },
		});

		@Collection("/files")
		class FileRepository extends Restify {
			@GET("/:id/download")
			@ResponseType("blob")
			downloadFile(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new FileRepository(axiosInstance);
		const result = await repo.downloadFile(123);

		expect(result.data).toBe(mockBlob);
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/files/123/download",
				responseType: "blob",
			}),
		);
	});

	it("should set responseType to arraybuffer for binary data", async () => {
		const mockBuffer = new ArrayBuffer(8);
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: mockBuffer,
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/image.jpg")
			@ResponseType("arraybuffer")
			getImage(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getImage();

		expect(result.data).toBe(mockBuffer);
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				responseType: "arraybuffer",
			}),
		);
	});

	it("should set responseType to text for text responses", async () => {
		const mockText = "Plain text response";
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: mockText,
			status: 200,
			headers: { "content-type": "text/plain" },
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/text")
			@ResponseType("text")
			getText(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getText();

		expect(result.data).toBe(mockText);
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				responseType: "text",
			}),
		);
	});

	it("should work without ResponseType decorator (default json)", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { message: "success" },
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
		const result = await repo.getData();

		expect(result.data).toEqual({ message: "success" });
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/api/data",
				responseType: undefined,
			}),
		);
	});

	it("should handle document response type", async () => {
		const mockDocument = "<html><body>Test</body></html>";
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: mockDocument,
			status: 200,
			headers: { "content-type": "text/html" },
		});

		@Collection("/pages")
		class PageRepository extends Restify {
			@GET("/:id")
			@ResponseType("document")
			getPage(@Path("id") _id: string): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new PageRepository(axiosInstance);
		await repo.getPage("home");

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				responseType: "document",
			}),
		);
	});

	it("should preserve other request options when using ResponseType", async () => {
		const mockBlob = new Blob(["file"], { type: "application/pdf" });
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: mockBlob,
			status: 200,
			headers: {},
		});

		@Collection("/files")
		class FileRepository extends Restify {
			@GET("/:id")
			@ResponseType("blob")
			getFile(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new FileRepository(axiosInstance);
		await repo.getFile(42);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/files/42",
				responseType: "blob",
			}),
		);
	});
});
