import { render, act, screen, fireEvent } from '@testing-library/react';
import { AppContext } from "@/app/AppState";
import EditOrganization from '../editOrganization';
import { editOrganization } from '../service';
import toast from 'react-hot-toast';
import { Messages } from '@/utils/message';

const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });
const mockReset = jest.fn();
const mockValidate = jest.fn().mockReturnValue({ isValid: true, check: 'jhgff' });
const fetchOrganizations = jest.fn();
const showEditPopup = jest.fn();
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    remove: jest.fn(),
    error: jest.fn(),
}));

jest.mock('@/utils/helpers', () => ({
    delay: jest.fn(() => Promise.resolve()), // Mocking the delay function to return a resolved promise
}));

const mockInstance = {
    option: mockOption,
    reset: mockReset,
    validate: mockValidate,
};

jest.mock('@/components/Organization/service', () => ({
    getOrganization: jest.fn(),
    getOrganizationById: jest.fn(),
    createOrganization: jest.fn(),
    getFilteredRoles: jest.fn(),
    editOrganization: jest.fn()
}));

const mockFormRef = {
    current: {
        instance: () => mockInstance,
    },
};
const organizationData = {
    id: 5,
    name: "TestOrg",
    email_id: "TestOrg@gmail.com",
    is_active: true,
    orgUser: [],
    metadata: {
        functionalAssay1: '',
        functionalAssay2: '',
        functionalAssay3: '',
        functionalAssay4: '',
    },
    owner_id: 6,
    type: "CO",
    inherits_configuration: false,
};
const addToState = jest.fn();
describe('Edit Organization should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    beforeAll(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn().mockResolvedValue(true),
            },
            writable: true,
        });
    });
    const mockContextValue = {
        state: {
            appContext: {
                userCount: {
                    externalUsers: 0,
                    internalUsers: 0
                },
                refreshAssayTable: false,
                refreshUsersTable: false,
                refreshCart: false
            }
        }, addToState: addToState
    }
    
    test('edit organization works as expected with valid data', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <AppContext.Provider value={mockContextValue}>

                    <EditOrganization
                        showEditPopup={showEditPopup}
                        formRef={mockFormRef}
                        fetchOrganizations={fetchOrganizations}
                        loggedInUser={1}
                        editPopup={true}
                        organizationData={organizationData}
                    />
                </AppContext.Provider>
            );
        });
        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(updateButton) });
        const mockMessage = Messages.UPDATE_ORGANIZATION;
        expect(toast.success).toHaveBeenCalledWith(mockMessage);
    })
    test('edit organization works as expected with invalid data', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <AppContext.Provider value={mockContextValue}>

                    <EditOrganization
                        showEditPopup={showEditPopup}
                        formRef={mockFormRef}
                        fetchOrganizations={fetchOrganizations}
                        loggedInUser={1}
                        editPopup={true}
                        organizationData={organizationData}
                    />
                </AppContext.Provider>
            );
        });
        const mockResponse = { error: 'Some error' };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(updateButton) });
        expect(toast.error).toHaveBeenCalledWith(`${mockResponse.error}`);
    })
    test('cancel button resets form and closes popup', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockContextValue}>

                    <EditOrganization
                        showEditPopup={showEditPopup}
                        formRef={mockFormRef}
                        fetchOrganizations={fetchOrganizations}
                        loggedInUser={1}
                        editPopup={true}
                        organizationData={organizationData}
                    />
                </AppContext.Provider>
            );
        });
        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(cancelButton) });

        expect(showEditPopup).toHaveBeenCalledWith(false);
        expect(mockFormRef.current.instance().reset);
    });
})