import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RenderCreateUser from '../createUser';
import { createUser } from '../service';
import { getOrganization } from "../../Organization/service";
import { generatePassword } from "@/utils/helpers";

// Mock the services and utilities
const mockCreateUser = createUser as jest.Mock;
const mockGetOrganization = getOrganization as jest.Mock;
const mockGeneratePassword = generatePassword as jest.Mock;
const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });

jest.mock('@/components/User/service', () => ({
    createUser: jest.fn(),
}));

jest.mock('@/components/Organization/service', () => ({
    getOrganization: jest.fn(),
}));

jest.mock('@/utils/helpers', () => ({
    generatePassword: jest.fn(),
    delay: jest.fn(),
}));

const mockClipboard = {
    writeText: jest.fn(() => Promise.resolve())
};
Object.assign(navigator, {
    clipboard: mockClipboard
});

const mockInstance = {
    option: mockOption,
    reset: jest.fn(),
    validate: jest.fn(() => ({ isValid: true })),
    // updateData: jest.fn(),
    // getEditor: jest.fn(() => ({
    //     option: jest.fn(),
    //     repaint: jest.fn(),
    // })),
};

const mockFormRef = {
    current: {
        instance: () => mockInstance,
    },
};
describe('RenderCreateUser Component', () => {
    const mockSetCreatePopupVisibility = jest.fn();
    const mockSetTableData = jest.fn();
    const mockFetchAndFilterData = jest.fn();

    const defaultProps = {
        setCreatePopupVisibility: mockSetCreatePopupVisibility,
        setTableData: mockSetTableData,
        formRef: mockFormRef,
        tableData: [],
        roles: [{ id: 1, name: 'Admin' }],
        organizationData: [{ id: 1, name: 'Test Org' }],
        myRoles: ['admin'],
        type: 'internal',
        fetchAndFilterData: mockFetchAndFilterData,
        customerOrgId: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateUser.mockResolvedValue({ status: 200, data: {} });
        mockGetOrganization.mockResolvedValue([{ id: 1, name: 'Test Org' }]);
        mockGeneratePassword.mockReturnValue('TestPassword123!');
        mockClipboard.writeText.mockImplementation(() => Promise.resolve());
        mockFormRef.current = {
            instance: jest.fn(() => mockInstance) // Set instance to return mockInstance
        };
    });

    test('renders form with all required fields', () => {
        render(<RenderCreateUser {...defaultProps} />);

        expect(screen.getByLabelText(/user email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/roles/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select an organization/i)).toBeInTheDocument();
    });

    test('handles password generation', async () => {
        render(<RenderCreateUser {...defaultProps} />);

        const generateButton = screen.getByText(/generate/i);
        fireEvent.click(generateButton);

        await waitFor(() => {
            expect(mockGeneratePassword).toHaveBeenCalled();
            expect(mockClipboard.writeText).toHaveBeenCalledWith('TestPassword123!');
        });
    });

    test('handles form cancellation', () => {
        render(<RenderCreateUser {...defaultProps} />);

        const cancelButton = screen.getByText(/cancel/i);
        fireEvent.click(cancelButton);

        // expect(mockInstance.reset).toHaveBeenCalled();
        expect(mockSetCreatePopupVisibility).toHaveBeenCalledWith(false);
    });

    test('handles password copy functionality', async () => {
        render(<RenderCreateUser {...defaultProps} />);

        const copyIcon = screen.getByAltText(/copy/i);

        // Test empty password case
        fireEvent.click(copyIcon);
        await waitFor(() => {
            expect(mockClipboard.writeText).not.toHaveBeenCalled();
        });

        // Generate the password first
        const generateButton = screen.getByText(/generate/i);
        fireEvent.click(generateButton);

        // Now the password should be set
        await waitFor(() => {
            expect(mockClipboard.writeText).toHaveBeenCalledWith('TestPassword123!');
        });

        // Now test copying the password
        fireEvent.click(copyIcon);
        await waitFor(() => {
            expect(mockClipboard.writeText).toHaveBeenCalledWith('TestPassword123!');
        });
    });

    test('handles organization selection for admin users', async () => {
        render(<RenderCreateUser {...defaultProps} />);

        const organizationSelect = screen.getByLabelText(/select an organization/i);
        fireEvent.click(organizationSelect);

        await waitFor(() => {
            expect(mockGetOrganization).toHaveBeenCalledWith({ type: 'internal' });
        });
    }, 60000);

});