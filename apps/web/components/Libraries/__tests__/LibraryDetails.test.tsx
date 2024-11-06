/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import LibraryDetails from '../LibraryDetails';
import {
    getLibraries,
    getLibraryById,
    addToFavourites
} from '@/components/Libraries/libraryService';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
// import CreateLibrary from '../CreateLibrary';

jest.mock("@/components/Breadcrumbs/BreadCrumbs", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="breadcrumb">Mocked Breadcrumb</div>),
}));

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
    useParams: jest.fn(),
    useRouter: jest.fn(),
}));

jest.mock('@/components/Libraries/libraryService', () => ({
    getLibraries: jest.fn(),
    getLibraryById: jest.fn(),
    editLieditLibrary: jest.fn(),
    addToFavourites: jest.fn(),
}));

const actionsEnabled = ['create_molecule', 'create_library', 'edit_library'];

const data = {
    id: 1,
    name: 'Proj2',
    target: null,
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    created_at: '2024-10-17T08:18:35.505Z',
    updated_at: '2024-10-17T08:18:35.505Z',
    ownerId: 1,
    updated_by: 1,
    owner: {
        id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email_id: 'sys_admin@external.milliporesigma.com'
    },
    library: { name: 'fauxbio' },
    libraries: [
        {
            id: 1,
            name: 'EGFR-v1',
            description: 'Smaple data',
            target: 'Target',
            project_id: 2,
            created_at: '2024-10-17T09:53:33.045Z',
            updated_at: null,
            ownerId: 7,
            updated_by: null,
            owner: {
                id: 1,
                first_name: 'System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com'
            },
            updated_by: null,
            molecule: [{
                id: 1,
                molecular_weight: 12,
                userId: 1,
                library_id: 2,
            }],
        },
        {
            id: 2,
            name: 'Lib3',
            description: 'Smaple data',
            target: 'Target',
            project_id: 2,
            created_at: '2024-10-17T09:53:33.070Z',
            updated_at: null,
            ownerId: 7,
            updated_by: null,
            owner: {
                id: 1,
                first_name: 'System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com'
            },
            updated_by: null,
            molecule: [{
                id: 1,
                molecular_weight: 12,
                userId: 1,
                library_id: 2,
            }],
        }
    ]
};

const libraryData = {
    id: 2,
    name: 'EGFR-v1',
    description: 'Smaple data',
    target: 'Target',
    project_id: 2,
    created_at: '2024-10-17T09:53:33.045Z',
    updated_at: null,
    ownerId: 7,
    updated_by: null,
    owner: {
        id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email_id: 'sys_admin@external.milliporesigma.com'
    },
    molecule: [],
    updated_by: null
}

const libraryData1 = {
    id: 2,
    name: 'EGFR-v1',
    description: 'Smaple data',
    target: 'Target',
    project_id: 2,
    created_at: '2024-10-17T09:53:33.045Z',
    updated_at: null,
    ownerId: 7,
    updated_by: null,
    owner: {
        id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email_id: 'sys_admin@external.milliporesigma.com'
    },
    molecule: [{
        id: 1,
        molecular_weight: 12,
        userId: 1,
        library_id: 2,
        molecule_favorites: [],
    }],
    updated_by: null
}

const userData = {
    id: 1,
    organization_id: 1,
    email_id: "forum.tanna@external.milliporesigma.com",
    first_name: "Forum",
    last_name: "Tanna",
    myRoles: ['admin'],
    roles: [{ id: 1, type: 'admin' }],
    orgUser: {
        id: 1, name: 'System Admin', first_name: "Forum",
        last_name: "Tanna",
        email_id: "forum.tanna@external.milliporesigma.com",
        status: "active",
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            },
            roleId: 1
        }],
        organization: {
            id: 1,
            name: 'Merck',
            description: 'Merck Corporation',
            logo: 'logo.jpg',
            created_by: 1,
            created_at: '2024-08-05T15:44:09.158Z',
            updated_at: '2024-08-05T15:44:09.158Z',
            status: 'active',
            user_role: [{
                role: {
                    id: 6,
                    priority: 1,
                    type: "admin",
                    number: 1,
                    name: "admin"
                },
                roleId: 1
            }]
        }
    },
    user_role: [{
        role: {
            id: 6,
            priority: 1,
            type: "admin",
            number: 1,
            name: "admin"
        },
        roleId: 1
    }],
}

describe('LibraryList should display loader initially', () => {
    let backMock;

    beforeEach(() => {
        backMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            back: backMock,
        });
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('shows loader initially', async () => {
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
});

describe('LibraryList should display proper data', () => {
    let backMock;

    beforeEach(() => {
        backMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            back: backMock,
        });
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        (getLibraries as jest.Mock).mockResolvedValue(data);
        (getLibraryById as jest.Mock).mockResolvedValue(libraryData);
        (addToFavourites as jest.Mock).mockResolvedValue({ id: 19, molecule_id: 1, userId: 1 });
        
    });

    test('renders the DataGrid with correct data', async () => {
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Structure')).toBeInTheDocument();
        expect(screen.getByText('Molecule ID')).toBeInTheDocument();
        expect(screen.getByAltText('showDetailedView')).toBeInTheDocument();
    });

    test(`expand button works correctly and lists
        the accordion with project and library data`, async () => {
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        expect(screen.getByAltText('showDetailedView')).toBeInTheDocument();

        const expandButton = screen.getByAltText('showDetailedView');
        await fireEvent.click(expandButton);
        expect(screen.getAllByRole('tab')).toHaveLength(2);
    });

    test('library accordion loads with proper data', async () => {
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });


        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        expect(screen.getByAltText('showDetailedView')).toBeInTheDocument();

        const expandButton = screen.getByAltText('showDetailedView');
        await fireEvent.click(expandButton);

        const tabs = screen.getAllByRole('tab');
        await act(async () => { fireEvent.click(tabs[tabs.length - 1]) });

        const addLibraryButton = screen.getByText('Add Library');
        expect(addLibraryButton).toBeInTheDocument();

        const moreButton = screen.getAllByAltText('more button');

        await act(async () => { moreButton[0].click() });
        await waitFor(async () => {
            const editLibraryButton = screen.getByText('Edit');
            expect(editLibraryButton).toBeInTheDocument();
        });

        const editLibraryButton = screen.getByText('Edit'); // It should be present now
        await act(() => editLibraryButton.click());

        await waitFor(() => {
            const inputField = screen.getByPlaceholderText('New Library');
            expect(inputField).toBeInTheDocument();
            const discardButton = screen.getAllByText('Discard');
            act(() => fireEvent.click(discardButton[0]));
        });
    });

    test('edit library button works as expected', async () => {
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        expect(screen.getByAltText('showDetailedView')).toBeInTheDocument();

        const expandButton = screen.getByAltText('showDetailedView');
        await fireEvent.click(expandButton);

        const tabs = screen.getAllByRole('tab');
        await act(async () => { fireEvent.click(tabs[tabs.length - 1]) });

        const addLibraryButton = screen.getByText('Add Library');
        expect(addLibraryButton).toBeInTheDocument();
        const moreButton = screen.getAllByAltText('more button');

        await act(() => moreButton[0].click());
        await waitFor(async () => {
            const editLibraryButton = screen.getByText('Edit');
            expect(editLibraryButton).toBeInTheDocument();
        });

        const editLibraryButton = screen.getByText('Edit'); // It should be present now
        await act(async () => { editLibraryButton.click() });
    });

    test('open library button works as expected', async () => {
        const pushMock = jest.fn(); // Mock function for router.push
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        expect(screen.getByAltText('showDetailedView')).toBeInTheDocument();

        const expandButton = screen.getByAltText('showDetailedView');
        await fireEvent.click(expandButton);

        const tabs = screen.getAllByRole('tab');
        await act(async () => { fireEvent.click(tabs[tabs.length - 1]) });


        const openButton = screen.getAllByText('Open');

        await act(() => openButton[0].click());
        await waitFor(() => {
            const tabs = screen.queryAllByRole('tab');
            expect(tabs).toHaveLength(0);
        });
    });

    test('Add to favourite column works as expected', async () => {
        (getLibraryById as jest.Mock).mockResolvedValue(libraryData1);
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        const favouriteColumn = screen.getAllByAltText('favourite');

        await act(async () => {
            fireEvent.click(favouriteColumn[0]); // Click the first button
        });
        expect(addToFavourites).toHaveBeenCalledTimes(1);
    });
});