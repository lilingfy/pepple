import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GET as relationsGet,
  POST as relationsPost,
} from "@/app/api/relations/route";
import {
  GET as relationIdGet,
  PATCH as relationIdPatch,
  DELETE as relationIdDelete,
} from "@/app/api/relations/[id]/route";
import { NextRequest } from "next/server";
import { UnauthenticatedError } from "@/lib/auth/errors";

// Mock the current-user module to simulate unauthenticated state
vi.mock("@/app/api/relations/_lib/current-user", () => ({
  getCurrentRelationUserId: vi.fn(),
}));

import { getCurrentRelationUserId } from "@/app/api/relations/_lib/current-user";

const mockGetCurrentRelationUserId = getCurrentRelationUserId as ReturnType<
  typeof vi.fn
>;

describe("Auth Placeholder - API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/relations", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetCurrentRelationUserId.mockRejectedValue(
        new UnauthenticatedError("未登录"),
      );

      const res = await relationsGet();
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/relations", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetCurrentRelationUserId.mockRejectedValue(
        new UnauthenticatedError("未登录"),
      );

      const req = new NextRequest("http://localhost/api/relations", {
        method: "POST",
        body: JSON.stringify({ name: "Test Relation" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await relationsPost(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/relations/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetCurrentRelationUserId.mockRejectedValue(
        new UnauthenticatedError("未登录"),
      );

      const req = new NextRequest("http://localhost/api/relations/123");
      const res = await relationIdGet(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("PATCH /api/relations/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetCurrentRelationUserId.mockRejectedValue(
        new UnauthenticatedError("未登录"),
      );

      const req = new NextRequest("http://localhost/api/relations/123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await relationIdPatch(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("DELETE /api/relations/[id]", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetCurrentRelationUserId.mockRejectedValue(
        new UnauthenticatedError("未登录"),
      );

      const req = new NextRequest("http://localhost/api/relations/123", {
        method: "DELETE",
      });

      const res = await relationIdDelete(req, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });
});
