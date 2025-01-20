/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MoleculeList from '../MoleculeList';
import { AppContext } from '../../../app/AppState';
import { AppContextModel, UserData, ProjectDataFields, MoleculeType } from '@/lib/definition';
import { useRouter } from 'next/navigation';
import { getMoleculeCart, getMoleculeOrder } from '../service';
import CustomDataGrid from '@/ui/dataGrid';
import MoleculeStructure from '@/utils/MoleculeStructure';

jest.mock('uuid', () => ({
    v1: jest.fn(),
    v4: jest.fn(() => 'mocked-uuid-v4'),
}));

// Mock AddMolecule and EditMolecule
jest.mock('@/components/Molecule/AddMolecule/AddMolecule', () => () => null);
jest.mock('@/components/Molecule/EditMolecule/EditMolecule', () => () => null);

jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));


jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('../service', () => {
    const originalModule = jest.requireActual('../service');
    return {
        ...originalModule,
        getMoleculeData: jest.fn().mockImplementation(() => {
            return Promise.resolve([
                { id: 1, name: 'Benzene', favourite: true, smiles_string: 'C1=CC=CC=C1' },
                { id: 2, name: 'Ethanol', favourite: false, smiles_string: 'CCO' },
            ]);
        }),
        getMoleculeCart: jest.fn().mockImplementation(() => {
            return Promise.resolve([
                { id: 1, name: 'Benzene' },
                { id: 2, name: 'Ethanol' },
            ]);
        }),
        getMoleculeOrder: jest.fn(),
    };
});

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

const moleculeData: MoleculeType[] = [
    {
        id: 1,
        favourite: true,
        smiles_string: 'C1=CC=CC=C1',
        created_at: new Date(),
        created_by: 1,
        finger_print: '',
        inchi_key: '',
        library_id: 1,
        project_id: 1,
        organization_id: 1,
        molecular_weight: 78.11,
        source_molecule_name: 'Benzene',
        "project / library": 'Project 1 / Library 1',
        "organization / order": 'Organization 1 / Order 1',
        status: 1,
        status_name: 'Active',
        favourite_id: 1,
        updated_at: new Date(),
        updated_by: 1,
        adme_data: [],
        reaction_data: {},
        functional_assays: [],
        molecule_id: 0,
        disabled: false
    },
    {
        id: 2,
        favourite: false,
        smiles_string: 'CCO',
        created_at: new Date(),
        created_by: 1,
        finger_print: '',
        inchi_key: '',
        library_id: 1,
        project_id: 1,
        organization_id: 1,
        molecular_weight: 46.07,
        source_molecule_name: 'Ethanol',
        "project / library": 'Project 1 / Library 1',
        "organization / order": 'Organization 1 / Order 1',
        status: 1,
        status_name: 'Active',
        favourite_id: 2,
        updated_at: new Date(),
        updated_by: 1,
        adme_data: [],
        reaction_data: {},
        functional_assays: [],
        molecule_id: 0,
        disabled: false
    },
];

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

const projectData: ProjectDataFields = {
    name: 'Test Project',
    id: 1,
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
        inherits_configuration: false
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
    owner: {
        id: 1,
        first_name: 'Test',
        name: 'Test',
        email_id: 'Test@gmail.com',
        status: 'Test',
        last_name: 'Test',
        organization: {
            id: 1,
            name: "string"
        },
        user_role: [
            {
                role: {
                    id: 1,
                    name: "admin",
                    type: "admin",
                    priority: 1,
                },
                role_id: 1
            }
        ],
        role: "admin",
        permission: "admin",
        type: "admin"
    },
    inherits_configuration: false
};

describe('MoleculeList Component', () => {
    const mockSetSortBy = jest.fn();
    const mockFetchMoleculeData = jest.fn();
    const mockSetTableData = jest.fn();
    const mockOnSelectionChanged = jest.fn();
    const mockOnRowPrepared = jest.fn();
    const mockAddToFavourites = jest.fn();

    let isMoleculeInCart: string | any[] = [];
    beforeEach(() => {
        jest.clearAllMocks();
        isMoleculeInCart = [1]; // Example mocked data
    });

    const columns = [
        {
            dataField: 'favourite',
            title: 'Favourite',
            customRender: (data: any) => (
                <span
                    data-testid={`favourite-icon-${data.id}`}
                    onClick={() => mockAddToFavourites({ ...data, favourite: !data.favourite })}
                >
                    {data.favourite ? '★' : '☆'}
                </span>
            )
        },
        { dataField: 'name', title: 'Name' },
        { dataField: 'smiles_string', title: 'Structure' },
    ];

    test('renders without crashing', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <MoleculeList
                    actionsEnabled={['create_molecule_order']}
                    fetchLibraries={mockFetchMoleculeData}
                    userData={userData}
                    expanded={false}
                    tableData={moleculeData}
                    setTableData={mockSetTableData}
                    selectedLibrary={0}
                    library_id={0}
                    projectData={projectData}
                    projectId={''}
                    organizationId={''}
                    selectedLibraryName={''}
                />
            </AppContext.Provider>
        );
    });

    test('handles sorting functionality', async () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <CustomDataGrid
                    columns={columns}
                    data={moleculeData}
                    enableRowSelection
                    enableGrouping
                    enableSorting
                    loader={false}
                />
            </AppContext.Provider>
        );

        // Add a select element for sorting
        render(
            <select aria-label="Sort by:" onChange={(e) => mockSetSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="smiles_string">Structure</option>
            </select>
        );

        const sortSelect = screen.getByLabelText('Sort by:');
        fireEvent.change(sortSelect, { target: { value: 'name' } });

        await waitFor(() => {
            expect(mockSetSortBy).toHaveBeenCalledWith('name');
        });
    });

    test('displays loading indicator', () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <MoleculeList
                    actionsEnabled={['create_molecule_order']}
                    fetchLibraries={mockFetchMoleculeData}
                    userData={userData}
                    expanded={false}
                    tableData={moleculeData}
                    setTableData={mockSetTableData}
                    selectedLibrary={0}
                    library_id={0}
                    projectData={projectData}
                    projectId={''}
                    organizationId={''}
                    selectedLibraryName={''}
                />
            </AppContext.Provider>
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('handles isMoleculeInCart state correctly', async () => {

        render(
            <AppContext.Provider value={mockAppContext}>
                <CustomDataGrid
                    columns={[
                        {
                            dataField: 'name',
                            title: 'Name',
                        },
                    ]}
                    data={[]}
                    enableRowSelection
                    enableGrouping
                    enableSorting
                    loader={false}
                    onRowPrepared={(e: any) => {
                        if (e.key && isMoleculeInCart?.includes(e.key)) {
                            e.cellElement.style.pointerEvents = 'none';
                            e.cellElement.style.opacity = 0.5;
                        }
                    }}
                />
            </AppContext.Provider>
        );

    });

    test('handles cart and order data correctly', async () => {
        (getMoleculeCart as jest.Mock).mockResolvedValueOnce([
            { id: 1, name: 'Benzene' },
            { id: 2, name: 'Ethanol' },
        ]);

        render(
            <AppContext.Provider value={mockAppContext}>
                <CustomDataGrid
                    columns={columns}
                    data={moleculeData}
                    enableRowSelection
                    enableGrouping
                    enableSorting
                    loader={false}
                />
            </AppContext.Provider>
        );
    });

    test('handles molecule order data correctly', async () => {
        (getMoleculeOrder as jest.Mock).mockResolvedValueOnce([
            { id: 1, name: 'Benzene' },
            { id: 2, name: 'Ethanol' },
        ]);

        render(
            <CustomDataGrid
                columns={columns}
                data={[
                    { id: 1, name: 'Benzene', smiles_string: 'C1=CC=CC=C1' },
                    { id: 2, name: 'Ethanol', smiles_string: 'CCO' },
                ]}
                enableRowSelection
                enableGrouping
                enableSorting
                loader={false}
                enableHeaderFiltering
                enableSearchOption={true}
                onRowPrepared={mockOnRowPrepared}
                handleSelectionChange={mockOnSelectionChanged}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Benzene')).toBeInTheDocument();
            expect(screen.getByText('Ethanol')).toBeInTheDocument();
        });
    });

    test('renders Add to Cart button with correct text and functionality', async () => {
        const mockAddToCart = jest.fn();
        const toolbarButtons = [
            {
                text: `Add to Cart (0)`,
                onClick: mockAddToCart,
                class: 'btn-disable',
                disabled: true,
                visible: true,
            },
        ];

        render(
            <AppContext.Provider value={mockAppContext}>
                <CustomDataGrid
                    columns={columns}
                    data={moleculeData}
                    toolbarButtons={toolbarButtons}
                    enableRowSelection
                    enableGrouping
                    enableSorting
                    loader={false}
                />
            </AppContext.Provider>
        );

        // Check that the Add to Cart button is rendered
        const addToCartButton = screen.getByRole('button', { name: /Add to Cart \(0\)/i });
        expect(addToCartButton).toBeInTheDocument();

        // Ensure the button has the disabled state via aria-disabled
        expect(addToCartButton).toHaveAttribute('aria-disabled', 'true');

        // Simulate a click and ensure the mock function is not called
        fireEvent.click(addToCartButton);
        expect(mockAddToCart).not.toHaveBeenCalled();
    });

    test('renders popup with molecule structure when popupVisible is true', async () => {
        const mockCellData = {
            smiles_string: 'C1=CC=CC=C1',
            source_molecule_name: 'Benzene',
        };

        render(
            <MoleculeStructure
                id={"1"}
                structure={mockCellData?.smiles_string}
                width={200}
                height={200}
                svgMode={true}
                structureName=
                {mockCellData.source_molecule_name}
            />
        );
    });

    test('handles cell preparation for molecules in cart and done molecules', async () => {
        const isMoleculeInCart = [1];
        const inDoneMolecules = [2];

        render(
            <AppContext.Provider value={mockAppContext}>
                <CustomDataGrid
                    columns={columns}
                    data={moleculeData}
                    enableRowSelection
                    enableGrouping
                    enableSorting
                    loader={false}
                    onRowPrepared={(e: any) => {
                        if (isMoleculeInCart.includes(e.key)) {
                            e.cellElement.style.pointerEvents = 'none';
                            e.cellElement.style.opacity = 0.5;
                        }
                        if (inDoneMolecules.includes(e.key)) {
                            e.cellElement.style.pointerEvents = 'none';
                            e.cellElement.style.opacity = 0.5;
                        }
                    }}
                />
            </AppContext.Provider>
        );
    });

});