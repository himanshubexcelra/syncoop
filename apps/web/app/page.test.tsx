// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
    };
  },
}));

describe("Login", () => {
  test("renders the page with the correct elements", () => { });
});
