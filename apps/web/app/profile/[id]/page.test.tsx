import { render, screen } from "@testing-library/react";
import Profile from "./page"; // adjust the path based on your file structure
import { getUserData } from "@/utils/auth";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";

jest.mock("@/components/Breadcrumbs/BreadCrumbs", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="breadcrumb">Mocked Breadcrumb</div>),
}));

jest.mock("@/components/Profile/ProfileInfo", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="profile-info">Mocked ProfileInfo</div>),
}));

jest.mock('@/utils/auth', () => ({
    getUserData: jest.fn(),
}));

jest.mock("@/components/layout", () => ({
    __esModule: true,
    default: jest.fn(({ children }) => <div data-testid="layout">{children}</div>),
}));

describe("Profile Page (with Params)", () => {
    const mockUserData = {
        id: 1,
        orgUser: { name: "Admin Name" },
        user_role: [{ role: { type: "admin" } }],
    };
    const breadcrumbMock = [
        {
            label: 'Home',
            svgPath: '/icons/home-icon.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/dashboard'
        },
        {
            label: `Admin:  ${mockUserData.orgUser.name}`,
            svgPath: "/icons/admin-inactive-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/dashboard",
        },
        {
            label: 'Profile',
            svgPath: '/icons/profile-icon-sm-active.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/profile',
            isActive: true
        }
    ];
    const params = { id: "2" };
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render breadcrumb, layout, and profile info when user data is available", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockUserData);

        const { container } = render(await Profile({ params }));

        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
        expect(screen.getByTestId("profile-info")).toBeInTheDocument();
        expect(container.firstChild).toMatchSnapshot();
    });

    it("should pass correct props to ProfileInfo component", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockUserData);

        render(await Profile({ params }));

        expect(ProfileInfo).toHaveBeenCalledWith(
            {
                id: Number(params.id),
                roleType: mockUserData.user_role[0].role.type,
                isMyProfile: false,
            },
            {}
        );
    });

    it("should pass correct breadcrumbs configuration", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockUserData);

        render(await Profile({ params }));

        expect(Breadcrumb).toHaveBeenCalledWith(
            {
                breadcrumbs: breadcrumbMock
            },
            {}
        );
    });
});
