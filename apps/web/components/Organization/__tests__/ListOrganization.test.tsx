import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ListOrganization from "../ListOrganization";
import { AppContext } from "../../../app/AppState";
import { getOrganization } from "@/components/Organization/service";

jest.mock("@/components/Organization/service", () => ({
    getOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

const mockUserData = {
    "id": 1,
    "first_name": "System",
    "last_name": "Admin",
    "email_id": "sys_admin@external.milliporesigma.com",
    "roles": [
        {
            "id": 1,
            "type": "admin"
        }
    ],
    "myRoles": [
        "admin"
    ],
    "organization_id": "1",
    "orgUser": {
        "id": "1",
        "name": "EMD DD",
        "type": "O"
    }
};

const mockActionsEnabled = ["edit_own_org", "delete_own_org"];

const mockOrganizations = [
    {
        id: "1",
        name: "Test Organization",
        _count: {
            other_container: 5,
            organizationMolecules: 10,
        },
        orgUser: [{ id: 1, name: 'User 1' }],
        owner: { email_id: "admin@test.com" },
        is_active: true,
        created_at: "2025-01-01T00:00:00.000Z",
        updated_at: "2025-01-10T00:00:00.000Z",
    },
];

describe("ListOrganization Component", () => {
    const mockContextValue = {
        state: { userCount: 5 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getOrganization as jest.Mock).mockResolvedValue(mockOrganizations);
    });

    it.skip("renders the component", async () => {
        render(
            <AppContext.Provider value={mockContextValue}>
                <ListOrganization userData={mockUserData} actionsEnabled={['edit_own_org']} />
            </AppContext.Provider>
        );
        await waitFor(() => {
            expect(screen.getByText("Test Organization")).toBeInTheDocument();
        });
    });

    it("calls fetchOrganizations on load", async () => {
        render(
            <AppContext.Provider value={mockContextValue}>
                <ListOrganization userData={mockUserData} actionsEnabled={mockActionsEnabled} />
            </AppContext.Provider>
        );

        await waitFor(() => {
            expect(getOrganization).toHaveBeenCalledTimes(1); // Expect a single call now
        });
    });


    it("shows the edit popup when edit button is clicked", async () => {
        render(
            <AppContext.Provider value={mockContextValue}>
                <ListOrganization userData={mockUserData} actionsEnabled={mockActionsEnabled} />
            </AppContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByText("Test Organization")).toBeInTheDocument();
        });

        const editButton = screen.getAllByAltText("Edit Organization")[0];
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByText(/edit test organization/i)).toBeInTheDocument();
        });
    });



});
