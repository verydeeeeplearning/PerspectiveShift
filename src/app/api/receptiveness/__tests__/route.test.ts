import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/config/di-container", () => ({
  getContainer: vi.fn(),
}));

import { getContainer } from "@/infrastructure/config/di-container";
import { GET } from "../route";

const mockGetWithPercentile = vi.fn();

beforeEach(() => {
  vi.mocked(getContainer).mockReturnValue({
    updateReceptivenessUseCase: { getWithPercentile: mockGetWithPercentile },
  } as never);
  mockGetWithPercentile.mockReset();
});

describe("GET /api/receptiveness", () => {
  it("returns 400 when userId is missing", async () => {
    const req = new Request("http://localhost/api/receptiveness");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("userId is required");
  });

  it("returns receptiveness data on success", async () => {
    const result = {
      userId: "user-1",
      totalPoints: 15,
      templateAdoptions: 3,
      feelHeardReceived: 2,
      percentile: 72,
    };
    mockGetWithPercentile.mockResolvedValue(result);

    const req = new Request("http://localhost/api/receptiveness?userId=user-1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(result);
    expect(mockGetWithPercentile).toHaveBeenCalledWith("user-1");
  });
});
