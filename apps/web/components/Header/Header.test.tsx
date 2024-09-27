import { render, screen } from "@testing-library/react";
import Header from "./Header";

// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
    };
  },
}));

describe("Header Component", () => {
  beforeEach(() => {
    render(<Header />);
  });

  test("renders the logo image", () => {
    const logoImage = screen.getByAltText("aidd icon");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/icons/aidd-icon-shell.svg");
  });
});
