import { render, screen, fireEvent } from '@testing-library/react';
import ProjectAccordionDetail from '../ProjectAccordionDetail';
import { Messages } from '@/utils/message';
import { UserData } from '@/lib/definition';

jest.mock('../projectService', () => ({
    deleteProject: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

const mockRouterPush = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

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
        name: ''
    },
    myRoles: ['admin'],
    roles: [{
        type: 'admin',
    }],
    is_active: false
};

const mockProps = {
    data: {
        id: 1,
        name: 'Test Project',
        metadata: { target: 'Target1', type: 'Retrosynthesis' },
        description: 'This is a test project.',
        owner_id: 1,
        inherits_configuration: true,
        owner: { first_name: 'John', last_name: 'Doe' },
        other_container: [
            {
                id: 10,
                name: 'Library 1',
                libraryMolecules: [{ id: 1 }, { id: 2 }],
                description: 'Library description',
            },
        ],
        container: {
            id: 2,
            name: "Fauxbio",
            config: null
        },
        userWhoCreated: {
            first_name: "LibExternal",
            last_name: "Mg1"
        },
        user: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email_id: 'john@test.com',
            status: '1',
        },
        target: '100',
        container_access_permission: [{ user_id: 2, access_type: 'Admin' }],
        created_at: '2022-01-01T00:00:00Z',
        updated_at: '2022-01-02T00:00:00Z',
        userWhoUpdated: { first_name: 'Jane', last_name: 'Smith' },
    },
    users: [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' },
    ],
    userData: userData,
    fetchOrganizations: jest.fn(),
    organizationData: [],
    actionsEnabled: ['edit_project', 'delete_project'],
    myRoles: ['Admin'],
    clickedOrg: undefined,
    childRef: { current: null },
    setIsDirty: jest.fn(),
    reset: '',
    showPopup: false,
    popup: null,
    isDirty: false,
    setShowPopup: jest.fn(),
    allProjectData: [
        { id: 1, name: 'Test Project' },
    ],
    selectedProject: jest.fn(),
};

describe('ProjectAccordionDetail', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders component with provided data', () => {
        render(<ProjectAccordionDetail {...mockProps} />);
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('This is a test project.')).toBeInTheDocument();
        expect(screen.getByText('Library 1')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test.skip('renders delete button when deleteEnabled is true', () => {
        const noLibraryProps = {
            ...mockProps,
            data: { ...mockProps.data, other_container: [] },
        };
        render(<ProjectAccordionDetail {...noLibraryProps} />);
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);
        expect(deleteButton).toBeInTheDocument();
    });

    test.skip('renders empty library message if no libraries exist', () => {
        const noLibraryProps = {
            ...mockProps,
            data: { ...mockProps.data, other_container: [] },
        };

        render(<ProjectAccordionDetail {...noLibraryProps} />);

        expect(screen.getByText(Messages.LIBRARY_LIST_EMPTY('molecules'))).toBeInTheDocument();
    });
});
