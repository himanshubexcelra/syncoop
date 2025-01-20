import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderDetails from '../OrderDetails';

describe('OrderDetails Component', () => {
    it('should render the component with the provided message', () => {
        const mockCloseOrderPopup = jest.fn();
        const testMessage = 'Order placed successfully!';
        render(<OrderDetails closeOrderPopup={mockCloseOrderPopup} msg={testMessage} />);
        const image = screen.getByAltText('Order Details');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/icons/Group8511.svg');
        const message = screen.getByText(testMessage);
        expect(message).toBeInTheDocument();
        const button = screen.getByRole('button', { name: /close/i });
        expect(button).toBeInTheDocument();
    });

    it('should call closeOrderPopup when the Close button is clicked', () => {
        const mockCloseOrderPopup = jest.fn();
        const testMessage = 'Order placed successfully!';

        render(<OrderDetails closeOrderPopup={mockCloseOrderPopup} msg={testMessage} />);

        const button = screen.getByRole('button', { name: /close/i });
        fireEvent.click(button);
        expect(mockCloseOrderPopup).toHaveBeenCalledTimes(1);
    });
});