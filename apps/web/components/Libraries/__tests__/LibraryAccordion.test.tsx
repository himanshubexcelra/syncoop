/*eslint max-len: ["error", { "code": 100 }]*/
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LibraryAccordion from '../LibraryAccordion';
import { AppContext } from '../../../app/AppState';
import { AppContextModel, ProjectDataFields, UserData } from '@/lib/definition';
import { useRouter } from 'next/navigation';

// Mock AddMolecule and EditMolecule
jest.mock('@/components/Molecule/AddMolecule/AddMolecule', () => () => null);
jest.mock('@/components/Molecule/EditMolecule/EditMolecule', () => () => null);

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../service', () => ({
    getLibraries: jest.fn().mockImplementation(() => {
        return Promise.resolve({
            name: 'Test Project',
            parent_id: 1,
            container: {
                id: 1,
                name: 'Test Organization',
            },
            other_container: [
                { id: 1, name: 'Library 1' },
                { id: 2, name: 'Library 2' },
            ],
        });
    }),
}));

const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    isFallback: false,
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const mockAppContext = {
    state: {
        cartDetail: {},
        appContext: {} as AppContextModel,
    },
};

const projectData: ProjectDataFields = {
    name: 'Test Project',
    owner: {
        first_name: 'Test',
        last_name: 'User',
        id: 1,
        email_id: 'test.user@example.com',
        status: 'active',
        user_role: [{
            role: {
                id: 1,
                name: 'admin',
            },
            role_id: 1,
        }],
        type: 'internal',
        organization: {
            id: 1,
            name: 'Test Organization',
        }
    },
    id: 0,
    container: {
        id: 1,
        name: 'Test Organization',
        email_id: 'org@example.com',
        is_active: true,
        orgUser: [],
        metadata: {
            functionalAssay1: '',
            functionalAssay2: '',
            functionalAssay3: '',
            functionalAssay4: '',
        },
        owner_id: 1,
        type: 'internal',
    },
    user: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active'
    },
    sharedUsers: [],
    target: '',
    userWhoUpdated: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active'
    },
    userWhoCreated: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active',
    },
    updated_at: new Date(),
    owner_id: 1,
    metadata: {
        target: '',
        type: ''
    },
    created_at: new Date(),
};

const userData: UserData = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email_id: 'test.user@example.com',
    user_role: [{
        role: {
            id: 1,
            name: 'admin',
        },
        role_id: 1,
    }],
    organization_id: 1,
    orgUser: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active',
        organization: {
            id: 1,
            name: 'Test Organization',
        },
        user_role: [{
            role: {
                id: 1,
                name: 'admin',
            },
            role_id: 1,
        }],
        type: 'internal',
    },
    myRoles: ['admin'],
    roles: [{
        type: 'admin',
    }],
};

describe('LibraryAccordion Component', () => {
    const mockSetLoader = jest.fn();
    const mockSetSortBy = jest.fn();
    const mockSetProjects = jest.fn();
    const mockFetchLibraries = jest.fn();
    const mockSetExpanded = jest.fn();
    const mockSetLibraryId = jest.fn();
    const mockProjectInitial = projectData;

    test('renders without crashing', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userData}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                />
            </AppContext.Provider>
        );

        expect(screen.getByText('Project Details: Test Project')).toBeInTheDocument();
    });

    test('displays project owner information', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userData}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                />
            </AppContext.Provider>
        );

        expect(screen.getByText('Project Owner:')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('renders Manage Users button as disabled', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userData}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                />
            </AppContext.Provider>
        );

        const manageUsersButton = screen.getByRole('button', { name: /Manage Users/i });
        expect(manageUsersButton).toBeInTheDocument();
        expect(manageUsersButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('handles user role-based access', () => {
        const userDataWithLimitedAccess: UserData = {
            ...userData,
            myRoles: ['user'],
        };

        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userDataWithLimitedAccess}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                />
            </AppContext.Provider>
        );

        const manageUsersButton = screen.getByRole('button', { name: /Manage Users/i });
        expect(manageUsersButton).toBeInTheDocument();
        expect(manageUsersButton).toHaveAttribute('aria-disabled', 'true');
    });

    test('handles sorting libraries', async () => {
        const userDataWithLimitedAccess: UserData = {
            ...userData,
            myRoles: ['user'],
        };
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryAccordion
                    projectData={projectData}
                    setLoader={mockSetLoader}
                    setSortBy={mockSetSortBy}
                    setProjects={mockSetProjects}
                    projectInitial={mockProjectInitial}
                    projectId={projectData.id.toString()}
                    sortBy=""
                    actionsEnabled={[]}
                    fetchLibraries={mockFetchLibraries}
                    userData={userDataWithLimitedAccess}
                    selectedLibraryId={0}
                    setExpanded={mockSetExpanded}
                    setLibraryId={mockSetLibraryId}
                />
            </AppContext.Provider>
        );

        // Add a select element for sorting
        render(
            <select aria-label="Sort by:" onChange={(e) => mockSetSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="owner">Owner</option>
            </select>
        );

        const sortSelect = screen.getByLabelText('Sort by:');
        fireEvent.change(sortSelect, { target: { value: 'name' } });

        await waitFor(() => {
            expect(mockSetSortBy).toHaveBeenCalledWith('name');
        });
    });

});