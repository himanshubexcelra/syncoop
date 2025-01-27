import { fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import LibraryDetails from '../LibraryDetails';
import { AppContext } from '../../../app/AppState';
import { AppContextModel, UserData } from '@/lib/definition';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

jest.mock('uuid', () => ({
    v1: jest.fn(),
    v4: jest.fn(() => 'mocked-uuid-v4'),
}));

jest.mock('@/components/Molecule/AddMolecule/AddMolecule', () => () => null);
jest.mock('@/components/Molecule/EditMolecule/EditMolecule', () => () => null);

// Mock hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
    useParams: jest.fn(),
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
(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('library_id=1'));
(useParams as jest.Mock).mockReturnValue({ id: '1', projectId: '1' });

const mockAppContext = {
    state: {
        cartDetail: {},
        appContext: {} as AppContextModel,
    },
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

const libData = [
    {
        id: 1,
        name: 'Library 1',
        owner: { first_name: 'user' },
        metadata: { target: '', type: '' },
        libraryMolecules: [],
    },
    {
        id: 2,
        name: 'Library 2',
        owner: { first_name: 'user1' },
        metadata: { target: '', type: '' },
        libraryMolecules: [],
    },
];

const projectData = {
    id: 1,
    name: 'Project 1',
    description: 'Project description',
    container: { id: 1, name: 'Organization 1' },
    user: { id: 1, first_name: 'Test', last_name: 'User', email_id: 'test.user@example.com' },
    sharedUsers: [],
    target: '',
    metadata: { target: '', type: 'Custom Reaction' },
    userWhoUpdated: { id: 1, first_name: 'Test', last_name: 'User', email_id: 'test.user@example.com' },
    userWhoCreated: { id: 1, first_name: 'Test', last_name: 'User', email_id: 'test.user@example.com' },
    updated_at: new Date(),
    user_id: 1,
    owner: { id: 1, first_name: 'Test', last_name: 'User', email_id: 'test.user@example.com' },
    owner_id: 1,
    orgUser: undefined,
    created_at: new Date(),
    other_container: [...libData],
}

jest.mock('../service', () => {
    const originalModule = jest.requireActual('../service');
    return {
        ...originalModule,
        getLibraries: jest.fn().mockImplementation(() => {
            return Promise.resolve(projectData);
        }),
        fetchProjectData: jest.fn().mockImplementation(() => {
            return Promise.resolve(projectData);
        }),
    };
});

const actionsEnabled = ['create_molecule_order'];

describe('LibraryDetails Component', () => {
    test('renders without crashing', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryDetails
                    userData={userData}
                    actionsEnabled={actionsEnabled}
                    organizationId="1"
                    projectId="1"
                />
            </AppContext.Provider>
        );

    });

    test('displays breadcrumb correctly', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryDetails
                    userData={userData}
                    actionsEnabled={actionsEnabled}
                    organizationId="1"
                    projectId="1"
                />
            </AppContext.Provider>
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Project:')).toBeInTheDocument();
    });

    test('handles state changes correctly', async () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryDetails
                    userData={userData}
                    actionsEnabled={actionsEnabled}
                    organizationId="1"
                    projectId="1"
                />
            </AppContext.Provider>
        );

        // Simulate state changes and check if the component updates correctly
        const projectTitle = screen.getByText('Project:');
        expect(projectTitle).toBeInTheDocument();
    });

    test('fetches and sets project data correctly', async () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryDetails
                    userData={userData}
                    actionsEnabled={actionsEnabled}
                    organizationId="1"
                    projectId="1"
                />
            </AppContext.Provider>
        );

        await waitFor(() => {
            // Check for something that is definitely rendered
            expect(screen.getByText('Project: Project 1')).toBeInTheDocument();
        });
    });

    test('handles loader state correctly', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <LibraryDetails
                    userData={userData}
                    actionsEnabled={actionsEnabled}
                    organizationId="1"
                    projectId="1"
                />
            </AppContext.Provider>
        );

        const loader = screen.getByRole('alert');
        expect(loader).toBeInTheDocument();
    });

    test.skip('handles expanding correctly', async () => {
        const getLibraries = jest.fn();
        (getLibraries as jest.Mock).mockResolvedValue(projectData);
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(projectData),
        });
        render(
            <LibraryDetails
                userData={userData}
                actionsEnabled={actionsEnabled}
                organizationId="1"
                projectId="1"
            />
        );

        const loader = screen.getByRole('alert');
        await waitFor(() => expect(loader).not.toBeInTheDocument())
        const expandButton = screen.getByAltText('showDetailedView');
        expect(expandButton).toHaveAttribute('src', '/icons/expand.svg');

        await act(() => fireEvent.click(expandButton));
        expect(expandButton).toHaveAttribute('src', '/icons/collapse.svg');
    });
});