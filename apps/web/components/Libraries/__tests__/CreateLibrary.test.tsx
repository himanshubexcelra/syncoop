/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent } from '@testing-library/react';
import { editLibrary, createLibrary } from '@/components/Libraries/service';
import { useParams, useSearchParams } from 'next/navigation';
import CreateLibrary from '../CreateLibrary';
import { useRouter } from 'next/navigation';

jest.mock("@/components/Breadcrumbs/BreadCrumbs", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="breadcrumb">Mocked Breadcrumb</div>),
}));

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(),
    useParams: jest.fn(),
    useRouter: jest.fn(),
}));
const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    isFallback: false,
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);
jest.mock('@/components/Libraries/service', () => ({
    getLibraries: jest.fn(),
    editLibrary: jest.fn(),
    createLibrary: jest.fn(),
}));
const setLibraryId = jest.fn();
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
    id: 1,
    name: 'Proj2',
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    created_at: new Date(),
    updated_at: new Date(),
    owner_id: 1,
    updated_by: 1,
    owner: userData,
    container: {
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
        }],
        email_id: 'abc@email.com',
        is_active: true,
        orgUser: userData,
        metadata: {
            functionalAssay1: '',
            functionalAssay2: '',
            functionalAssay3: '',
            functionalAssay4: '',
        },
        inherits_configuration: true,
        owner_id: 1,
        type: 'Retrosynthesis',
    },
    user: userData,
    sharedUsers: [userData.orgUser],
    userWhoUpdated: userData,
    userWhoCreated: userData,
    metadata: { type: 'Retrosynthesis', target: '' }, inherits_configuration: true,
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
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={-1}
                    setLibraryId={setLibraryId}
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
    }, 60000);



    test('create library throws error when mandatory fields are empty', async () => {
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
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={-1}
                    setLibraryId={setLibraryId}
                />);
        });

        const mockResponse = { error: null };
        act(() => { (createLibrary as jest.Mock).mockResolvedValue(mockResponse) });

        expect(screen.getByText('Create Library')).toBeInTheDocument();

        const createButton = screen.getByText('Create Library');
        await act(async () => { fireEvent.click(createButton) });

        expect(screen.getAllByText('Library name is required').length).toBeGreaterThan(0);
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
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={2}
                    setLibraryId={setLibraryId}
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

    test.skip('edit library works as expected with invalid data', async () => {
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
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={2}
                    setLibraryId={setLibraryId}
                />);
        });

        const mockResponse = { error: 'Library name already exists' };
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

    test.skip('discard button works as expected', async () => {
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
                    projectData={projectData}
                    fetchLibraries={fetchLibraries}
                    formRef={mockFormRef}
                    setCreatePopupVisibility={setCreatePopupVisibility}
                    library_idx={2}
                    setLibraryId={setLibraryId}
                />);
        });

        expect(screen.getByText('Discard')).toBeInTheDocument();

        const discardButton = screen.getByText('Discard');
        await act(async () => { fireEvent.click(discardButton) });
    });
});