import { render, screen } from '@testing-library/react';
import SendMoleculesForSynthesis from '../SendMoleculesForSynthesis';


jest.mock("@/utils/MoleculeStructure", () => ({
    __esModule: true,
    default: () => <div>Molecule Structure Mock</div>,
}));

describe('SendMoleculesForSynthesis Component', () => {
    const mockMoleculeData = [
        {
            id:1,
            bookmark: true,
            order_id: 101,
            order_name: 'Order 101',
            molecule_id: 3,
            molecularWeight: 1.54,
            organizationName: '1',
            molecular_weight: '1.54',
            source_molecule_name: 'Molecule 3',
            smiles_string: 'C1CC3=CH2O',
            status: 1,
        },
    ];

    it('renders the component', () => {
        render(<SendMoleculesForSynthesis moleculeData={mockMoleculeData} />);

        expect(screen.getByText('4 of your selected molecules have already been sent for retrosynthesis')).toBeInTheDocument();
        expect(screen.getByText('Confirm')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

});
