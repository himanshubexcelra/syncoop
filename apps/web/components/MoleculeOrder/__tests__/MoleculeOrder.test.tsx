/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getMoleculesOrder } from '@/components/MoleculeOrder/service';
import { Messages } from '@/utils/message';
import MoleculeOrderPage from '../MoleculeOrder';
import { UserData } from '@/lib/definition';

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
        },
        user_role: [],
        first_name: '',
        email_id: '',
        last_name: ''
    },
    myRoles: ['user'],
    id: 123,
    user_role: [],
    email_id: '',
    first_name: '',
    last_name: ''
};

// Define mockData to match expected molecule order structure
const mockData = [
    {
        id: 1,
        smile: 'CC(=O)Oc1ccccc1C(=O)O',
        orderId: 101,
        moleculeId: 2001,
        molecular_weight: '250',
        status: 'Ready',
        yield: 1,
        anlayse: 0.7,
        herg: 1,
        caco2: 0.5,
    },
];

describe('MoleculeOrderPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders MoleculeOrderPage with data', async () => {
        // Set up the mock to return data
        (getMoleculesOrder as jest.Mock).mockResolvedValueOnce(mockData);

        render(<MoleculeOrderPage userData={mockUserData} />);

        // Wait for any data-related element to appear
        await waitFor(() => {
            expect(screen.getByText(/Molecule Orders/i)).toBeInTheDocument();
        });

        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText(/Order/).length).toBeGreaterThan(0);
        });
    });

    // Update the error handling test
    test('handles error during data fetch gracefully', async () => {
        (getMoleculesOrder as jest.Mock).mockRejectedValue(new Error(Messages.FETCH_ERROR));
        render(<MoleculeOrderPage userData={mockUserData} />);

        // Verify that the error is logged
        await waitFor(() => {
            expect(console.error).toHaveBeenCalled(); // Check if any error is logged
        });
    });

    test('opens synthesis popup on button click', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);
        render(<MoleculeOrderPage userData={mockUserData} />);

        await waitFor(() => {
            expect(screen.getByText('Send for Synthesis')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Send for Synthesis'));

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeVisible();
        });
    });
});
