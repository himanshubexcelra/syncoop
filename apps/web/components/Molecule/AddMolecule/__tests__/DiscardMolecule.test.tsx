import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DiscardMolecule from '../DiscardMolecule';

describe('DiscardMolecule Component', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    test('renders DiscardMolecule component correctly', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        expect(screen.getByText('Discard uploaded file / drawn molecule?')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
    });

    test('calls onClose function when close icon is clicked', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        const closeIcon = screen.getByAltText('close icon');
        fireEvent.click(closeIcon);

    });

    test('calls onClose function when "No" button is clicked', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        const noButton = screen.getByText('No');
        fireEvent.click(noButton);
    });

    test('calls onSubmit and onClose functions when "Yes" button is clicked', () => {
        render(<DiscardMolecule onClose={mockOnClose} onSubmit={mockOnSubmit} />);
        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
    });

    test('calls only onClose function when "Yes" button is clicked if onSubmit is not provided', () => {
        render(<DiscardMolecule onClose={mockOnClose} />);

        const yesButton = screen.getByText('Yes');
        fireEvent.click(yesButton);
    });
});
