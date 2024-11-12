import { render, screen } from '@testing-library/react';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';

describe('DiscardMolecule Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Render Discard popup with close icon', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);
        const closeIcon = screen.getByAltText('close icon');
        expect(closeIcon).toBeInTheDocument();
        expect(screen.getByText('Discard uploaded file / drawn molecule?')).toBeInTheDocument();
    });

    test('Render action buttons', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        const yesButton = screen.getByText('Yes');
        const noButton = screen.getByText('No');

        expect(yesButton).toBeInTheDocument();
        expect(noButton).toBeInTheDocument();
    });
});
