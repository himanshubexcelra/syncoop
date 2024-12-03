import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MoleculeList from '../MoleculeList';
import { AppContext } from "../../../app/AppState";
import { getMoleculeCart } from '../service';

jest.mock('../service', () => ({
    addToFavourites: jest.fn(),
    getLibraryById: jest.fn(),
    addMoleculeToCart: jest.fn(),
    getMoleculeCart: jest.fn(),
}));

jest.mock("@/components/Molecule/AddMolecule/AddMolecule", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="addMolecule">Add Molecule</div>),
}));

jest.mock("@/components/Molecule/EditMolecule/EditMolecule", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="editMolecule">Edit Molecule</div>),
}));

jest.mock("@/components/KetcherTool/KetcherBox", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="ketcherBox">Ketcher Box</div>),
}));

const mockContext = {
    userCount: {
        externalUsers: 0,
        internalUsers: 0
    },
    refreshAssayTable: false,
    refreshUsersTable: false,
    cartDetail: [],
    refreshCart: false,
}
const mockContextValue = { state: { appContext: mockContext }, addToState: jest.fn() }
const userData = {
    id: 1,
    organization_id: 1,
    email_id: "forum.tanna@external.milliporesigma.com",
    first_name: "Forum",
    last_name: "Tanna",
    myRoles: ['admin'],
    roles: [{ id: 1, type: 'admin' }],
    orgUser: {
        id: 1,
        name: 'System Admin',
        first_name: "Forum",
        last_name: "Tanna",
        email_id: "forum.tanna@external.milliporesigma.com",
        status: 'Active',
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            },
            role_id: 1
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
            type: 'Internal',
            user_role: [{
                role: {
                    id: 6,
                    priority: 1,
                    type: "admin",
                    number: 1,
                    name: "admin"
                },
                role_id: 1
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
        role_id: 1
    }],
} as any;

const projects = {
    name: "Project X",
    id: 101,
    description: "This is a description of Project X.",
    organization_id: 202,
    organization: {
        id: 202,
        name: "Organization A",
        email_id: "orgA@example.com",
        status: "Active",
        orgUser: [
            {
                organization: { name: '"Organization A', id: 1 },
                user_role: [{
                    role: {
                        id: 1,
                        name: 'Admin'
                    }, role_id: 1
                }],
                type: '',
                id: 1,
                first_name: "john",
                last_name: "test",
                email_id: "john.test@example.com",
                status: "Active",
            },
        ],
        metadata: {
            functionalAssay1: "Assay data 1",
            functionalAssay2: "Assay data 2",
            functionalAssay3: "Assay data 3",
            functionalAssay4: "Assay data 4",
        },
        projects: [],
        orgAdminId: 303,
        type: "Internal",
    },
    user: {
        id: 123,
        first_name: "Tom",
        last_name: "test",
        email_id: "Tom.test@example.com",
        status: "Active",
    },
    sharedUsers: [
        {
            user_id: 789,
            id: 456,
            name: "Shared User",
            first_name: "Shared",
            last_name: "User",
            email_id: "shared.user@example.com",
            status: "Active",
            role: "Contributor",
        },
    ],
    target: "Drug Discovery",
    type: "Research",
    userWhoUpdated: {
        id: 999,
        first_name: "Admin",
        last_name: "User",
        email_id: "admin.user@example.com",
        status: "Active",
    },
    userWhoCreated: {
        id: 123,
        first_name: "Tom",
        last_name: "test",
        email_id: "Tom.test@example.com",
        status: "Active",
    },
    updated_at: new Date('2024-11-28T10:00:00Z'),
    user_id: 123,
    owner: {
        id: 123,
        first_name: "Jane",
        last_name: "Smith",
        email_id: "jane.smith@example.com",
        status: "Active",
        organization: { name: '"Organization A', id: 1 },
        user_role: [{
            role: {
                id: 1,
                name: 'Admin'
            }, role_id: 1
        }],
        type: '',
    },
    ownerId: 123,
    libraries: [],
    created_at: new Date('2024-11-01T00:00:00Z'),
    combinedLibrary: {
        molecule: [
            {
                status: "Ready",
            },
        ],
    },
};


const mockProps = {
    moleculeLoader: false,
    expanded: false,
    tableData: [{
        created_at: new Date('2024-11-28T00:00:00Z'),
        created_by: 1,
        finger_print: 'ABC123XYZ',
        id: 1,
        inchi_key: 'ABCDXYZ123',
        library_id: 1,
        molecular_weight: 180.16,
        smiles_string: 'C1=CC=CC=C1O',
        source_molecule_name: 'Phenol',
        "project / library": '1',
        "organization / order": '1',
        status: 1,
        updated_at: new Date('2024-11-28T01:00:00Z'),
        updated_by: 1,
    }],
    userData: userData,
    setMoleculeLoader: jest.fn(),
    setTableData: jest.fn(),
    actionsEnabled: ['create_molecule', 'create_library', 'edit_library'],
    selectedLibrary: 1,
    library_id: "1",
    projects: projects,
    projectId: "1",
    organizationId: "1",
};

describe('MoleculeList Component', () => {
    const renderComponent = () => {
        render(
            <AppContext.Provider value={mockContextValue}>
                <MoleculeList {...mockProps} />
            </AppContext.Provider>
        );
    }

    it('renders MoleculeList component correctly', () => {
        renderComponent();
        expect(screen.getByText(/Add Molecule/i)).toBeInTheDocument();
    });

    it('Check for add to cart button', async () => {
        await act(async () => {
            renderComponent();
        });

        (getMoleculeCart as jest.Mock).mockResolvedValue([]);
        await waitFor(() => {
            expect(screen.queryByRole('toolbar')).toBeInTheDocument();
        });
    });

    it('Should open add molecule popup', async () => {
        await act(async () => {
            renderComponent();
        })
        const addMoleculeButton = screen.getByText('Add Molecule');
        fireEvent.click(addMoleculeButton);
        expect(screen.getByText('Add Molecule')).toBeInTheDocument();
    });

});
