import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderDetails from '../OrderDetails';
import { Messages } from '@/utils/message';

jest.mock('@/utils/message', () => ({
  Messages: {
    SUBMIT_ORDER: 'Molecules order submitted successfully'
  }
}));

describe('OrderDetails', () => {
  it('renders the order details with image, text, and button', () => {
    render(<OrderDetails closeOrderPopup={jest.fn()} />);
    const image = screen.getByAltText('Order Details');
    expect(image).toBeInTheDocument();
    const submitOrderText = screen.getByText(Messages.SUBMIT_ORDER);
    expect(submitOrderText).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls closeOrderPopup when the "Close" button is clicked', () => {
    const mockCloseOrderPopup = jest.fn(); // Mock the function
    render(<OrderDetails closeOrderPopup={mockCloseOrderPopup} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockCloseOrderPopup).toHaveBeenCalledTimes(1);
  });

  it('renders the image with the correct attributes ', () => {
    render(<OrderDetails closeOrderPopup={jest.fn()} />);
    const image = screen.getByAltText('Order Details');
    expect(image).toHaveAttribute('src', '/icons/Group8511.svg');
    expect(image).toHaveAttribute('width', '184');
    expect(image).toHaveAttribute('height', '154');
  });
});
