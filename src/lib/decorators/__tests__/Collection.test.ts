import { describe, it, expect } from "vitest";
import "reflect-metadata";
import { Collection } from "../Collection.ts";
import { METADATA_KEYS } from "../../constants.ts";

describe("@Collection decorator", () => {
  it("should set collection metadata on class", () => {
    @Collection("/api/users")
    class TestRepository {}

    const metadata = Reflect.getMetadata(
      METADATA_KEYS.COLLECTION,
      TestRepository
    );

    expect(metadata).toEqual({ basePath: "/api/users" });
  });

  it("should work with empty path", () => {
    @Collection("")
    class TestRepository {}

    const metadata = Reflect.getMetadata(
      METADATA_KEYS.COLLECTION,
      TestRepository
    );

    expect(metadata).toEqual({ basePath: "" });
  });

  it("should work with root path", () => {
    @Collection("/")
    class TestRepository {}

    const metadata = Reflect.getMetadata(
      METADATA_KEYS.COLLECTION,
      TestRepository
    );

    expect(metadata).toEqual({ basePath: "/" });
  });

  it("should work with nested paths", () => {
    @Collection("/api/v1/users")
    class TestRepository {}

    const metadata = Reflect.getMetadata(
      METADATA_KEYS.COLLECTION,
      TestRepository
    );

    expect(metadata).toEqual({ basePath: "/api/v1/users" });
  });
});
