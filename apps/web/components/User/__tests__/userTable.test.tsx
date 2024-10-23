import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import UsersTable from "../UsersTable";
import { getUsers } from "@/components/User/service";
import { filterUsersByOrgId } from "@/utils/helpers";
import { AppContext } from "../../../app/AppState";
import '@testing-library/jest-dom';

// Mock the service and utility function
jest.mock('@/components/User/service', () => ({
  getUsers: jest.fn(),
}));

jest.mock('@/utils/helpers', () => ({
  filterUsersByOrgId: jest.fn(),
}));

// Mock user data
const mockUsersList = [
  {
    id: 1,
    firstName: 'Test',
    lastName: 'Internal',
    email: 'Test@example.com',
    user_role: [{ role: { name: 'System Admin' } }],
    orgUser: { id: 1, name: 'Test Organization' }
  },
  {
    id: 2,
    firstName: 'Test1',
    lastName: 'External',
    email: 'Test1@example.com',
    user_role: [{ role: { name: 'Researcher' } }],
    orgUser: { id: 2, name: 'Another Organization' }

  },
];

// Filtered internal and external users
const mockInternalUsers = [mockUsersList[0]];
const mockExternalUsers = [mockUsersList[1]];

// ensure mock filtering works as expected
(filterUsersByOrgId as jest.Mock).mockReturnValue({
  internalUsers: mockInternalUsers,
  iexternalUsers: mockExternalUsers,

})


// Mock context
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

describe('UsersTable Component', () => {
  const orgUser = { id: 1, name: 'Test Organization' };
  const roles = [
    {
      id: 1,
      name: 'System Admin',
      type: 'Admin',
      priority: 1,
    },
  ];

  const setInternalCount = jest.fn();
  const setExternalCount = jest.fn();
  const setTableData = jest.fn();

  // Clear mocks and mock API responses before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (getUsers as jest.Mock).mockResolvedValue(mockUsersList);
    (filterUsersByOrgId as jest.Mock).mockReturnValue({
      internalUsers: mockInternalUsers,
      externalUsers: mockExternalUsers,
    });
  });

  // Function to render the UsersTable component
  const renderComponent = async () => {
    await act(async () => {
      render(
        <AppContext.Provider value={mockContext}>
          <UsersTable
            orgUser={orgUser}
            roles={roles}
            roleType="admin"
            type="Internal"
            setInternalCount={setInternalCount}
            setExternalCount={setExternalCount}
          />
        </AppContext.Provider>
      );
    });
  };

  // Test case: Render component and verify loading state
  test('should render the loading indicator initially', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  // Test case: Render component and check number of rows in the UserTable
  test('renders correct number of rows in the UserTable', async () => {
    await act(async () => {
      renderComponent();
    });
    await waitFor(() => {
      // get all the rows
      const rows: HTMLElement[] = screen.getAllByRole("row");
      // ensure rows have been rendered greater than 0
      expect(rows?.length).toBeGreaterThan(0);
    });
  });

  // Test case: Render component and check if table data is displayed
  test('should render table data after loading', async () => {
    await renderComponent();
    await waitFor(() => {
      const emailCell = screen.getByText('Test@example.com');
      expect(emailCell).toBeInTheDocument();
    });
  });

  // Test case: Add New User button should open the popup
  test('should display Add New User popup when button is clicked', async () => {
    await renderComponent();
    const addButton = screen.getByText("Add New User");
    await act(async () => {
      fireEvent.click(addButton);
    });
    await waitFor(() => {
      expect(screen.getByText("New User")).toBeInTheDocument();
    });
  });

  // Test case: Edit User button should open the edit popup
  test('should display edit user popup when edit button is clicked', async () => {
    await renderComponent();
    await waitFor(async () => {
      const editButton = screen.getAllByAltText('Edit')[0];
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });
    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    })
  });

  // Test case: Reset Password button should open the reset password popup
  test('should display reset password popup when reset button is clicked', async () => {
    await renderComponent();
    await waitFor(async () => {
      const resetButton = screen.getAllByAltText('Reset')[0];
      expect(resetButton).toBeInTheDocument();
      fireEvent.click(resetButton);
    });
  });

  // Test case: Test update user count in the app context
  test.skip('should update user count in the app context', async () => {
    await renderComponent();
    // spy on addtostore
    const spy = jest.spyOn(mockContext, 'addToState');
    await waitFor(() => {
      expect(spy).toHaveBeenCalled(); // check if addtostate was called
      const firstCall = spy.mock.calls[0]; // check if first call exists
      expect(firstCall).toBeDefined(); // Ensire it's defined
      const [firstCallArgs] = firstCall; // get the arguments of the call
      expect(firstCallArgs).toEqual({
        ...mockContext.state.appContext,
        userCount: {
          internalUsers: mockInternalUsers.length,
          externalUsers: mockExternalUsers.length,
        },
      });
    });
  });

  // Test case: Test fetchAndFilterData function and setTableData
  test.skip('should fetch data, filter it, and call setTableData with filtered results', async () => {
    await renderComponent();
    const spy = jest.spyOn({ setTableData }, 'setTableData');
    await waitFor(() => {
      expect(spy).toHaveBeenCalled(); // check if setTableData was called
      const [firstCallArgs] = spy.mock.calls[0];
      expect(firstCallArgs).toEqual(mockInternalUsers); // check the expected arguments fetch data
    });
  });

});