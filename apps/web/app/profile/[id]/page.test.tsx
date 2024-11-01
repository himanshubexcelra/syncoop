import { render, screen } from "@testing-library/react";
import Profile from "./page";
import { getUserData } from "@/utils/auth";
import ProfileInfo from "@/components/Profile/ProfileInfo";

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
            orgUser: { id: 1, name: "FauxBio" },
            myRoles: ['admin']
        },
        actionsEnabled: ['edit_user'],
        isMyProfile: true,
    };

    const params = { id: "2" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip("should render layout and profile info when user data is available", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockSessionData);

        expect(screen.getByTestId("layout")).toBeInTheDocument();
        expect(screen.getByTestId("profile-info")).toBeInTheDocument();
    });

    it("should pass correct props to ProfileInfo component", async () => {
        (getUserData as jest.Mock).mockResolvedValue(mockSessionData);

        render(await Profile({ params }));

        expect(ProfileInfo).toHaveBeenCalledWith({
            id: 2,
            myRoles: mockSessionData.userData.myRoles,
            isMyProfile: false,
            actionsEnabled: mockSessionData.actionsEnabled,
            orgDetailLoggedIn: mockSessionData.userData.orgUser
        }, {});
    });

});