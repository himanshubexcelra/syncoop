import { render, screen } from "@testing-library/react";
import Header from "./Header";
import { User, UserData } from "@/lib/definition";

// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
    };
  },
}));

const mockUserData: UserData = {
  id: 1,
  firstName: 'System',
  lastName: 'Admin',
  email: 'a@b.com',
  organization: {
    id: 1
  },
  organizationId: 1,
  orgUser: {} as User,
  user_role: [
    {
      role: {
        id: 1,
        name: 'System Admin',
        priority: 1,
        type: 'admin'
      }
    }
  ]
}

describe("Header Component", () => {
  beforeEach(() => {
    render(<Header userData={mockUserData} />);
  });

  test.skip("renders the logo image", () => {
    const logoImage = screen.getByAltText("aidd icon");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/icons/aidd-icon-shell.svg");
  });
});
