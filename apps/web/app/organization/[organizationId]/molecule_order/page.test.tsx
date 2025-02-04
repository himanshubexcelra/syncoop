import { render, screen } from '@testing-library/react';
import MoleculeOrderCustomer from './page';
import { getUserData } from '@/utils/auth';
import { redirect } from 'next/navigation';
import MoleculeOrderPage from '@/components/MoleculeOrder/MoleculeOrder';

// Mock the external dependencies
jest.mock('@/utils/auth', () => ({
    getUserData: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    redirect: jest.fn(() => {
        throw new Error('Redirect');
    }),
}));

jest.mock('@/components/MoleculeOrder/MoleculeOrder', () => jest.fn(() => <div>MoleculeOrderPage</div>));
jest.mock('@/components/layout', () => jest.fn(({ children }) => <div>{children}</div>));

describe('MoleculeOrder Component', () => {
    const mockGetUserData = getUserData as jest.MockedFunction<typeof getUserData>;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('redirects to home if no session', async () => {
        // Mock getUserData to return null
        mockGetUserData.mockResolvedValue(null);

        // Expect the component to throw an error due to redirect
        await expect(MoleculeOrderCustomer({ params: { organizationId: '9' } })).rejects.toThrow('Redirect');

        // Assert redirect was called with '/'
        expect(redirect).toHaveBeenCalledWith('/');
    });

    it('renders MoleculeOrderPage with userData if session exists', async () => {
        const mockUserData = { name: 'John Doe', myRoles: ['researcher'] };
        const customerOrgId = 9;
        // Mock getUserData to return user data
        mockGetUserData.mockResolvedValue({
            userData: mockUserData,
            actionsEnabled: ['edit_reactions'],
            routesEnabled: ['/molecule_order'],
        });

        render(await MoleculeOrderCustomer({ params: { organizationId: '9' } }));
        // Use screen for queries
        expect(screen.getByText('MoleculeOrderPage')).toBeInTheDocument();


        // Assert MoleculeOrderPage was rendered with correct props
        expect(MoleculeOrderPage).toHaveBeenCalledWith(
            expect.objectContaining({
                userData: mockUserData,
                customerOrgId: customerOrgId,
                actionsEnabled: ['edit_reactions'],
            }),
            expect.anything()
        );

        // Assert that the rendered output contains the expected text
        expect(screen.getByText('MoleculeOrderPage')).toBeInTheDocument();
    });
});