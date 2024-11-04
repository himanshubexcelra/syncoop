describe("Molecule Orders", () => {
  test("renders the Molecule Orders page", () => { });
});
import { render, screen } from '@testing-library/react';
import MoleculeOrder from '@/app/molecule_order/page';
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
    await expect(MoleculeOrder()).rejects.toThrow('Redirect');

    // Assert redirect was called with '/'
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('renders MoleculeOrderPage with userData if session exists', async () => {
    const mockUserData = { name: 'John Doe' };

    // Mock getUserData to return user data
    mockGetUserData.mockResolvedValue({
      userData: mockUserData,
      actionsEnabled: true,
      routesEnabled: true,
    });

    render(await MoleculeOrder());
    // Use screen for queries
    expect(screen.getByText('MoleculeOrderPage')).toBeInTheDocument();


    // Assert MoleculeOrderPage was rendered with correct props
    expect(MoleculeOrderPage).toHaveBeenCalledWith(
      expect.objectContaining({ userData: mockUserData }),
      expect.anything()
    );

    // Assert that the rendered output contains the expected text
    expect(screen.getByText('MoleculeOrderPage')).toBeInTheDocument();
  });
});