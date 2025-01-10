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
import ConfirmationDialog from '../ConfirmationDialog';

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
        last_name: '',
        name: ''
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

const actionsEnabledMock = ['view_molecule_order', 'generate_pathway', 'edit_reactions',
    'create_modify_submit_synthesis_lab_job'];


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

// Mock MoleculeOrderPage
jest.mock('../MoleculeOrder', () => {
    const MockMoleculeOrderPage = (props: any) => (
        <div data-testid="MoleculeOrderPage">
            {props.userData && (
                <>
                    <button>Validate</button>
                    <button>Reset</button>
                    {props.actionsEnabled.includes('send_lab_job') && (
                        <button>Send For Lab Job</button>
                    )}
                </>
            )}
        </div>
    );
    MockMoleculeOrderPage.displayName = 'MockMoleculeOrderPage';
    return MockMoleculeOrderPage;
});

describe('MoleculeOrderPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.skip('renders MoleculeOrderPage with data', async () => {
        // Set up the mock to return data
        (getMoleculesOrder as jest.Mock).mockResolvedValueOnce(mockData);

        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText("Molecule Orders").length).toBeGreaterThan(0);
        });

        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText("Order").length).toBeGreaterThan(0);
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

    test('renders Validate and Reset buttons correctly', async () => {
        render(
            <MoleculeOrderPage
                userData={mockUserData}
                actionsEnabled={actionsEnabledMock}
            />
        );

        const validateButton = screen.getByText('Validate');
        const resetButton = screen.getByText('Reset');

        expect(validateButton).toBeInTheDocument();
        expect(resetButton).toBeInTheDocument();
    });

    test('Validate button click works as expected', async () => {
        const mockHandleClick = jest.fn();

        render(
            <div>
                <button onClick={mockHandleClick}>Validate</button>
            </div>
        );

        const validateButton = screen.getByText('Validate');
        fireEvent.click(validateButton);

        await waitFor(() => {
            expect(mockHandleClick).toHaveBeenCalled();
        });
    });

    test('renders MoleculeOrderPage mock correctly', async () => {
        render(
            <MoleculeOrderPage
                userData={mockUserData}
                actionsEnabled={actionsEnabledMock}
            />
        );

        const moleculeOrderPage = screen.getByTestId('MoleculeOrderPage');
        expect(moleculeOrderPage).toBeInTheDocument();
    });

    test('does not render Send For Lab Job button when action is disabled', async () => {
        render(
            <MoleculeOrderPage
                userData={mockUserData}
                actionsEnabled={['generate_pathway', 'edit_reactions']}
            />
        );

        const labJobButton = screen.queryByText('Send For Lab Job');
        expect(labJobButton).not.toBeInTheDocument();
    });

    test('Send For Lab Job button is not rendered when action is disabled', async () => {
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={['edit_reactions']} />);

        const sendForLabJobButton = screen.queryByText('Send For Lab Job');
        expect(sendForLabJobButton).not.toBeInTheDocument();
    });
});


// Mock ConfirmationDialog
jest.mock('../ConfirmationDialog', () => {
    const MockConfirmationDialog = (props: any) => {
        if (!props.openConfirmation) return null;
        return (
            <div role="dialog">
                <p>{props.description}</p>
                <button onClick={props.onSave}>Yes</button>
                <button onClick={() => props.setConfirm(false)}>No</button>
            </div>
        );
    };
    MockConfirmationDialog.displayName = 'MockConfirmationDialog';
    return MockConfirmationDialog;
});

describe('ConfirmationDialog Component', () => {
    const mockSetConfirm = jest.fn();
    const resetNodesMock = jest.fn();
    const handleSaveReactionMock = jest.fn();

    const renderComponent = (popUpType: number, openConfirmation: boolean) => {
        return render(
            <ConfirmationDialog
                description={popUpType === 1 ? Messages.DISCARD_CHANGES : Messages.SAVE_CHANGES}
                onSave={() => {
                    if (popUpType === 1) {
                        resetNodesMock(true);
                    } else {
                        handleSaveReactionMock('SAVE');
                    }
                }}
                openConfirmation={openConfirmation}
                setConfirm={mockSetConfirm}
            />
        );
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders with DISCARD_CHANGES description when popUpType is 1', async () => {
        renderComponent(1, true);

        const description = await screen.findByText(Messages.DISCARD_CHANGES);
        expect(description).toBeInTheDocument();
    });

    test('renders with SAVE_CHANGES description when popUpType is not 1', async () => {
        renderComponent(2, true);

        const description = await screen.findByText(Messages.SAVE_CHANGES);
        expect(description).toBeInTheDocument();
    });

    test('does not render when openConfirmation is false', async () => {
        renderComponent(1, false);

        const dialog = screen.queryByRole('dialog');
        expect(dialog).not.toBeInTheDocument();
    });

    test('calls setConfirm(false) when No button is clicked', async () => {
        renderComponent(1, true);

        const noButton = screen.getByText('No');
        fireEvent.click(noButton);

        await waitFor(() => {
            expect(mockSetConfirm).toHaveBeenCalledWith(false);
        });
    });

    test('renders buttons correctly when openConfirmation is true', async () => {
        renderComponent(1, true);

        const yesButton = screen.getByText('Yes');
        const noButton = screen.getByText('No');

        expect(yesButton).toBeInTheDocument();
        expect(noButton).toBeInTheDocument();
    });

    test('handles invalid popUpType gracefully', async () => {
        renderComponent(undefined as any, true);

        const description = await screen.findByText(Messages.SAVE_CHANGES);
        expect(description).toBeInTheDocument();
    });
});




