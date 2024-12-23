/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
            name: 'Organization 1'
        },
        user_role: [],
        first_name: '',
        email_id: '',
        last_name: ''
    },
    roles: [{ type: 'org_admin' }],
    myRoles: ['user'],
    id: 123,
    user_role: [],
    email_id: '',
    first_name: '',
    last_name: ''
};
const actionsEnabledMock = [
    "view_molecule_order"
]

// Define mockData to match expected molecule order structure
const mockData = [
    {
        id: 1,
        smile: 'CC(=O)Oc1ccccc1C(=O)O',
        order_id: 101,
        molecule_id: 2001,
        molecular_weight: '250',
        status: 'Ordered',
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

    test.skip('renders MoleculeOrderPage with data', async () => {
        // Set up the mock to return data
        (getMoleculesOrder as jest.Mock).mockResolvedValueOnce(mockData);

        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText(/Molecule Orders/i).length).toBeGreaterThan(0);
        });

        // Optionally, confirm that data content is present in any form
        await waitFor(() => {
            expect(screen.queryAllByText(/Order/).length).toBeGreaterThan(0);
        });
    });

    // Update the error handling test
    test.skip('handles error during data fetch gracefully', async () => {
        (getMoleculesOrder as jest.Mock).mockRejectedValue(new Error(Messages.FETCH_ERROR));
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        // Verify that the error is logged
        await waitFor(() => {
            expect(console.error).toHaveBeenCalled(); // Check if any error is logged
        });
    });

    test.skip('opens synthesis popup should be present', async () => {
        (getMoleculesOrder as jest.Mock).mockResolvedValue(mockData);
        render(<MoleculeOrderPage userData={mockUserData} actionsEnabled={actionsEnabledMock} />);

        await waitFor(() => {
            expect(screen.getByText('Send for Retrosynthesis (0)')).toBeInTheDocument();
        });
    });
});