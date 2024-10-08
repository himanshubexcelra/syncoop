import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ListOrganization from "@/components/Organization/ListOrganization";
import { getUsers } from '@/components/User/service';

jest.mock('@/components/User/service', () => ({
  getUsers: jest.fn(),
}));

const data = [
  {
    name: 'Fauxbio',
    user: {
      email: 'max.harrison@fauxbio.com',
    },
    status: 'Active',
    projects: 3,
    molecules: 240,
    users: 200,
    id: 12345,
    creationDate: '2024-08-01',
    lastModifiedDate: '2024-08-01',
  },
  {
    name: 'BioQuest',
    user: {
      email: 'elena.garcia@bioquest.com',
    },
    status: 'Active',
    projects: 3,
    molecules: 240,
    users: 200,
    id: 12345,
    creationDate: '2024-08-05',
    lastModifiedDate: '2024-08-01',
  }
];

const testUser = {
  email: "forum.tanna@external.milliporesigma.com", firstName: "Forum", lastName: "Tanna", user_role: [{ role: { type: "admin" } }]
}

const users = [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'jogn@external.millipore.com' }];
const roles = [1];

describe('OrganizationList should display proper data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  test.skip('renders the DataGrid with correct data', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(data),
    });
    (getUsers as jest.Mock).mockResolvedValue(users);


    // Wrap the render and any state updates in act
    await act(async () => {
      render(<ListOrganization data={data} roles={roles} />);
    });

    expect(screen.getByText('Organization Name')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Molecules')).toBeInTheDocument();
    expect(screen.getByText('Organization Status')).toBeInTheDocument();
    expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    expect(screen.getByText('Creation Date')).toBeInTheDocument();
    expect(screen.getByText('Last Modified Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    expect(screen.getByText('BioQuest')).toBeInTheDocument();
    expect(screen.getByText('elena.garcia@bioquest.com')).toBeInTheDocument();
  });

  test.skip('searches the data correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(data),
    });
    (getUsers as jest.Mock).mockResolvedValue(users);


    await act(async () => {
      render(<ListOrganization data={data} roles={roles} />);
    });

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'BioQuest' } });

    expect(screen.getByText('BioQuest')).toBeInTheDocument();
    expect(screen.queryByText('NonExistent')).not.toBeInTheDocument();
  });

  test.skip('sorts the data by creationDate', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(data),
    });
    (getUsers as jest.Mock).mockResolvedValue(users);

    await act(async () => {
      render(<ListOrganization data={data} />);
    });
    const creationDateHeader = screen.getByText('Creation Date');
    fireEvent.click(creationDateHeader);
  });
});


describe('Create and Edit buttons should work properly', () => {

  test.skip('opens create form when Create Organization button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(data),
    });
    (getUsers as jest.Mock).mockResolvedValue(users);


    await act(async () => {
      render(<ListOrganization userData={testUser} />);
    });

    const createButton = screen.getByText('Create Organization');
    await act(async () => {
      createButton.click();
    });

    await waitFor(() => {
      const inputField = screen.getByPlaceholderText('Enter new organization name');
      expect(inputField).toBeInTheDocument();
    });
  });
});