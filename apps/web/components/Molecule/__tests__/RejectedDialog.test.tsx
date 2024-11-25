import { render, screen, fireEvent } from '@testing-library/react';
import RejectedDialog from '../AddMolecule/RejectedDialog';
import { downloadCSV } from '../file';
import { RejectedMolecules } from '@/lib/definition';

jest.mock('../file', () => ({
    downloadCSV: jest.fn(),
}));

describe('RejectedDialog Component', () => {
    const mockOnClose = jest.fn();
    const rejectedMoleculesMock: RejectedMolecules[] = [
        { smiles: 'C1=CC=CC=C1', reason: 'Invalid structure' },
        { smiles: 'C1CCCCC1', reason: 'Low confidence' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Render rejected Dialog', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMoleculesMock} />);
        const closeIcon = screen.getByAltText('close icon');
        expect(closeIcon).toBeInTheDocument();
        expect(screen.getByText('Rejected Molecules')).toBeInTheDocument();
    });

    test('Close popup on close Icon', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMoleculesMock} />);

        const closeIcon = screen.getByAltText('close icon');
        fireEvent.click(closeIcon);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('Download rejected smiles', () => {
        render(<RejectedDialog onClose={mockOnClose} rejected={rejectedMoleculesMock} />);

        const downloadButton = screen.getByText('Download List');
        fireEvent.click(downloadButton);

        expect(downloadCSV).toHaveBeenCalledWith(
            { smiles: 'SMILE', reason: 'Reason' },
            rejectedMoleculesMock,
            'rejected_smiles'
        );
    });
});
