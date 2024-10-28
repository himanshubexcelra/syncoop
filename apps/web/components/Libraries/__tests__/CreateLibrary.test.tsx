/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import { editLibrary, createLibrary } from '@/components/Libraries/libraryService';
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

jest.mock('@/components/Libraries/libraryService', () => ({
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
    createdAt: '2024-10-17T08:18:35.505Z',
    updatedAt: '2024-10-17T08:18:35.505Z',
    ownerId: 1,
    updatedById: 1,
    owner: {
        id: 1,
        firstName: 'System',
        lastName: 'Admin',
        email: 'sys_admin@external.milliporesigma.com'
    },
    library: { name: 'fauxbio' },
    libraries: [
        {
            id: 1,
            name: 'EGFR-v1',
            description: 'Smaple data',
            target: 'Target',
            projectId: 2,
            createdAt: '2024-10-17T09:53:33.045Z',
            updatedAt: null,
            ownerId: 7,
            updatedById: null,
            owner: {
                id: 1,
                firstName: 'System',
                lastName: 'Admin',
                email: 'sys_admin@external.milliporesigma.com'
            },
            updatedBy: null
        },
        {
            id: 2,
            name: 'Lib3',
            description: 'Smaple data',
            target: 'Target',
            projectId: 2,
            createdAt: '2024-10-17T09:53:33.070Z',
            updatedAt: null,
            ownerId: 7,
            updatedById: null,
            owner: {
                id: 1,
                firstName: 'System',
                lastName: 'Admin',
                email: 'sys_admin@external.milliporesigma.com'
            },
            updatedBy: null
        }
    ]
};

const userData = {
    id: 1,
    organizationId: 1,
    email: "forum.tanna@external.milliporesigma.com",
    firstName: "Forum",
    lastName: "Tanna",
    user_role: [{
        role: {
            id: 6,
            priority: 1,
            type: "admin",
            number: 1,
            name: "admin"
        },
        roleId: 6
    }],
    orgUser: {
        id: 1, name: 'System Admin', firstName: "Forum",
        lastName: "Tanna",
        email: "forum.tanna@external.milliporesigma.com",
        status: "active",
        user_role: [{
            role: {
                id: 6,
                priority: 1,
                type: "admin",
                number: 1,
                name: "admin"
            },
            roleId: 6
        }],
        organization: {
            id: 1,
            name: 'Merck',
            description: 'Merck Corporation',
            logo: 'logo.jpg',
            createdBy: 1,
            createdAt: '2024-08-05T15:44:09.158Z',
            updatedAt: '2024-08-05T15:44:09.158Z',
            status: 'active',
            user_role: [{
                role: {
                    id: 6,
                    priority: 1,
                    type: "admin",
                    number: 1,
                    name: "admin"
                },
                roleId: 6
            }]
        }
    }
}

const projectData = {
    ...data,
    organization: {
        id: 1,
        name: 'Merck',
        description: 'Merck Corporation',
        logo: 'logo.jpg',
        createdBy: 1,
        createdAt: '2024-08-05T15:44:09.158Z',
        updatedAt: '2024-08-05T15:44:09.158Z',
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
    updatedBy: {}
}

describe('Create/ Edit Library should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    test('create library works as expected with valid data', async () => {
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
                    libraryIdx={-1}
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

    test('edit library works as expected with valid data', async () => {
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
                />);
        });

        const mockResponse = { error: null };
        act(() => { (editLibrary as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('New Library');
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

    test('edit library works as expected with invalid data', async () => {
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
                />);
        });

        const mockResponse = { error: 'wrong data' };
        act(() => { (editLibrary as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('New Library');
        expect(inputField).toBeInTheDocument();

        expect(screen.getByText('Update')).toBeInTheDocument();

        const updateButton = screen.getByText('Update');
        await act(async () => { fireEvent.click(updateButton) });
    });
});