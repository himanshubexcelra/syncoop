/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AppContext } from '../../../app/AppState';
import { AppContextModel } from '@/lib/definition';
import { editOrganization } from '@/components/Organization/service';
import { ContainerType } from '@/lib/definition';
import FunctionalAssay from '../FunctionalAssay';

const fetchOrganizationData = jest.fn();
const fetchOrganizations = jest.fn();
const reset = jest.fn();
const setDirtyField = jest.fn();
const setAssayValue = jest.fn();
const selectType = jest.fn();
const setReset = jest.fn();

const mockAppContext = {
    addToState: jest.fn(),
    state: {
        cartDetail: {},
        appContext: {} as AppContextModel,
    },
};

const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });
const mockReset = jest.fn();
const mockValidate = jest.fn().mockReturnValue({ isValid: true, check: 'jhgff' });

const mockInstance = {
    option: mockOption,
    reset: mockReset,
    validate: mockValidate,
};

// Mock the formRef
const mockFormRef = {
    current: {
        instance: () => mockInstance,
    },
};

jest.mock('@/components/Organization/service', () => ({
    editOrganization: jest.fn(),
    getOrganizationById: jest.fn(),
}));

jest.mock('@/components/Projects/projectService', () => ({
    editProject: jest.fn(),
}));

jest.mock('@/components/Libraries/service', () => ({
    editLibrary: jest.fn(),
}));

const orgDetail = {
    id: 1,
    first_name: 'Test',
    last_name: 'User',
    email_id: 'test.user@example.com',
    user_role: [{
        role: {
            id: 1,
            name: 'admin',
        },
        role_id: 1,
    }],
    organization_id: 1,
    orgUser: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email_id: 'test.user@example.com',
        status: 'active',
        organization: {
            id: 1,
            name: 'Test Organization',
        },
        user_role: [{
            role: {
                id: 1,
                name: 'admin',
            },
            role_id: 1,
        }],
        type: 'internal',
    },
    myRoles: ['admin'],
    roles: [{
        type: 'admin',
    }],
};

const organizaitonData = {
    id: 1,
    name: 'Merck',
    description: 'Merck Corporation',
    logo: 'logo.jpg',
    created_by: 1,
    created_at: '2024-08-05T15:44:09.158Z',
    updated_at: '2024-08-05T15:44:09.158Z',
    status: 'active',
    type: 'Internal',
    user_role: [{
        role: {
            id: 6,
            priority: 1,
            type: "admin",
            number: 1,
            name: "admin"
        },
        role_id: 6
    }],
    metadata: { assay: [{ name: 'abc' }] }
};

const projectData = {
    id: 1,
    name: 'Proj2',
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    created_at: '2024-10-17T08:18:35.505Z',
    updated_at: '2024-10-17T08:18:35.505Z',
    owner_id: 1,
    updated_by: 1,
    owner: {
        id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email_id: 'sys_admin@external.milliporesigma.com'
    },
    library: { name: 'fauxbio' },
    metadata: {},
    libraries: [
        {
            id: 1,
            name: 'EGFR-v1',
            description: 'Smaple data',
            project_id: 2,
            created_at: '2024-10-17T09:53:33.045Z',
            updated_at: null,
            owner_id: 7,
            updated_by: null,
            owner: {
                id: 1,
                first_name: 'System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com'
            }
        },
        {
            id: 2,
            name: 'Lib3',
            description: 'Smaple data',
            project_id: 2,
            created_at: '2024-10-17T09:53:33.070Z',
            updated_at: null,
            owner_id: 7,
            updated_by: null,
            owner: {
                id: 1,
                first_name: 'System',
                last_name: 'Admin',
                email_id: 'sys_admin@external.milliporesigma.com'
            }
        }
    ],
    inherits_bioassays: true,
    container: {
        metadata: { assay: [{ name: 'abc' }] }
    }
};

describe('Functional assay should work as expected', () => {
    test('Add New Kit button should work as expected', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <FunctionalAssay
                        data={organizaitonData?.metadata?.assay || []}
                        orgUser={orgDetail}
                        fetchOrganizations={fetchOrganizationData}
                        childRef={mockFormRef}
                        setDirtyField={setDirtyField}
                        reset={reset}
                        isDirty={false}
                        loggedInUser={1}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const combobox = screen.getByRole('combobox');
        expect(combobox).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(combobox);
        });

        const createButton = screen.getByText(/Add New Kit/);
        expect(createButton).toBeInTheDocument();

        await act(async () => { fireEvent.click(createButton) });
    }, 60000);

    test('Inherit button should work as expected', async () => {
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <FunctionalAssay
                        data={projectData}
                        orgUser={orgDetail}
                        fetchContainer={fetchOrganizations}
                        type={ContainerType.PROJECT}
                        childRef={mockFormRef}
                        setDirtyField={setDirtyField}
                        reset={reset}
                        isDirty={false}
                        loggedInUser={1}
                        setParentAssay={setAssayValue}
                        editAllowed={true}
                        selectType={selectType}
                        setReset={setReset}
                    />
                </AppContext.Provider>
            );
        });

        const mockResponse = { error: null };
        act(() => { (editOrganization as jest.Mock).mockResolvedValue(mockResponse) });
        const switchButton = screen.getByRole('switch');
        expect(switchButton).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(switchButton, { target: { checked: true } });
        });

        const updateButton = screen.getByText('Update');
        expect(updateButton).toBeEnabled();

        await act(async () => { fireEvent.click(updateButton) });
    });
});