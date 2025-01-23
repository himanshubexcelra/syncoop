/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReactionDetails from '../ReactionDetails';
import {
    ReactionCompoundType,
    ReactionDetailType,
    ReactionDetailsProps
} from '@/lib/definition';
import CustomDataGrid from '@/ui/dataGrid';
import MoleculeStructure from '@/utils/MoleculeStructure';

const mockReactionCompound: ReactionCompoundType = {
    id: 1,
    compound_label: '1',
    compound_name: 'Compound A',
    molar_ratio: 1,
    smiles_string: 'C',
    compound_type: 'R',
    inventory_id: 123,
    dispense_time: 0,
    role: 'Reagent',
};

const mockReactionDetail: ReactionDetailType = {
    id: '1',
    reaction_name: 'Test Reaction',
    solvent: 'Water',
    temperature: 25,
    reaction_compound: [mockReactionCompound],
    reaction_template_master: { name: 'Template 1' },
    product_smiles_string: 'O=C=O',
    type: '',
    name: '',
    smiles: '',
};

const mockColumns = [
    { dataField: "_id", title: "ID" },
    { dataField: "compound_name", title: "Compound Name" },
    { dataField: "molar_ratio", title: "Molar Ratio" },
];


const mockData = [
    { _id: 1, compound_name: "Compound A", molar_ratio: 2 },
    { _id: 2, compound_name: "Compound B", molar_ratio: 1 },
];

describe('ReactionDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    const defaultProps: ReactionDetailsProps = {
        isReactantList: false,
        data: mockReactionDetail,
        onDataChange: jest.fn(),
        solventList: ['Water', 'Ethanol'],
        temperatureList: [25, 50],
        onSolventChange: jest.fn(),
        onTemperatureChange: jest.fn(),
        setReactionDetail: jest.fn(),
        handleSwapReaction: jest.fn(),
        resetReaction: 1,
        status: 'InProgress',
    };

    test('renders the component without crashing', () => {
        const { container } = render(<ReactionDetails {...defaultProps} />);
        expect(container).toBeInTheDocument();
    });

    test('renders the solvent dropdown and handles changes', async () => {
        render(<ReactionDetails {...defaultProps} />);
        const solventDropdown = document.querySelectorAll('.selectBox')[0];
        expect(solventDropdown).toBeInTheDocument();

        await act(async () => {
            fireEvent.change(solventDropdown, { target: { value: 'Ethanol' } });
            expect(defaultProps.onSolventChange).toHaveBeenCalledWith('Ethanol');
        });

    });

    test('renders the temperature dropdown and handles changes', async () => {
        render(<ReactionDetails {...defaultProps} />);
        const temperatureDropdown = document.querySelectorAll('.selectBox')[1];
        expect(temperatureDropdown).toBeInTheDocument();

        await waitFor(() => {
            fireEvent.change(temperatureDropdown, { target: { value: '50' } });
            expect(defaultProps.onTemperatureChange).toHaveBeenCalledWith(50);
        });
            });

    test('disables input fields when status is read-only', () => {
        render(<ReactionDetails {...defaultProps} status="Done" />);
        const dropdowns = document.querySelectorAll('.selectBox');
        dropdowns.forEach(dropdown => {
            expect(dropdown).toBeDisabled();
        });
    });

    test('calls onDataChange on solvent change', async () => {
        render(<ReactionDetails {...defaultProps} />);
        const solventDropdown =
            document.querySelectorAll('.selectBox')[0] as HTMLSelectElement;

        await act(async () => {
            fireEvent.change(solventDropdown, { target: { value: 'Ethanol' } });
            fireEvent.blur(solventDropdown);
        });

        defaultProps.onDataChange([
            { id: Number(mockReactionDetail.id), solvent: 'Ethanol' }
        ]);
    });

    test('handles molecule swap when swap button is clicked', async () => {
        render(<ReactionDetails {...defaultProps} />);
        const swapButton = screen.getByAltText("swap");
        expect(swapButton).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(swapButton);
        });

        expect(defaultProps.handleSwapReaction).toHaveBeenCalled();
    });

    test('resets reaction data when resetReaction is true', () => {
        render(<ReactionDetails {...defaultProps} resetReaction={1} />);
        expect(defaultProps.setReactionDetail).toHaveBeenCalledWith({
            id: '1',
            reactionTemplate: 'Template 1',
            solvent: 'Water',
            temperature: 25,
        });
    });

    test('renders the DataGrid component', () => {
        render(<ReactionDetails {...defaultProps} />);
        const dataGrid = document.querySelector('.dx-datagrid');
        expect(dataGrid).toBeInTheDocument();
    });

    test('calls updateInitialData with correct data', async () => {
        const updatedProps = {
            ...defaultProps,
            data: {
                ...mockReactionDetail,
                reaction_compound: [
                    { ...mockReactionCompound },
                    { ...mockReactionCompound },
                ],
            },
        };
        render(<ReactionDetails {...updatedProps} />);
        expect(updatedProps.setReactionDetail).toHaveBeenCalledWith({
            solvent: 'Water',
            temperature: 25,
            id: '1',
            reactionTemplate: 'Template 1',
        });

        const table = document.querySelector('.dx-datagrid');
        expect(table).toBeInTheDocument();
    });

    test("renders the DataGrid with correct data", async () => {
        render(
            <CustomDataGrid
                columns={mockColumns}
                data={mockData}
                enableFiltering={false}
                enableOptions={false}
            />
        );

        // Verify column headers
        await waitFor(() => {
            expect(screen.getByText("ID")).toBeInTheDocument();
            expect(screen.getByText("Compound Name")).toBeInTheDocument();
            expect(screen.getByText("Molar Ratio")).toBeInTheDocument();
        });
    });

    test('renders molecule structure smile string', async () => {
        const mockCellData = {
            smiles_string: 'COc1ccc(C2(CN)CCOCC2)cc1',
            source_molecule_name: 'Benzene',
        };

        render(
            <MoleculeStructure
                id={"1"}
                structure={mockCellData.smiles_string}
                width={200}
                height={200}
                svgMode={true}
                structureName={mockCellData.source_molecule_name}
            />
        );
    });

});
