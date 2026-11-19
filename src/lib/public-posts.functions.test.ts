import { afterEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("@/lib/supabase-public", () => ({ createPublicServerClient: createClient }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: (validate: (input: unknown) => unknown) => ({
      handler: (handler: (input: { data: unknown }) => unknown) =>
        (input: { data: unknown }) => handler({ data: validate(input.data) }),
    }),
  }),
}));

import { getHomeSectionPosts } from "./public-posts.functions";

afterEach(() => vi.restoreAllMocks());

function mockQuery(result: unknown) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  createClient.mockReturnValue({ from: vi.fn(() => query) });
  return query;
}

describe("homepage public news resilience", () => {
  it("returns an empty section for the reported 1016 origin error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery({ data: null, error: { message: "error code: 1016\n" } });
    await expect(getHomeSectionPosts({ data: { category: "video", limit: 24 } })).resolves.toEqual([]);
  });

  it("tolerates connection exceptions before a query is created", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createClient.mockImplementationOnce(() => { throw new Error("fetch failed"); });
    await expect(getHomeSectionPosts({ data: { category: "photo-gallery", limit: 12 } })).resolves.toEqual([]);
  });

  it("still returns real published news with the requested category and limit", async () => {
    const query = mockQuery({ data: [{ id: "post-1", title: "Published news", status: "published" }], error: null });
    const posts = await getHomeSectionPosts({ data: { category: "video", limit: 24 } });
    expect(posts[0]?.id).toBe("post-1");
    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(query.eq).toHaveBeenCalledWith("category", "video");
    expect(query.limit).toHaveBeenCalledWith(24);
  });
});