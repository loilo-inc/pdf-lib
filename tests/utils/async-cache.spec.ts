import { describe, expect, it } from "vitest";
import { AsyncCache } from "../../src/utils/async-cache";

describe("AsyncCache", () => {
  it("can be constructed using populatedBy", () => {
    const cache = AsyncCache.populatedBy(() => Promise.resolve(42));
    expect(cache).toBeInstanceOf(AsyncCache);
  });

  it("returns undefined for getValue before access", () => {
    const cache = AsyncCache.populatedBy(() => Promise.resolve(42));
    expect(cache.getValue()).toBeUndefined();
  });

  it("can access and return the populated value", async () => {
    const cache = AsyncCache.populatedBy(() => Promise.resolve(42));
    const value = await cache.access();
    expect(value).toBe(42);
  });

  it("returns cached value on subsequent access", async () => {
    let callCount = 0;
    const cache = AsyncCache.populatedBy(async () => {
      callCount++;
      return 42;
    });

    await cache.access();
    await cache.access();

    expect(callCount).toBe(1);
  });

  it("getValue returns the value after access", async () => {
    const cache = AsyncCache.populatedBy(() => Promise.resolve(42));
    await cache.access();
    expect(cache.getValue()).toBe(42);
  });

  it("can invalidate the cache", async () => {
    let callCount = 0;
    const cache = AsyncCache.populatedBy(async () => {
      callCount++;
      return 42;
    });

    await cache.access();
    cache.invalidate();
    await cache.access();

    expect(callCount).toBe(2);
    expect(cache.getValue()).toBe(42);
  });

  it("handles multiple concurrent access calls", async () => {
    let callCount = 0;
    const cache = AsyncCache.populatedBy(async () => {
      callCount++;
      return 42;
    });

    const [val1, val2] = await Promise.all([cache.access(), cache.access()]);

    expect(val1).toBe(42);
    expect(val2).toBe(42);
    expect(callCount).toBe(1);
  });

  it("works with different value types", async () => {
    const cache = AsyncCache.populatedBy(() =>
      Promise.resolve({ key: "value" }),
    );
    const value = await cache.access();
    expect(value).toEqual({ key: "value" });
  });
});
