import { describe, expect, it, vi } from "vitest";
import "reflect-metadata";
import axios from "axios";
import { METADATA_KEYS } from "../../constants.ts";
import { Restify } from "../../Restify.ts";
import type { ParameterMetadata } from "../../types.ts";
import { Body } from "../Body.ts";
import { GET } from "../GET.ts";
import { OnDownloadProgress } from "../OnDownloadProgress.ts";
import { OnUploadProgress } from "../OnUploadProgress.ts";
import { Path } from "../Path.ts";
import { POST } from "../POST.ts";

describe("Progress Decorators", () => {
	describe("@OnUploadProgress", () => {
		it("should add upload progress parameter metadata", () => {
			class TestClass {
				testMethod(@OnUploadProgress() _onProgress: (p: number) => void) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(1);
			expect(metadata[0]).toEqual({
				index: 0,
				type: "uploadProgress",
			});
		});

		it("should work with other parameter decorators", () => {
			class TestClass {
				testMethod(
					@Body() _data: FormData,
					@OnUploadProgress() _onProgress: (p: number) => void,
				) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(2);
			const bodyParam = metadata.find((m) => m.index === 0);
			const progressParam = metadata.find((m) => m.index === 1);

			expect(bodyParam?.type).toBe("body");
			expect(progressParam?.type).toBe("uploadProgress");
		});
	});

	describe("@OnDownloadProgress", () => {
		it("should add download progress parameter metadata", () => {
			class TestClass {
				testMethod(@OnDownloadProgress() _onProgress: (p: number) => void) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(1);
			expect(metadata[0]).toEqual({
				index: 0,
				type: "downloadProgress",
			});
		});

		it("should work with other parameter decorators", () => {
			class TestClass {
				testMethod(
					@Path("id") _id: string,
					@OnDownloadProgress() _onProgress: (p: number) => void,
				) {}
			}

			const metadata = Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				TestClass.prototype,
				"testMethod",
			) as ParameterMetadata[];

			expect(metadata).toHaveLength(2);
			const pathParam = metadata.find((m) => m.index === 0);
			const progressParam = metadata.find((m) => m.index === 1);

			expect(pathParam?.type).toBe("path");
			expect(progressParam?.type).toBe("downloadProgress");
		});
	});

	describe("Integration with Restify", () => {
		it("should call upload progress callback during file upload", async () => {
			const progressCallback = vi.fn();
			const mockAxios = {
				request: vi.fn().mockImplementation((config) => {
					// Simulate progress events
					if (config.onUploadProgress) {
						config.onUploadProgress({ loaded: 50, total: 100 });
						config.onUploadProgress({ loaded: 100, total: 100 });
					}
					return Promise.resolve({
						data: { success: true },
						status: 200,
						headers: {},
					});
				}),
			} as unknown as typeof axios;

			class FileAPI extends Restify {
				@POST("/upload")
				async uploadFile(
					@Body() _file: FormData,
					@OnUploadProgress() onProgress?: (progress: number) => void,
				) {}
			}

			const api = new FileAPI(mockAxios);
			const formData = new FormData();
			await api.uploadFile(formData, progressCallback);

			expect(progressCallback).toHaveBeenCalledWith(50);
			expect(progressCallback).toHaveBeenCalledWith(100);
			expect(progressCallback).toHaveBeenCalledTimes(2);
		});

		it("should call download progress callback during file download", async () => {
			const progressCallback = vi.fn();
			const mockAxios = {
				request: vi.fn().mockImplementation((config) => {
					// Simulate progress events
					if (config.onDownloadProgress) {
						config.onDownloadProgress({ loaded: 25, total: 100 });
						config.onDownloadProgress({ loaded: 75, total: 100 });
						config.onDownloadProgress({ loaded: 100, total: 100 });
					}
					return Promise.resolve({
						data: new Blob(["file content"]),
						status: 200,
						headers: {},
					});
				}),
			} as unknown as typeof axios;

			class FileAPI extends Restify {
				@GET("/download/:id")
				async downloadFile(
					@Path("id") _id: string,
					@OnDownloadProgress() onProgress?: (progress: number) => void,
				) {}
			}

			const api = new FileAPI(mockAxios);
			await api.downloadFile("123", progressCallback);

			expect(progressCallback).toHaveBeenCalledWith(25);
			expect(progressCallback).toHaveBeenCalledWith(75);
			expect(progressCallback).toHaveBeenCalledWith(100);
			expect(progressCallback).toHaveBeenCalledTimes(3);
		});

		it("should work without progress callback (optional)", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { success: true },
					status: 200,
					headers: {},
				}),
			} as unknown as typeof axios;

			class FileAPI extends Restify {
				@POST("/upload")
				async uploadFile(
					@Body() _file: FormData,
					@OnUploadProgress() _onProgress?: (progress: number) => void,
				) {}
			}

			const api = new FileAPI(mockAxios);
			const formData = new FormData();

			// Should not throw when callback is not provided
			await expect(api.uploadFile(formData)).resolves.toBeDefined();
		});

		it("should handle progress when total is unknown", async () => {
			const progressCallback = vi.fn();
			const mockAxios = {
				request: vi.fn().mockImplementation((config) => {
					// Simulate progress without total
					if (config.onUploadProgress) {
						config.onUploadProgress({ loaded: 50, total: 0 });
					}
					return Promise.resolve({
						data: { success: true },
						status: 200,
						headers: {},
					});
				}),
			} as unknown as typeof axios;

			class FileAPI extends Restify {
				@POST("/upload")
				async uploadFile(
					@Body() _file: FormData,
					@OnUploadProgress() onProgress?: (progress: number) => void,
				) {}
			}

			const api = new FileAPI(mockAxios);
			const formData = new FormData();
			await api.uploadFile(formData, progressCallback);

			// Should call with 0 when total is unknown
			expect(progressCallback).toHaveBeenCalledWith(0);
		});

		it("should round progress to nearest integer", async () => {
			const progressCallback = vi.fn();
			const mockAxios = {
				request: vi.fn().mockImplementation((config) => {
					// Simulate progress that results in decimal
					if (config.onUploadProgress) {
						config.onUploadProgress({ loaded: 33, total: 100 });
						config.onUploadProgress({ loaded: 66, total: 100 });
					}
					return Promise.resolve({
						data: { success: true },
						status: 200,
						headers: {},
					});
				}),
			} as unknown as typeof axios;

			class FileAPI extends Restify {
				@POST("/upload")
				async uploadFile(
					@Body() _file: FormData,
					@OnUploadProgress() onProgress?: (progress: number) => void,
				) {}
			}

			const api = new FileAPI(mockAxios);
			const formData = new FormData();
			await api.uploadFile(formData, progressCallback);

			// Should be rounded integers
			expect(progressCallback).toHaveBeenCalledWith(33);
			expect(progressCallback).toHaveBeenCalledWith(66);
		});

		it("should support both upload and download progress in different methods", async () => {
			const uploadProgressCallback = vi.fn();
			const downloadProgressCallback = vi.fn();

			const mockAxios = {
				request: vi.fn().mockImplementation((config) => {
					if (config.onUploadProgress) {
						config.onUploadProgress({ loaded: 100, total: 100 });
					}
					if (config.onDownloadProgress) {
						config.onDownloadProgress({ loaded: 100, total: 100 });
					}
					return Promise.resolve({
						data: { success: true },
						status: 200,
						headers: {},
					});
				}),
			} as unknown as typeof axios;

			class FileAPI extends Restify {
				@POST("/upload")
				async uploadFile(
					@Body() _file: FormData,
					@OnUploadProgress() onProgress?: (progress: number) => void,
				) {}

				@GET("/download/:id")
				async downloadFile(
					@Path("id") _id: string,
					@OnDownloadProgress() onProgress?: (progress: number) => void,
				) {}
			}

			const api = new FileAPI(mockAxios);

			await api.uploadFile(new FormData(), uploadProgressCallback);
			expect(uploadProgressCallback).toHaveBeenCalledWith(100);

			await api.downloadFile("123", downloadProgressCallback);
			expect(downloadProgressCallback).toHaveBeenCalledWith(100);
		});
	});
});
