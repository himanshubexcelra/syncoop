/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { AppContext } from "@/app/AppState";
import { createOrganization } from '../service';
import RenderCreateOrganization from '../createOrganization';
import { Messages } from '@/utils/message';

const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });
const mockReset = jest.fn();
const mockValidate = jest.fn().mockReturnValue({ isValid: true, check: 'jhgff' });
const fetchOrganizations = jest.fn();
const setCreatePopupVisibility = jest.fn();

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
}));

// Mock the formRef
const mockFormRef = {
    current: {
        instance: () => mockInstance,
    },
};

const addToState = jest.fn();

describe('Create Organization should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    beforeAll(() => {
        // Mock the clipboard API
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn().mockResolvedValue(true),
            },
            writable: true,
        });
    });

    test('create organization works as expected with valid data', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <AppContext.Provider value={{
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
                }}>

                    <RenderCreateOrganization
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        formRef={mockFormRef}
                        fetchOrganizations={fetchOrganizations}
                        created_by={1}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (createOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('Enter new organization name');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                value: 'Test Org'
            })
        });
        fireEvent.change(inputField, { target: { value: 'Test Org' } });

        // Trigger blur event (user loses focus)
        fireEvent.blur(inputField);

        // Wait for the DOM to update
        await waitFor(() => {
            // Validate the input value
            expect(inputField).toHaveValue('Test Org');

            // Validate that no error message is shown
            const errorMessage = screen.queryByText('Organization name is required');
            expect(errorMessage).not.toBeInTheDocument();
        });
        const inputField2 = screen.getByPlaceholderText('Organization Admin first name');
        expect(inputField2).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField2, {
                target: {
                    value: 'Name'
                }
            })
        });
        const inputField3 = screen.getByPlaceholderText('Organization Admin last name');
        expect(inputField3).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField3, {
                target: {
                    value: 'LName'
                }
            })
        });
        const inputField4 = screen.getByPlaceholderText('Enter admin email address');
        expect(inputField4).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField4, {
                target: {
                    value: 'admin@example.com'
                }
            })
        });
        const inputField5 = screen.getByPlaceholderText('Enter Password');
        expect(inputField5).toBeInTheDocument();

        const newPassword = "Test@123";

        await act(async () => {
            fireEvent.input(inputField5, { target: { value: newPassword } }); // Use input event
            fireEvent.keyUp(inputField5, { key: 'a', code: 'KeyA' });
            fireEvent.blur(inputField5);
        });

        expect(inputField5).toHaveValue(newPassword);

        const createButton = screen.getByText('Create Organization');
        expect(createButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(createButton) });
    }, 60000);

    test('create organization works as expected with invalid data', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <AppContext.Provider value={{
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
                }}>

                    <RenderCreateOrganization
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        formRef={mockFormRef}
                        fetchOrganizations={fetchOrganizations}
                        created_by={1}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: 'Organization name already exists' };
        act(() => { (createOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('Enter new organization name');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                value: 'Test Org'
            })
        });
        fireEvent.change(inputField, { target: { value: 'Test Org' } });

        // Trigger blur event (user loses focus)
        fireEvent.blur(inputField);

        // Wait for the DOM to update
        await waitFor(() => {
            // Validate the input value
            expect(inputField).toHaveValue('Test Org');

            // Validate that no error message is shown
            const errorMessage = screen.queryByText('Organization name is required');
            expect(errorMessage).not.toBeInTheDocument();
        });
        const inputField2 = screen.getByPlaceholderText('Organization Admin first name');
        expect(inputField2).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField2, {
                target: {
                    value: 'Name'
                }
            })
        });
        const inputField3 = screen.getByPlaceholderText('Organization Admin last name');
        expect(inputField3).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField3, {
                target: {
                    value: 'LName'
                }
            })
        });
        const inputField4 = screen.getByPlaceholderText('Enter admin email address');
        expect(inputField4).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField4, {
                target: {
                    value: 'admin@example.com'
                }
            })
        });
        const inputField5 = screen.getByPlaceholderText('Enter Password');
        expect(inputField5).toBeInTheDocument();

        const newPassword = "Test@123";

        await act(async () => {
            fireEvent.input(inputField5, { target: { value: newPassword } }); // Use input event
            fireEvent.keyUp(inputField5, { key: 'a', code: 'KeyA' });
            fireEvent.blur(inputField5);
        });

        expect(inputField5).toHaveValue(newPassword);

        const createButton = screen.getByText('Create Organization');
        expect(createButton).toBeInTheDocument();
        await act(async () => { fireEvent.click(createButton) });
    });

    test('create organization throws error when mandatory fields are empty', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });
        const createButton = screen.getByText('Create Organization');
        await act(async () => { fireEvent.click(createButton) });
        await waitFor(() => {
            const error = screen.getAllByText(Messages.ORGANIZATION_NAME_REQUIRED);
            expect(error.length).toBeGreaterThan(0);
        });
    }, 60000);

    test(`create organization throws error when password field
     is present but doesnt meet criteria`, async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });

        const inputField5 = screen.getByPlaceholderText('Enter Password');
        expect(inputField5).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField5, {
                target: {
                    value: 'Test'
                }
            })
        });

        const createButton = screen.getByText('Create Organization');
        await act(async () => { fireEvent.click(createButton) });
    }, 60000);

    test('copy button works as expected', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });

        const inputField5 = screen.getByPlaceholderText('Enter Password');
        expect(inputField5).toBeInTheDocument();

        const copyButton = screen.getAllByAltText('copy');
        await act(async () => { fireEvent.click(copyButton[0]) });
    });

    test('copy button works as expected when password is present', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });

        const inputField5 = screen.getByPlaceholderText('Enter Password');
        expect(inputField5).toBeInTheDocument();
        await act(async () => {
            fireEvent.input(inputField5, { target: { value: 'Test@123' } }); // Use input event
            fireEvent.keyUp(inputField5, { key: 'a', code: 'KeyA' });
            fireEvent.blur(inputField5);
        });

        const copyButton = screen.getAllByAltText('copy');
        await act(async () => { fireEvent.click(copyButton[0]) });
    });

    test('view password button works as expected', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });

        const eyeButton = screen.getByLabelText('eyeopen');
        await act(async () => { fireEvent.click(eyeButton) });
        await waitFor(() => {
            expect(screen.getByLabelText('eyeclose')).toBeInTheDocument();
        });
    });

    test('Generate password button works as expected', async () => {
        const getFilteredRoles = jest.fn();
        getFilteredRoles.mockReturnValue([{ type: 'org_admin' }]);
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });

        const inputField = screen.getByPlaceholderText('Enter Password');
        expect(inputField).toHaveValue("");
        const generatePasswordButton = screen.getByText('Generate');
        await act(async () => { fireEvent.click(generatePasswordButton) });
        await waitFor(() => {
            const inputField = screen.getByPlaceholderText('Enter Password');
            // expect(screen.getByText(Messages.PASSWORD_COPY)).toBeInTheDocument();
            expect(inputField).not.toHaveValue("");
        });
    });

    test('Cancel button works as expected', async () => {
        await act(async () => {
            render(
                <RenderCreateOrganization
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    formRef={mockFormRef}
                    fetchOrganizations={fetchOrganizations}
                    created_by={1}
                />);
        });

        expect(screen.getByText('Cancel')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        await act(async () => { fireEvent.click(cancelButton) });
    });
});