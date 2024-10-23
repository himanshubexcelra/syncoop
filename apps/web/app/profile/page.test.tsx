import { render, screen } from "@testing-library/react";
import Profile from "./page";
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

describe("Profile Page", () => {
    const mockSessionData = {
        userData: {
            id: 1,
            user_role: [{ role: { type: "admin" } }],
            myRoles: ['admin']
        }
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
            label: 'Profile',
            svgPath: '/icons/profile-icon-sm-active.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/profile',
            isActive: true
        }
    ]
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render breadcrumb, layout, and profile info when user data is available", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockSessionData.userData);

        const { container } = render(await Profile());

        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
        expect(screen.getByTestId("profile-info")).toBeInTheDocument();
        expect(container.firstChild).toMatchSnapshot();
    });

    fit("should pass props to ProfileInfo ", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockSessionData);

        render(await Profile());

        expect(ProfileInfo).toHaveBeenCalledWith(
            {
                id: mockSessionData.userData.id,
                myRoles: ['admin'],
                isMyProfile: true,
            },
            {}
        );
    });

    it("should pass breadcrumbs configuration", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockSessionData.userData);

        render(await Profile());

        expect(Breadcrumb).toHaveBeenCalledWith(
            {
                breadcrumbs: breadcrumbMock
            },
            {}
        );
    });
});