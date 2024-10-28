/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import LibraryDetails from '../LibraryDetails';
import { getLibraries } from '@/components/Libraries/libraryService';
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
    editLibrary: jest.fn(),
}));

const actionsEnabled = ['create_molecule', 'create_library', 'edit_library'];

const data = {
    id: 1,
    name: 'Proj2',
    target: null,
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    createdAt: '2024-10-17T08:18:35.505Z',
    updatedAt: '2024-10-17T08:18:35.505Z',
    ownerId: 1,
    updatedById: 1,
    owner: {
        id: 1,
        firstName: 'System',
        lastName: 'Admin',
        email: 'sys_admin@external.milliporesigma.com'
    },
    library: { name: 'fauxbio' },
    libraries: [
        {
            id: 1,
            name: 'EGFR-v1',
            description: 'Smaple data',
            target: 'Target',
            projectId: 2,
            createdAt: '2024-10-17T09:53:33.045Z',
            updatedAt: null,
            ownerId: 7,
            updatedById: null,
            owner: {
                id: 1,
                firstName: 'System',
                lastName: 'Admin',
                email: 'sys_admin@external.milliporesigma.com'
            },
            updatedBy: null
        },
        {
            id: 2,
            name: 'Lib3',
            description: 'Smaple data',
            target: 'Target',
            projectId: 2,
            createdAt: '2024-10-17T09:53:33.070Z',
            updatedAt: null,
            ownerId: 7,
            updatedById: null,
            owner: {
                id: 1,
                firstName: 'System',
                lastName: 'Admin',
                email: 'sys_admin@external.milliporesigma.com'
            },
            updatedBy: null
        }
    ]
};

const userData = {
    id: 1,
    organizationId: 1,
    email: "forum.tanna@external.milliporesigma.com",
    firstName: "Forum",
    lastName: "Tanna",
    myRoles: ['admin'],
    roles: [{ id: 1, type: 'admin' }],
    orgUser: {
        id: 1, name: 'System Admin', firstName: "Forum",
        lastName: "Tanna",
        email: "forum.tanna@external.milliporesigma.com",
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
            createdBy: 1,
            createdAt: '2024-08-05T15:44:09.158Z',
            updatedAt: '2024-08-05T15:44:09.158Z',
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

describe('LibraryList should display proper data', () => {
    let backMock;

    beforeEach(() => {
        backMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            back: backMock,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test.skip('shows loader initially', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        await act(async () => {
            render(<LibraryDetails userData={userData} actionsEnabled={actionsEnabled} />);
        });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test.skip('renders the DataGrid with correct data', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        (getLibraries as jest.Mock).mockResolvedValue(data);
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

    test.skip(`expand button works correctly and lists  
        the accordion with project and library data`, async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        (getLibraries as jest.Mock).mockResolvedValue(data);

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

    test.skip('library accordion loads with proper data', async () => {

        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        (getLibraries as jest.Mock).mockResolvedValue(data);
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

    test.skip('edit library button works as expected', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(() => { (getLibraries as jest.Mock).mockResolvedValue(data) });
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
});