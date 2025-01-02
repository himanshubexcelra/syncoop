/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getMoleculesOrder } from '@/components/MoleculeOrder/service';
import { Messages } from '@/utils/message';
import MoleculeOrderPage from '../MoleculeOrder';
import { ColumnConfig, TabDetail, UserData } from '@/lib/definition';
import CustomDataGrid from '@/ui/dataGrid';
import Tabs from '@/ui/Tab/Tabs';

// Mock console.error at the top of your test file
global.console = {
    ...global.console,
    error: jest.fn(), // Mock console.error
};

// Mocking modules and dependencies
jest.mock('@/components/MoleculeOrder/service');
jest.mock('@/utils/helpers', () => ({
    isAdmin: jest.fn(() => false),
    popupPositionValue: jest.fn(() => ({})),
}));

// Define mockUserData with all required properties
const mockUserData: UserData = {
    organization_id: 1,
    orgUser: {
        type: 'External',
        id: 0,
        status: '',
        organization: {
            id: 3,
            name: 'Organization 1'
        },
        user_role: [],
        first_name: '',
        email_id: '',
        last_name: ''
    },
    roles: [{ type: 'admin' }],
    myRoles: ['admin'],
    id: 123,
    user_role: [],
    email_id: '',
    first_name: '',
    last_name: '',
    is_active: true,
};
const actionsEnabledMock = [
    "view_molecule_order"
]

// Define mockData to match expected molecule order structure
const mockData = [
    {
        id: 1,
        smile: 'CC(=O)Oc1ccccc1C(=O)O',
        order_id: 101,
        molecule_id: 2001,
        molecular_weight: '250',
        status: 6,
        molecule_status: 'Ready',
        disabled: true,
        yield: 1,
        anlayse: 0.7,
        herg: 1,
        caco2: 0.5,
    },
    {
        id: 2,
        smile: 'CC(=O)Oc1ccccc1C(=O)O',
        order_id: 102,
        molecule_id: 2002,
        molecular_weight: '250',
        status: 6,
        molecule_status: 'Ready',
        disabled: true,
        yield: 1,
        anlayse: 0.7,
        herg: 1,
        caco2: 0.5,
    },
    {
        id: 3,
        smile: 'CC(=O)Oc1ccccc1C(=O)O',
        order_id: 102,
        molecule_id: 2004,
        molecular_weight: '250',
        status: 3,
        molecule_status: 'Ordered',
        disabled: false,
        yield: 1,
        anlayse: 0.7,
        herg: 1,
        caco2: 0.5,
    },
];

const onRowClick = jest.fn();
const onSelectionUpdated = jest.fn();
const onEditorPreparing = jest.fn();
const onRowPrepared = jest.fn();
const rowGroupName = jest.fn();
const handleSendForSynthesis = jest.fn();
const toolbarButtons = [
    {
        text: `Send for Retrosynthesis (${mockData.length})`,
        onClick: handleSendForSynthesis,
        disabled: false,
        class: 'btn-primary',
        visible: true,
    }
];

const columns: ColumnConfig[] = [
    {
        dataField: 'smiles_string',
        title: 'Structure',
        minWidth: 200,
        width: 200,
        alignment: 'center',
        allowHeaderFiltering: false,
        allowSorting: false,
    },
    {
        dataField: 'molecule_id',
        title: 'Molecule ID',
        allowHeaderFiltering: true,
        allowSorting: true,
        width: 140,
        alignment: 'center',
    },
    {
        dataField: 'molecular_weight',
        title: 'Molecular Weight',
        width: 100,
        allowHeaderFiltering: false,
        allowSorting: true,
        alignment: 'center',
        cssClass: 'moleculeStatus',
    },
    {
        dataField: 'molecule_status',
        title: 'Molecule Status',
        width: 160,
        allowHeaderFiltering: true,
        allowSorting: true,
        alignment: 'center',
        cssClass: 'moleculeStatus',
    },
    {
        dataField: 'yield',
        title: 'Yield(%)',
        width: 100,
        alignment: "center",
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'analyse',
        title: 'Analyse',
        width: 80,
        allowHeaderFiltering: false,
        allowSorting: false,
    },
    {
        dataField: 'Caco2_Papp',
        title: 'Caco-2(cm/sec)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'CLint_Human',
        title: 'CLint Human(μL/min/mg)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'CLint_Rat',
        title: 'CLint Rat(μL/min/mg)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'CLint_Mouse',
        title: 'CLint Mouse(μL/min/mg)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'Fub_Human',
        title: 'Fub Human(%)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'Fub_Rat',
        title: 'Fub Rat(%)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'Fub_Mouse',
        title: 'Fub Mouse(%)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'HepG2_IC50',
        title: 'HepG2 IC50(μM)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'hERG_Ki',
        title: 'hERG Ki(μM)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    },
    {
        dataField: 'solubility',
        title: 'Solubility(μM)',
        width: 80,
        cssClass: 'moleculeStatus',
        allowHeaderFiltering: false,
        allowSorting: true,
    }
];

// Mock Components
const MockComponent = ({ title }: { title: string }) => <div>{title}</div>;

// Mock Functions and Data
const reaction = jest.fn();
const handleDataChange = jest.fn();
const solventList = ['a', 'b'];
const temperatureList = [1, 2];
const handleSolventChange = jest.fn();
const handleTemperatureChange = jest.fn();
const resetReaction = 1;
const consolidatedReagents = jest.fn();

const tabsDetails: TabDetail[] = [
    {
        title: "Reaction 1",
        Component: MockComponent,
        props: {
            isReactantList: false,
            data: reaction,
            onDataChange: handleDataChange,
            solventList,
            temperatureList,
            onSolventChange: handleSolventChange,
            onTemperatureChange: handleTemperatureChange,
            resetReaction,
            status: "Ready",
        },
    },
    {
        title: "Reaction 2",
        Component: MockComponent,
        props: {
            isReactantList: false,
            data: reaction,
            onDataChange: handleDataChange,
            solventList,
            temperatureList,
            onSolventChange: handleSolventChange,
            onTemperatureChange: handleTemperatureChange,
            resetReaction,
            status: "Ready",
        },
    },
    {
        title: "Reactant List",
        Component: MockComponent,
        props: {
            isReactantList: true,
            data: consolidatedReagents,
        },
    },
];

describe('MoleculeOrderPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders MoleculeOrderPage with data', async () => {
        // Set up the mock to return data
        (getMoleculesOrder as jest.Mock).mockResolvedValueOnce(mockData);

        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);
 
        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText(/Molecule Orders/i).length).toBeGreaterThan(0);
        });

        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText(/Order/).length).toBeGreaterThan(0);
        });
    }, 60000);

    // Update the error handling test
    test.skip('handles error during data fetch gracefully', async () => {
        (getMoleculesOrder as jest.Mock).mockRejectedValue(new Error(Messages.FETCH_ERROR));
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        // Verify that the error is logged
        await waitFor(() => {
            expect(console.error).toHaveBeenCalled(); // Check if any error is logged
        });
    });

    test('renders the DataGrid with correct data', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await act(async () => {
            render(<CustomDataGrid
                columns={columns}
                onRowClick={onRowClick}
                data={mockData}
                groupingColumn={rowGroupName()}
                enableRowSelection
                enableGrouping
                enableSorting
                enableFiltering={false}
                enableOptions={false}
                toolbarButtons={toolbarButtons}
                enableHeaderFiltering
                enableSearchOption
                selectionEnabledRows={[]}
                onSelectionUpdated={onSelectionUpdated}
                onEditorPreparing={onEditorPreparing}
                onRowPrepared={onRowPrepared}
                hoverStateEnabled={true}
            />)
        });


        await waitFor(() => {
            const moleculeColumn = screen.getAllByText('Molecule ID');
            expect(moleculeColumn).not.toHaveLength(0);
        });
    });

    test.skip('send for synthesis button should be present', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await act(async () => {
            render(<CustomDataGrid
                columns={columns}
                onRowClick={onRowClick}
                data={mockData}
                groupingColumn={rowGroupName()}
                enableRowSelection
                enableGrouping
                enableSorting
                enableFiltering={false}
                enableOptions={false}
                toolbarButtons={toolbarButtons}
                enableHeaderFiltering
                enableSearchOption
                selectionEnabledRows={[]}
                onSelectionUpdated={onSelectionUpdated}
                onEditorPreparing={onEditorPreparing}
                onRowPrepared={onRowPrepared}
                hoverStateEnabled={true}
            />)
        });

        await waitFor(() => {
            expect(screen.getByText('Send for Retrosynthesis (0)')).toBeInTheDocument();
        });
        const selectBox = screen.getAllByRole('checkbox');

        expect(selectBox[1]).not.toBeChecked();
        expect(selectBox[2]).not.toBeDisabled();

        fireEvent.click(selectBox[2]);

        // Check if the status value for the second row is updated in the DOM
        expect(selectBox[2]).toBeChecked();

        await act(async () => {
            fireEvent.click(screen.getByText('Send for Retrosynthesis (1)'));
        });
        expect(handleSendForSynthesis).toHaveBeenCalledTimes(1);

    });

    test.skip('checkbox selection should work as expected', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await act(async () => {
            render(<CustomDataGrid
                columns={columns}
                onRowClick={onRowClick}
                data={mockData}
                groupingColumn={rowGroupName()}
                enableRowSelection
                enableGrouping
                enableSorting
                enableFiltering={false}
                enableOptions={false}
                toolbarButtons={toolbarButtons}
                enableHeaderFiltering
                enableSearchOption
                selectionEnabledRows={[]}
                onSelectionUpdated={onSelectionUpdated}
                onEditorPreparing={onEditorPreparing}
                onRowPrepared={onRowPrepared}
                hoverStateEnabled={true}
            />)
        });

        await waitFor(() => {
            const moleculeColumn = screen.getAllByText('Molecule ID');
            expect(moleculeColumn).not.toHaveLength(0);
        });

        const rows = screen.getAllByRole('row');
        fireEvent.click(rows[2]);

        expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    test("renders all tabs with correct titles", async () => {
        render(<Tabs tabsDetails={tabsDetails} />);

        await waitFor(() => {
            const tabs = screen.queryAllByRole("tab");
            expect(tabs).toHaveLength(tabsDetails.length);
        });
    });

    test("renders the correct content for the active tab", async () => {
        render(<Tabs tabsDetails={tabsDetails} />);

        await waitFor(() => {
            const content = screen.getAllByText("Reaction 1");
            expect(content.length).toBeGreaterThan(0);
        });
    });

    test("changes content when a new tab is selected", async () => {
        render(
            <Tabs
                tabsDetails={tabsDetails}
                activeTab={0}
                onSelectedIndexChange={jest.fn()}
            />
        );

        const tabs = screen.getAllByRole("tab");
        await act(async () => {
            fireEvent.click(tabs[1]);
        });

        await waitFor(() => {
            const content = screen.getAllByText("Reaction 2");
            expect(content.length).toBeGreaterThan(0);
        });
    });

    test("calls onSelectedIndexChange when tab is clicked", async () => {
        const mockOnSelectedIndexChange = jest.fn();

        render(
            <Tabs
                tabsDetails={tabsDetails}
                onSelectedIndexChange={mockOnSelectedIndexChange}
            />
        );

        const tabs = screen.getAllByRole("tab");
        await act(async () => {
            fireEvent.click(tabs[1]);
        });

        await waitFor(() => {
            expect(mockOnSelectedIndexChange).toHaveBeenCalledWith(1);
        });
    });

    test("uses activeTab prop to control selected tab", async () => {
        render(<Tabs tabsDetails={tabsDetails} activeTab={2} />);

        await waitFor(() => {
            const content = screen.getAllByText("Reactant List");
            expect(content.length).toBeGreaterThan(0);
        });
    });
});
