/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import { editLibrary, createLibrary } from '@/components/Libraries/service';
import { useParams, useSearchParams } from 'next/navigation';
import CreateLibrary from '../CreateLibrary';

jest.mock("@/components/Breadcrumbs/BreadCrumbs", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="breadcrumb">Mocked Breadcrumb</div>),
}));

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
    useParams: jest.fn(),
}));

jest.mock('@/components/Libraries/service', () => ({
    getLibraries: jest.fn(),
    editLibrary: jest.fn(),
    createLibrary: jest.fn(),
}));

const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });
const mockReset = jest.fn();
const fetchLibraries = jest.fn();
const setCreatePopupVisibility = jest.fn();
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

const data = {
    id: 1,
    name: 'Proj2',
    target: null,
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
    libraries: [
        {
            id: 1,
            name: 'EGFR-v1',
            description: 'Smaple data',
            target: 'Target',
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
            target: 'Target',
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
    ]
};

const userData = {
    id: 1,
    organization_id: 1,
    email_id: "forum.tanna@external.milliporesigma.com",
    first_name: "Forum",
    last_name: "Tanna",
    myRoles: [],
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
    orgUser: {
        id: 1, name: 'System Admin', first_name: "Forum",
        last_name: "Tanna",
        email_id: "forum.tanna@external.milliporesigma.com",
        status: "active",
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
        organization: {
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
            }]
        }
    }
} as any;

const projectData = {
    ...data,
    organization: {
        id: 1,
        name: 'Merck',
        description: 'Merck Corporation',
        logo: 'logo.jpg',
        created_by: 1,
        created_at: '2024-08-05T15:44:09.158Z',
        updated_at: '2024-08-05T15:44:09.158Z',
        status: 'active',
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            }
        }]
    },
    user: userData,
    sharedUser: [userData.orgUser],
    updated_by: {}
}

describe('Create/ Edit Library should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    test.skip('create library works as expected with valid data', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <CreateLibrary
                    userData={userData}
                    // @ts-expect-error params definiation mismatch
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={-1}
                />);
        });

        const mockResponse = { error: null };
        act(() => { (createLibrary as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('New Library');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'My New Library'
                }
            })
        });

        expect(screen.getByText('Create Library')).toBeInTheDocument();

        const createButton = screen.getByText('Create Library');
        await act(async () => { fireEvent.click(createButton) });
    });

    test.skip('edit library works as expected with valid data', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <CreateLibrary
                    userData={userData}
                    // @ts-expect-error params definiation mismatch
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={2}
                />);
        });

        const mockResponse = { error: null };
        act(() => { (editLibrary as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('Edit Library');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'My New Library'
                }
            });
        });

        expect(screen.getByText('Update')).toBeInTheDocument();

        const updateButton = screen.getByText('Update');
        await act(async () => { fireEvent.click(updateButton) });
    });
});