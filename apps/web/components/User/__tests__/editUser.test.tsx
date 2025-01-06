import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RenderEditUser from '../editUserDetails';
import { getUsers, editUser, deleteUserData } from '../service';
import { getOrganization } from "../../Organization/service";
import { getFilteredRoles } from "../../Role/service";
import { Messages } from '@/utils/message';

const mockGetUsers = getUsers as jest.Mock;
const mockEditUser = editUser as jest.Mock;
const mockDeleteUserData = deleteUserData as jest.Mock;
const mockGetFilteredRoles = getFilteredRoles as jest.Mock;
const mockGetOrganization = getOrganization as jest.Mock;

jest.mock('@/components/User/service', () => ({
    getUsers: jest.fn(),
    editUser: jest.fn(),
    deleteUserData: jest.fn(),
}));
jest.mock('@/components/Role/service', () => ({
    getFilteredRoles: jest.fn(),
}));
jest.mock('@/components/Organization/service', () => ({
    getOrganization: jest.fn(),
}));

const mockInstance = {
    option: jest.fn(),
    reset: jest.fn(),
    validate: jest.fn(() => ({ isValid: true }))
};

const mockFormRef = {
    current: {
        instance: jest.fn(() => mockInstance)
    }
};

describe('RenderEditUser Component', () => {
    const mockSetCreatePopupVisibility = jest.fn();
    const mockFetchData = jest.fn();

    const tableData = {
        "id": 10,
        "title": null,
        "first_name": "User System",
        "last_name": "Admin",
        "email_id": "sys_admin@external.milliporesigma.com",
        "password_hash": "$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm",
        "primary_contact_id": null,
        "timezone_id": null,
        "number_datetime_format_id": null,
        "image_url": null,
        "organization_id": "11",
        "is_active": true,
        "created_at": "2024-12-06T15:23:30.292Z",
        "created_by": null,
        "updated_at": null,
        "updated_by": null,
        "orgUser": {
            "id": "11",
            "name": "EMD DD",
            "type": "O"
        },
        "user_role": [
            {
                "id": 13,
                "role_id": 6,
                "role": {
                    "name": "System Admin",
                    "type": "admin"
                }
            }
        ],
        "owner": [
            {
                "id": "14",
                "name": "Test"
            },
            {
                "id": "16",
                "name": "Test22"
            },
            {
                "id": "17",
                "name": "check22"
            }
        ],
        "organization": "11",
        "roles": [6]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetUsers.mockResolvedValue([]);
        mockGetFilteredRoles.mockResolvedValue([{ id: 6, name: 'System Admin' }]);
        mockGetOrganization.mockResolvedValue([{ id: 11, name: 'EMD DD' }]);
        mockEditUser.mockResolvedValue({ status: 200 });
        mockDeleteUserData.mockResolvedValue({});

        // Reset mock function calls
        mockSetCreatePopupVisibility.mockClear();
        mockFetchData.mockClear();
        mockInstance.validate.mockClear();
    });

    test('renders form with initial data', async () => {
        render(
            <RenderEditUser
                setCreatePopupVisibility={mockSetCreatePopupVisibility}
                formRef={mockFormRef}
                tableData={tableData}
                fetchData={mockFetchData}
                type="internal"
                myRoles={['admin']}
                isMyProfile={false}
                customerOrgId={null}
                allUsers={[]}
                Messages={Messages}
            />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        const lastNameInput = screen.getByLabelText(/last name/i);
        const emailInput = screen.getByLabelText(/user email address/i);

        expect(firstNameInput).toHaveValue('User System');
        expect(lastNameInput).toHaveValue('Admin');
        expect(emailInput).toHaveValue('sys_admin@external.milliporesigma.com');
    });

    test('submits the form successfully when valid', async () => {
        render(
            <RenderEditUser
                setCreatePopupVisibility={mockSetCreatePopupVisibility}
                formRef={mockFormRef}
                tableData={tableData}
                fetchData={mockFetchData}
                type="internal"
                myRoles={['admin']}
                isMyProfile={false}
                customerOrgId={null}
                allUsers={[]}
                Messages={Messages}
            />
        );

        const submitButton = screen.getByText(/update/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockEditUser).toHaveBeenCalledWith({
                first_name: 'User System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com',
                organization: "11",
                roles: [6],
                primary_contact_id: null,
                is_active: true,
            });
            expect(mockSetCreatePopupVisibility).toHaveBeenCalledWith(false);
            expect(mockFetchData).toHaveBeenCalledTimes(1);
        });
    });

    test('calls cancel handler when cancel button is clicked', () => {
        render(
            <RenderEditUser
                setCreatePopupVisibility={mockSetCreatePopupVisibility}
                formRef={mockFormRef}
                tableData={tableData}
                fetchData={mockFetchData}
                type="internal"
                myRoles={['admin']}
                isMyProfile={false}
                customerOrgId={null}
                allUsers={[]}
                Messages={Messages}
            />
        );

        const cancelButton = screen.getByText(/cancel/i);
        fireEvent.click(cancelButton);

        expect(mockSetCreatePopupVisibility).toHaveBeenCalledWith(false);
    });
});