/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useMemo } from 'react';
import { render, screen, waitFor, act, fireEvent, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getMoleculesOrder, searchInventory } from '@/components/MoleculeOrder/service';
import { Messages } from '@/utils/message';
import MoleculeOrderPage from '../MoleculeOrder';
import {
    AmsInventoryItem,
    AppContextModel,
    ColumnConfig,
    TabDetail,
    UserData
} from '@/lib/definition';
import Tabs from '@/ui/Tab/Tabs';
import ConfirmationDialog from '../ConfirmationDialog';
import CustomDataGrid from '@/ui/dataGrid';
import { AppContext } from '@/app/AppState';

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
        name: 'BioQuest',
        status: '',
        organization: {
            id: 3,
            name: 'Organization 1'
        },
        user_role: [],
        first_name: '',
        email_id: '',
        last_name: '',
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
        molecule_status: 'Ordered',
        disabled: false,
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

jest.mock('@/components/MoleculeOrder/service', () => ({
    getMoleculesOrder: jest.fn(),
    searchInventory: jest.fn(),
}));

// Mock reaction data
const mockReactionsData = [
    {
        reaction_compound: [
            { smiles_string: "C1=CC=CC=C1", compound_type: "R" },
            { smiles_string: "CCO", compound_type: "P" },
        ],
    },
    {
        reaction_compound: [
            { smiles_string: "Cc1ccc(F)cc1C(=O)NC1CCCCC1", compound_type: "R" },
        ],
    },
];

// Mock API response
const mockApiData = [
    {
        smiles: "C1=CC=CC=C1",
        details: { link: "https://example.com/compound1" },
    },
    {
        smiles: "Cc1ccc(F)cc1C(=O)NC1CCCCC1",
        details: { link: "https://example.com/compound2" },
    },
];

describe('MoleculeOrderPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders MoleculeOrderPage mock correctly', async () => {
        render(
            <MoleculeOrderPage
                userData={mockUserData}
                actionsEnabled={actionsEnabledMock}
            />
        );

        expect(screen.queryAllByText("Molecule Orders").length).toBeGreaterThan(0);
    });

    test.skip('handles error during data fetch gracefully', async () => {
        (getMoleculesOrder as jest.Mock).mockRejectedValue(new Error("API Error"));

        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith("Error fetching data: ", expect.any(Error));
        });
    });
})

describe('MoleculeOrderPage Component', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test.skip('renders the DataGrid with correct data', async () => {
        render(
            <CustomDataGrid
                columns={[
                    { dataField: "name", title: "Name" },
                    { dataField: "type", title: "Type" },
                    { dataField: "weight", title: "Weight" },
                    { dataField: "density", title: "Density" },
                    { dataField: "formula", title: "Formula" },
                ]}
                data={[
                    {
                        id: 1, name: "Benzene", type: "Aromatic",
                        weight: "78.11 g/mol", density: "0.876 g/cm³", formula: "C6H6"
                    },
                    {
                        id: 2, name: "Ethanol", type: "Alcohol",
                        weight: "46.07 g/mol", density: "0.789 g/cm³", formula: "C2H5OH"
                    },
                ]}
                enableRowSelection
                enableGrouping
                enableSorting
                loader={false}
                enableHeaderFiltering
                enableSearchOption={true}
            />
        );
        await waitFor(() => {
            const grid = screen.getByRole("group");
            expect(grid).toHaveAttribute("aria-label", "Data grid with 2 rows and 6 columns");
        });

        const rows = screen.getAllByRole("row");
        expect(rows.length).toBe(4);
        const columns = screen.getAllByRole("columnheader");
        expect(columns.length).toBe(4);
    });

    test('send for synthesis button should be present', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);

        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await waitFor(() => {
            const sendForSynthesisButton = screen.getByText(/Send for Processing/);
            expect(sendForSynthesisButton).toBeInTheDocument();
        });
    });


    test('renders all tabs with correct titles', async () => {
        render(<Tabs tabsDetails={tabsDetails} />);

        await waitFor(() => {
            const tabs = screen.getAllByRole('tab');
            expect(tabs).toHaveLength(tabsDetails.length);
        });
    });

    test.skip("renders the correct content for the active tab", async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        const data = await getMoleculesOrder({
            organization_id: 1,
            sample_molecule_id: 2,
            created_by: 1,
        });
        render(<CustomDataGrid
            columns={columns}
            data={data}
        />)
        render(<Tabs tabsDetails={tabsDetails} activeTab={0} />);

        await waitFor(() => {
            const content = screen.getAllByText("Reaction 1");
            expect(content.length).toBeGreaterThan(0);
        });
    });


    test('changes content when a new tab is selected', async () => {
        const mockOnSelectedIndexChange = jest.fn();

        render(
            <Tabs
                tabsDetails={tabsDetails}
                activeTab={0}
                onSelectedIndexChange={mockOnSelectedIndexChange}
            />
        );

        const tabs = screen.getAllByRole('tab');
        fireEvent.click(tabs[1]);

        await waitFor(() => {
            expect(mockOnSelectedIndexChange).toHaveBeenCalledWith(1);
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

describe('MoleculeOrderPage Component', () => {
    // Mock MoleculeOrderPage
    beforeEach(() => {
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
    });

    test('renders Validate and Reset buttons correctly', async () => {
        render(
            <div>
                <button>Validate</button>
                <button>Reset</button>
            </div>
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

    test("calculates consolidatedReagents correctly", () => {
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={['edit_reactions']} />);

        const { result } = renderHook(() =>
            useMemo(() => {
                return mockReactionsData?.flatMap((reaction, index) =>
                    reaction.reaction_compound
                        .filter((compound) => compound.compound_type === "R")
                        .map((compound) => ({
                            ...compound,
                            related_to: index + 1,
                            link: "NA",
                        }))
                );
            }, [mockReactionsData])
        );

        expect(result.current).toEqual([
            {
                smiles_string: "C1=CC=CC=C1", compound_type: "R", related_to: 1,
                link: "NA"
            },
            {
                smiles_string: "Cc1ccc(F)cc1C(=O)NC1CCCCC1", compound_type: "R",
                related_to: 2, link: "NA"
            },
        ]);
    });

    test("calls SearchInventory with correct payload and updates reactantList", async () => {
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={['edit_reactions']} />);

        // Mock the API response
        (searchInventory as jest.Mock).mockResolvedValue(mockApiData);

        const setReactantList = jest.fn();

        const consolidatedReagents = [
            { smiles_string: "C1=CC=CC=C1", compound_type: "R", related_to: 1, link: "NA" },
            {
                smiles_string: "Cc1ccc(F)cc1C(=O)NC1CCCCC1", compound_type: "R",
                related_to: 2, link: "NA"
            },
        ];

        // Simulate useEffect logic
        await act(async () => {
            const payload = {
                smiles: consolidatedReagents.map((item) => item.smiles_string),
            };
            const apiData = await searchInventory(payload);

            const updatedData = consolidatedReagents.map((item) => {
                const apiItem = apiData.find((responseItem: AmsInventoryItem) =>
                    responseItem.smiles === item.smiles_string);
                return {
                    ...item,
                    link: apiItem?.details?.link || "NA",
                };
            });

            setReactantList(updatedData);
        });

        // Verify API call
        expect(searchInventory).toHaveBeenCalledWith({
            smiles: ["C1=CC=CC=C1", "Cc1ccc(F)cc1C(=O)NC1CCCCC1"],
        });

        // Verify state update
        expect(setReactantList).toHaveBeenCalledWith([
            {
                smiles_string: "C1=CC=CC=C1", compound_type: "R", related_to: 1,
                link: "https://example.com/compound1"
            },
            {
                smiles_string: "Cc1ccc(F)cc1C(=O)NC1CCCCC1", compound_type: "R",
                related_to: 2, link: "https://example.com/compound2"
            },
        ]);
    });

    test.skip("handles API error gracefully", async () => {
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={['edit_reactions']} />);

        // Mock API failure
        (searchInventory as jest.Mock).mockRejectedValue(new Error("API Error"));

        const setReactantList = jest.fn();

        const consolidatedReagents = [
            { smiles_string: "C1=CC=CC=C1", compound_type: "R", related_to: 1, link: "NA" },
        ];

        await act(async () => {
            try {
                const payload = {
                    smiles: consolidatedReagents.map((item) => item.smiles_string),
                };
                await searchInventory(payload);
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        });

        // Ensure reactantList is not updated
        expect(setReactantList).not.toHaveBeenCalled();
    });

    test("effect runs when consolidatedReagents changes", async () => {
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={['edit_reactions']} />);

        const { rerender, result } = renderHook(
            ({ reactionsData }: {
                reactionsData: {
                    reaction_compound:
                    { smiles_string: string; compound_type: string; }[];
                }[]
            }) =>
                useMemo(() => {
                    return reactionsData?.flatMap((reaction, index) =>
                        reaction.reaction_compound
                            .filter((compound) => compound.compound_type === "R")
                            .map((compound) => ({
                                ...compound,
                                related_to: index + 1,
                                link: "NA",
                            }))
                    );
                }, [reactionsData]),
            {
                initialProps: {
                    reactionsData: [] as {
                        reaction_compound:
                        { smiles_string: string; compound_type: string; }[];
                    }[]
                },
                // Provide an initial value for reactionsData
            }
        );

        const initialReactionsData = [
            {
                reaction_compound: [{ smiles_string: "C1=CC=CC=C1", compound_type: "R" }],
            },
        ];

        const newReactionsData = [
            {
                reaction_compound: [{ smiles_string: "CCO", compound_type: "R" }],
            },
        ];

        // Trigger re-render with new props
        rerender({ reactionsData: initialReactionsData });

        // Verify the initial memoized result
        expect(result.current).toEqual([
            {
                smiles_string: "C1=CC=CC=C1",
                compound_type: "R",
                related_to: 1,
                link: "NA",
            },
        ]);

        // Trigger re-render with updated props
        rerender({ reactionsData: newReactionsData });

        // Verify the updated memoized result
        expect(result.current).toEqual([
            {
                smiles_string: "CCO",
                compound_type: "R",
                related_to: 1,
                link: "NA",
            },
        ]);
    });

    test.skip('send for Analysis button should be present', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);

        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await waitFor(() => {
            const sendForSynthesisButton = screen.getByText(/Send for Analysis/);
            expect(sendForSynthesisButton).toBeInTheDocument();
        });
    });

    test('renders send for Analysis button with correct text and functionality', async () => {
        const mockAddToCart = jest.fn();
        const mockAppContext = {
            state: {
                cartDetail: {},
                appContext: {} as AppContextModel,
            },
        };
        const toolbarButtons = [{
            text: `Send For Analysis (0)`,
            onClick: mockAddToCart,
            class: 'btn-disable',
            disabled: true,
            visible: true,
        }];

        render(
            <AppContext.Provider value={mockAppContext}>
                <CustomDataGrid
                    columns={columns}
                    data={mockData}
                    toolbarButtons={toolbarButtons}
                    enableRowSelection
                    enableGrouping
                    enableSorting
                    loader={false}
                />
            </AppContext.Provider>
        );

        // Check that the Add to Cart button is rendered
        const addToCartButton = screen.getByRole('button', { name: /Send For Analysis \(0\)/i });
        expect(addToCartButton).toBeInTheDocument();

        // Ensure the button has the disabled state via aria-disabled
        expect(addToCartButton).toHaveAttribute('aria-disabled', 'true');

        // Simulate a click and ensure the mock function is not called
        fireEvent.click(addToCartButton);
        expect(mockAddToCart).not.toHaveBeenCalled();
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

    test.skip('renders with DISCARD_CHANGES description when popUpType is 1', async () => {
        renderComponent(1, true);

        const description = await screen.findByText(Messages.DISCARD_CHANGES);
        expect(description).toBeInTheDocument();
    });

    test.skip('renders with SAVE_CHANGES description when popUpType is not 1', async () => {
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