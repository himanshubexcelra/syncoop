/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import UsersTable from "../UsersTable";
import { getUsers } from "@/components/User/service";
import { filterUsersByOrgId } from "@/utils/helpers";
import { AppContext } from "../../../app/AppState";
import DataGrid, { Column } from "devextreme-react/cjs/data-grid";

jest.mock("@/components/User/service");
jest.mock("@/utils/helpers");

const mockContext = {
  state: {
    appContext: {
      userCount: {
        internalUsers: 0,
        externalUsers: 0,
      },
    },
  },
  addToState: jest.fn(),
};

const mockUsersList = [
  {
    id: 1,
    firstName: "Test",
    lastName: "Internal",
    email: "Test@example.com",
    user_role: [{ role: { name: "System Admin" } }],
  },
  {
    id: 2,
    firstName: "Test1",
    lastName: "External",
    email: "Test1@example.com",
    user_role: [{ role: { name: "Researcher" } }],
  },
];

const mockInternalUsers = [mockUsersList[0]];
const mockExternalUsers = [mockUsersList[1]];

describe("UsersTable Component", () => {
  const orgUser = { id: 1, name: "Test Organization" };
  const roles = [
    {
      id: 1,
      name: "System Admin",
      type: "Admin",
      priority: 1,
    },
  ];
  const setInternalCount = jest.fn();
  const setExternalCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getUsers as jest.Mock).mockResolvedValue(mockUsersList);
    (filterUsersByOrgId as jest.Mock).mockReturnValue({
      internalUsers: mockInternalUsers,
      externalUsers: mockExternalUsers,
    });
  });

  const renderComponent = async () => {
    await act(async () => {
      render(
        <AppContext.Provider value={mockContext}>
          <UsersTable
            orgUser={orgUser}
            roles={roles}
            roleType="admin"
            type="Internal"
            setInternalCount={jest.fn()}
            setExternalCount={jest.fn()}
          />
        </AppContext.Provider>
      );
    });
  };

  test("renders loader initially", async () => {
    await act(async () => {
      renderComponent();
    });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  test("renders correct number of rows in the UserTable", async () => {
    await act(async () => {
      renderComponent();
    });

    // wait for table to rendered
    await waitFor(() => {
      // get all the rows
      const rows: any = screen.getAllByRole("row");
      expect(rows?.length).toBeGreaterThan(0);
    });
  });

  test.skip("fetches users and updates the context with user counts", async () => {
    renderComponent();

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalledWith(["orgUser", "user_role"]);
    });

    await waitFor(() => {
      expect(filterUsersByOrgId).toHaveBeenCalledWith(
        mockUsersList,
        orgUser.id
      );
      expect(setInternalCount).toHaveBeenCalledWith(mockInternalUsers.length);
      expect(setExternalCount).toHaveBeenCalledWith(mockExternalUsers.length);
    });

    await waitFor(() => {
      expect(mockContext.addToState).toHaveBeenCalledWith({
        ...mockContext.state,
        userCount: {
          internalUsers: mockInternalUsers.length,
          externalUsers: mockExternalUsers.length,
        },
      });
    });
  });

  test.skip("renders the data grid with users", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText("firstName")).toBeInTheDocument();
      expect(screen.getByText("lastName")).toBeInTheDocument();
    });
  });

  test.skip('displays the create popup when "Add New User" button is clicked', async () => {
    renderComponent();

    const addButton = screen.getByText("Add New User");
    fireEvent.click(addButton);

    expect(screen.getByRole("dialog", { name: /New User/i })).toBeVisible();
  });

  test.skip("shows and hides the edit popup on action", async () => {
    renderComponent();

    const editIcons = screen.getAllByAltText("Edit");
    fireEvent.click(editIcons[0]);

    expect(screen.getByRole("dialog", { name: /Edit/i })).toBeVisible();

    const closeButton = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Edit/i })).not.toBeVisible();
    });
  });
});
