import { describe, it, expect, vi, beforeEach } from "vitest";
import "reflect-metadata";
import { Restify } from "../Restify.ts";
import { Collection } from "../decorators/Collection.ts";
import { GET, POST, PUT, DELETE } from "../decorators/index.ts";
import { Query, Path, Body, Header } from "../decorators/index.ts";

// Mock fetch globally
global.fetch = vi.fn();

describe("Restify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic HTTP requests", () => {
    it("should make GET request", async () => {
      const mockResponse = {
        json: () => Promise.resolve({ id: 1, name: "Test" }),
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/users")
        getUsers() {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getUsers();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/users",
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should make POST request with body", async () => {
      const mockResponse = {
        json: () => Promise.resolve({ id: 1, name: "Created" }),
        status: 201,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @POST("/users")
        createUser(@Body() _data: unknown) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.createUser({ name: "Test" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  describe("Path parameters", () => {
    it("should replace path parameters in URL", async () => {
      const mockResponse = {
        json: () => Promise.resolve({ id: 123 }),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/users/:id")
        getUser(@Path("id") _id: number) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getUser(123);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/users/123",
        expect.any(Object)
      );
    });

    it("should handle multiple path parameters", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/users/:userId/posts/:postId")
        getPost(@Path("userId") _userId: number, @Path("postId") _postId: number) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getPost(1, 42);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/users/1/posts/42",
        expect.any(Object)
      );
    });
  });

  describe("Query parameters", () => {
    it("should add query parameters to URL", async () => {
      const mockResponse = {
        json: () => Promise.resolve([]),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/users")
        getUsers(@Query("page") _page: number, @Query("limit") _limit: number) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getUsers(1, 10);

      const callUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(callUrl).toContain("https://api.example.com/api/users?");
      expect(callUrl).toContain("page=1");
      expect(callUrl).toContain("limit=10");
    });

    it("should handle special characters in query parameters", async () => {
      const mockResponse = {
        json: () => Promise.resolve([]),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/search")
        search(@Query("q") _query: string) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.search("hello world");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/search?q=hello%20world",
        expect.any(Object)
      );
    });
  });

  describe("Headers", () => {
    it("should add custom headers", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/users")
        getUsers(@Header("Authorization") _token: string) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getUsers("Bearer token123");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        })
      );
    });

    it("should merge config headers with parameter headers", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @GET("/users")
        getUsers(@Header("X-Custom") _custom: string) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await repo.getUsers("value");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Custom": "value",
          }),
        })
      );
    });
  });

  describe("Collection decorator", () => {
    it("should prepend collection path to endpoint", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api/v1")
      class TestRepository extends Restify {
        @GET("/users")
        getUsers() {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getUsers();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/users",
        expect.any(Object)
      );
    });

    it("should work without Collection decorator", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      class TestRepository extends Restify {
        @GET("/users")
        getUsers() {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.getUsers();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );
    });
  });

  describe("HTTP methods", () => {
    it("should handle PUT requests", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      class TestRepository extends Restify {
        @PUT("/users/:id")
        updateUser(@Path("id") _id: number, @Body() _data: unknown) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.updateUser(1, { name: "Updated" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "PUT",
        })
      );
    });

    it("should handle DELETE requests", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 204,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      class TestRepository extends Restify {
        @DELETE("/users/:id")
        deleteUser(@Path("id") _id: number) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.deleteUser(1);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("FormData support", () => {
    it("should handle FormData in POST request", async () => {
      const mockResponse = {
        json: () => Promise.resolve({ id: 1, success: true }),
        status: 201,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @POST("/upload")
        uploadFile(@Body() _data: FormData) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      const formData = new FormData();
      formData.append("file", "test.txt");
      formData.append("name", "Test File");

      await repo.uploadFile(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/upload",
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );

      // Should NOT set Content-Type header for FormData (browser handles it)
      const callOptions = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
      expect(callOptions.headers).not.toHaveProperty("Content-Type");
    });

    it("should handle FormData in PUT request", async () => {
      const mockResponse = {
        json: () => Promise.resolve({ id: 1, updated: true }),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @PUT("/files/:id")
        updateFile(@Path("id") _id: number, @Body() _data: FormData) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      const formData = new FormData();
      formData.append("file", "updated.txt");

      await repo.updateFile(123, formData);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/files/123",
        expect.objectContaining({
          method: "PUT",
          body: formData,
        })
      );
    });

    it("should handle regular JSON body when not FormData", async () => {
      const mockResponse = {
        json: () => Promise.resolve({ id: 1 }),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @POST("/users")
        createUser(@Body() _data: unknown) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.createUser({ name: "Test" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  describe("Complex scenarios", () => {
    it("should handle all parameter types together", async () => {
      const mockResponse = {
        json: () => Promise.resolve({}),
        status: 200,
        headers: new Map(),
      };
      
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      @Collection("/api")
      class TestRepository extends Restify {
        @POST("/users/:id/posts")
        createPost(
          @Path("id") _userId: number,
          @Query("draft") _draft: boolean,
          @Body() _data: unknown,
          @Header("X-Request-ID") _requestId: string
        ) {
          return {} as Promise<{ data: unknown }>;
        }
      }

      const repo = new TestRepository({
        baseURL: "https://api.example.com",
      });

      await repo.createPost(123, true, { title: "Test" }, "req-456");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/users/123/posts?draft=true",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "Test" }),
          headers: expect.objectContaining({
            "X-Request-ID": "req-456",
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });
});
