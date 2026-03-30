import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock next/server
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: "next" })),
      redirect: vi.fn((url: URL) => ({
        type: "redirect",
        url: url.toString(),
      })),
    },
  };
});

// Import middleware after mocking
const { middleware } = await import("@/middleware");

describe("Auth Placeholder - Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(
    pathname: string,
    cookies: Record<string, string> = {},
  ): NextRequest {
    const url = new URL(`http://localhost${pathname}`);
    return {
      nextUrl: url,
      url: url.toString(),
      cookies: {
        has: (name: string) => name in cookies,
        get: (name: string) =>
          cookies[name] ? { value: cookies[name] } : undefined,
      },
    } as unknown as NextRequest;
  }

  describe("Protected routes (/me/*)", () => {
    it("redirects to /login when pebble_auth cookie is missing", async () => {
      const request = createRequest("/me");
      const response = await middleware(request);

      expect(response.type).toBe("redirect");
      expect(response.url).toContain("/login");
      expect(response.url).toContain("redirect=%2Fme");
    });

    it("redirects to /login with redirect param for nested /me routes", async () => {
      const request = createRequest("/me/relations");
      const response = await middleware(request);

      expect(response.type).toBe("redirect");
      expect(response.url).toContain("/login");
      expect(response.url).toContain("redirect=%2Fme%2Frelations");
    });

    it("allows access when pebble_auth cookie is present", async () => {
      const request = createRequest("/me", { pebble_auth: "1" });
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });

    it("allows access to nested /me routes when authenticated", async () => {
      const request = createRequest("/me/relations", { pebble_auth: "1" });
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });
  });

  describe("Public routes", () => {
    it("allows access to / without auth cookie", async () => {
      const request = createRequest("/");
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });

    it("allows access to /translator without auth cookie", async () => {
      const request = createRequest("/translator");
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });

    it("allows access to /dojo without auth cookie", async () => {
      const request = createRequest("/dojo");
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });

    it("allows access to /breathing without auth cookie", async () => {
      const request = createRequest("/breathing");
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });

    it("allows access to /login without auth cookie", async () => {
      const request = createRequest("/login");
      const response = await middleware(request);

      expect(response.type).toBe("next");
    });
  });
});
