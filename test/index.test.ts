import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "bun:test";
import { useLocalStorageReducer } from "../src/";

describe("should", () => {
  it("example", () => {
    const { result } = renderHook(() =>
      useLocalStorageReducer("key", (state, action) => state, 0),
    );
    expect(result.current[0]).toBe(0);
  });
});
