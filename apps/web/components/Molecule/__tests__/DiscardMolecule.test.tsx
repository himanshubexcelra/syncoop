import { render, screen, fireEvent } from '@testing-library/react';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';

describe('DiscardMolecule Component', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

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

    test('Close popup', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        const closeIcon = screen.getByAltText('close icon');
        fireEvent.click(closeIcon);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('Invoke onClose when No is clicked', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        const noButton = screen.getByText('No');
        fireEvent.click(noButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('Invoke on submit when yes is clicked', () => {
        render(<DiscardMolecule onClose={mockOnClose}  onSubmit={mockOnSubmit}/>);

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
});
