/*eslint max-len: ["error", { "code": 100 }]*/
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { editProject, createProject } from '@/components/Projects/projectService';
import { useParams, useSearchParams } from 'next/navigation';
import CreateProject from '../CreateProject';
import { useRouter } from 'next/navigation';
import { AppContextModel } from '@/lib/definition';
import { AppContext } from '../../../app/AppState';

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

const mockAppContext = {
    state: {
        cartDetail: {},
        appContext: {} as AppContextModel,
    },
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);
jest.mock('@/components/Projects/projectService', () => ({
    editProject: jest.fn(),
    createProject: jest.fn(),
}));

const mockOption = jest.fn().mockReturnValue({ /* your mock formData */ });
const mockReset = jest.fn();
const fetchOrganizations = jest.fn();
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

const orgData = [
    {
        "id": 2,
        "parent_id": "1",
        "type": "CO",
        "name": "Fauxbio",
        "description": null,
        "owner_id": 2,
        "inherits_configuration": true,
        "config": {
            ADMEParams: [{ Solubility: { max: 4.3, min: 0.67 } },
            { CLint: { max: 4.21, min: 0.85 } },
            { Fub: { max: 4.05, min: 1.11 } },
            { Caco2: { max: 3.78, min: 1.12 } },
            { HepG2: { max: 3.66, min: 1.27 } },
            { hERG: { max: 3.09, min: 1.03 } }]
        },
        "metadata": null,
        "is_active": true,
        "created_at": "2025-01-07T18:35:27.366Z",
        "created_by": 1,
        "updated_at": null,
        "updated_by": null,
        "email_id": 'sys_admin@faubio.com',
        "owner": {
            "id": 2,
            "title": null,
            "first_name": "Org",
            "last_name": "Admin",
            "email_id": "org_admin@external.milliporesigma.com",
            "password_hash": "$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm",
            "timezone_id": null,
            "number_datetime_format_id": null,
            "image_url": null,
            "organization_id": "2",
            "is_active": true,
            "created_at": "2025-01-07T18:35:27.011Z",
            "created_by": null,
            "updated_at": null,
            "updated_by": null,
            "primary_contact_id": null
        },
        "orgUser": [
            {
                "id": 2,
                "first_name": "Org",
                "last_name": "Admin",
                "owner": [
                    {
                        "id": "2",
                        "parent_id": "1",
                        "type": "CO",
                        "name": "Fauxbio",
                        "description": null,
                        "owner_id": 2,
                        "inherits_configuration": true,
                        "config": null,
                        "metadata": null,
                        "is_active": true,
                        "created_at": "2025-01-07T18:35:27.366Z",
                        "created_by": 1,
                        "updated_at": null,
                        "updated_by": null
                    }
                ],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "org_admin"
                        }
                    }
                ]
            },
            {
                "id": 3,
                "first_name": "Library",
                "last_name": "Manager",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "library_manager"
                        }
                    }
                ]
            },
            {
                "id": 6,
                "first_name": "lib",
                "last_name": "manager",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "library_manager"
                        }
                    }
                ]
            },
            {
                "id": 7,
                "first_name": "lib",
                "last_name": "manager2",
                "owner": [
                    {
                        "id": "17",
                        "parent_id": "12",
                        "type": "L",
                        "name": "test lib",
                        "description": null,
                        "owner_id": 7,
                        "inherits_configuration": true,
                        "config": {
                            "ADMEParams": [
                                {
                                    "Solubility": {
                                        "max": 5,
                                        "min": 1.29
                                    }
                                },
                                {
                                    "CLint": {
                                        "max": 5,
                                        "min": 1.17
                                    }
                                },
                                {
                                    "Fub": {
                                        "max": 5,
                                        "min": 1.03
                                    }
                                },
                                {
                                    "Caco2": {
                                        "max": 5,
                                        "min": 0
                                    }
                                },
                                {
                                    "HepG2": {
                                        "max": 5,
                                        "min": 0
                                    }
                                },
                                {
                                    "hERG": {
                                        "max": 5,
                                        "min": 0
                                    }
                                }
                            ]
                        },
                        "metadata": {
                            "target": ""
                        },
                        "is_active": true,
                        "created_at": "2025-01-13T11:46:07.450Z",
                        "created_by": 7,
                        "updated_at": null,
                        "updated_by": null
                    }
                ],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "library_manager"
                        }
                    }
                ]
            },
            {
                "id": 8,
                "first_name": "org",
                "last_name": "admin",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "org_admin"
                        }
                    }
                ]
            },
            {
                "id": 9,
                "first_name": "org",
                "last_name": "admin2",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "org_admin"
                        }
                    }
                ]
            },
            {
                "id": 10,
                "first_name": "lib",
                "last_name": "manager33",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "library_manager"
                        }
                    }
                ]
            },
            {
                "id": 11,
                "first_name": "reseacher",
                "last_name": "test",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "researcher"
                        }
                    }
                ]
            },
            {
                "id": 12,
                "first_name": "pa",
                "last_name": "app",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "protocol_approver"
                        }
                    }
                ]
            },
            {
                "id": 14,
                "first_name": "lib",
                "last_name": "man4",
                "owner": [],
                "orgUser": {
                    "id": "2",
                    "parent_id": "1",
                    "type": "CO",
                    "name": "Fauxbio",
                    "description": null,
                    "owner_id": 2,
                    "inherits_configuration": true,
                    "config": null,
                    "metadata": null,
                    "is_active": true,
                    "created_at": "2025-01-07T18:35:27.366Z",
                    "created_by": 1,
                    "updated_at": null,
                    "updated_by": null
                },
                "user_role": [
                    {
                        "role": {
                            "type": "library_manager"
                        }
                    }
                ]
            }
        ],
        "other_container": [
            {
                "id": "20",
                "parent_id": "2",
                "type": "P",
                "name": "new",
                "description": null,
                "owner_id": 1,
                "inherits_configuration": true,
                "config": null,
                "metadata": {
                    "type": "Retrosynthesis",
                    "target": ""
                },
                "is_active": true,
                "created_at": "2025-01-15T11:14:51.423Z",
                "created_by": 1,
                "updated_at": "2025-01-15T12:54:18.675Z",
                "updated_by": 6,
                "other_container": [],
                "owner": {
                    "first_name": "System",
                    "last_name": "Admin"
                },
                "userWhoCreated": {
                    "first_name": "System",
                    "last_name": "Admin"
                },
                "userWhoUpdated": {
                    "first_name": "lib",
                    "last_name": "manager"
                }
            },
        ]
    },
]

const userData = {
    id: 1,
    organization_id: 1,
    email_id: "forum.tanna@external.milliporesigma.com",
    first_name: "Forum",
    last_name: "Tanna",
    myRoles: [],
    user_role: [{
        role: {
            id: 15,
            priority: 1,
            type: "library_manager",
            number: 1,
            name: "library manager"
        },
        role_id: 6
    }],
    orgUser: {
        id: 2, name: 'System Admin', first_name: "lib",
        last_name: "admin",
        email_id: "lib.admin@external.milliporesigma.com",
        status: "active",
        user_role: [{
            role: {
                id: 15,
                priority: 1,
                type: "library_manager",
                number: 1,
                name: "library manager"
            },
            role_id: 6
        }],
        organization: {
            id: 2,
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
                    id: 15,
                    priority: 1,
                    type: "library_manager",
                    number: 1,
                    name: "library manager"
                },
                role_id: 6
            }]
        }
    }
} as any;

const users = [
    {
        "id": 21,
        "first_name": "lib",
        "last_name": "man",
        "owner": [],
        "orgUser": {
            "id": "14",
            "parent_id": "1",
            "type": "CO",
            "name": "Cipla",
            "description": null,
            "owner_id": 15,
            "inherits_configuration": false,
            "config": {
                "ADMEParams": [
                    {
                        "Solubility": {
                            "max": 5,
                            "min": 0
                        }
                    },
                    {
                        "CLint": {
                            "max": 5,
                            "min": 0
                        }
                    },
                    {
                        "Fub": {
                            "max": 5,
                            "min": 0
                        }
                    },
                    {
                        "Caco2": {
                            "max": 5,
                            "min": 0
                        }
                    },
                    {
                        "HepG2": {
                            "max": 5,
                            "min": 0
                        }
                    },
                    {
                        "hERG": {
                            "max": 5,
                            "min": 0
                        }
                    }
                ]
            },
            "metadata": null,
            "is_active": true,
            "created_at": "2025-01-10T10:51:13.122Z",
            "created_by": 1,
            "updated_at": null,
            "updated_by": null
        },
        "user_role": [
            {
                "role": {
                    "type": "library_manager"
                }
            }
        ]
    }
]

const projectData = {
    id: 3,
    name: 'Proj2',
    target: '',
    type: 'Optimization',
    description: 'Example data',
    rganizationId: 1,
    created_at: new Date(),
    updated_at: new Date(),
    owner_id: 1,
    updated_by: 1,
    owner: userData,
    container: {
        id: 2,
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
    container_access_permission: [
        {
            "id": 14,
            "container_id": "3",
            "user_id": 3,
            "access_type": 2,
            "created_at": "2025-01-13T11:13:37.295Z",
            "created_by": null,
            "updated_at": null,
            "updated_by": null
        },
        {
            "id": 15,
            "container_id": "3",
            "user_id": 6,
            "access_type": 2,
            "created_at": "2025-01-13T11:13:37.295Z",
            "created_by": null,
            "updated_at": null,
            "updated_by": null
        },
    ],
    metadata: { type: 'Retrosynthesis', target: '' }, inherits_configuration: true,
}

describe('Create/ Edit Project should work as expected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    test(`create project works as expected with valid data and 
    logged in user is lib_manager`, async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={[]}
                        myRoles={['library_manager']}
                    />;
                </AppContext.Provider>
            )
        });

        const mockResponse = { error: null };
        act(() => { (createProject as jest.Mock).mockResolvedValue(mockResponse) });
        let inputField = screen.getByPlaceholderText('Organization name');
        expect(inputField).toBeInTheDocument();
        expect(inputField).toHaveAttribute('role', 'textbox');
        expect(inputField).toBeDisabled();
        inputField = screen.getByPlaceholderText('New Project');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'My New Project'
                }
            })
        });

        expect(screen.getByText('Create Project')).toBeInTheDocument();

        const createButton = screen.getByText('Create Project');
        await act(async () => { fireEvent.click(createButton) });
    });

    test(`create project works as expected with valid data and 
    logged in user is admin`, async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        const user = {
            ...userData, user_role: [{
                role: {
                    id: 15,
                    priority: 1,
                    type: "admin",
                    number: 1,
                    name: "admin"
                },
                role_id: 6
            }]
        }
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={user}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={[]}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        const mockResponse = { error: null };
        act(() => { (createProject as jest.Mock).mockResolvedValue(mockResponse) });
        let inputField = screen.getByPlaceholderText('Organization name');
        expect(inputField).toBeInTheDocument();
        expect(inputField).toHaveAttribute('role', 'combobox');
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 2
                }
            })
        });
        inputField = screen.getByPlaceholderText('New Project');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'My New Project'
                }
            })
        });

        expect(screen.getByText('Create Project')).toBeInTheDocument();

        const createButton = screen.getByText('Create Project');
        await act(async () => { fireEvent.click(createButton) });
    });

    test.skip('create project throws error when mandatory fields are empty', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={[]}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        const mockResponse = { error: null };
        act(() => { (createProject as jest.Mock).mockResolvedValue(mockResponse) });

        expect(screen.getByText('Create Project')).toBeInTheDocument();

        const createButton = screen.getByText('Create Project');
        await act(async () => { fireEvent.click(createButton) });

        expect(screen.getAllByText('Project name is required').length).toBeGreaterThan(0);
    });

    test('handlePermissionChange should work as expected', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={users}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        expect(screen.getByText('Permissions')).toBeInTheDocument();

        const permissionSelect = screen.getAllByPlaceholderText('permission');
        expect(permissionSelect).not.toHaveLength(0);

        // Open the SelectBox dropdown by clicking it
        fireEvent.click(permissionSelect[0]);

        // Find the options inside the specific SelectBox by finding the container and its options
        const options = screen.getAllByRole('option');
        // Select the first option
        fireEvent.click(options[1]);

        // Check if the SelectBox has the correct value after selection
        expect(permissionSelect[0]).toHaveValue(options[1].textContent);
    });

    test('handleSearch should work as expected', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={users}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        expect(screen.getByText('Permissions')).toBeInTheDocument();

        const permissionSelect = screen.getAllByPlaceholderText('permission');
        expect(permissionSelect).not.toHaveLength(0);

        const search = screen.getByPlaceholderText('Search');

        await act(async () => {
            fireEvent.change(search, {
                target: { value: 'abcd' }
            })
        });

    }, 60000);

    test('onFilterChange should work as expected', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={users}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        expect(screen.getByText('Permissions')).toBeInTheDocument();

        const permissionSelect = screen.getAllByPlaceholderText('permission');
        expect(permissionSelect).not.toHaveLength(0);

        const checkbox = screen.getByRole('checkbox');

        fireEvent.click(checkbox);

        await waitFor(() => {
            expect(checkbox).toBeChecked();
            expect(screen.getByText('No data')).toBeInTheDocument();
        });
    });

    test('sort by permission should work as expected', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={users}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        expect(screen.getByText('Permissions')).toBeInTheDocument();

        const permissionSelect = screen.getAllByPlaceholderText('permission');
        expect(permissionSelect).not.toHaveLength(0);

        fireEvent.click(permissionSelect[0]);

        // Find the options inside the specific SelectBox by finding the container and its options
        const options = screen.getAllByRole('option');
        // Select the first option
        fireEvent.click(options[1]);

        const sortIcon = screen.getByAltText('sort-p');

        // Verify the initial image source
        expect(sortIcon).toHaveAttribute('src', '/icons/arrow-both.svg');

        fireEvent.click(sortIcon);

        expect(sortIcon).toHaveAttribute('src', '/icons/arrow-down.svg');

        fireEvent.click(sortIcon);

        expect(sortIcon).toHaveAttribute('src', '/icons/arrow-up.svg');

        const sortIconName = screen.getByAltText('sort');

        // Verify the initial image source
        expect(sortIconName).toHaveAttribute('src', '/icons/arrow-both.svg');

        fireEvent.click(sortIconName);

        expect(sortIconName).toHaveAttribute('src', '/icons/arrow-down.svg');

        fireEvent.click(sortIconName);

        expect(sortIconName).toHaveAttribute('src', '/icons/arrow-up.svg');

    });

    test.skip('edit project works as expected with valid data', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={[]}
                        edit={true}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        const mockResponse = { error: null };
        act(() => { (editProject as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('New Project');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'My New Project'
                }
            });
        });

        expect(screen.getByText('Update')).toBeInTheDocument();

        const updateButton = screen.getByText('Update');
        await act(async () => { fireEvent.click(updateButton) });
    });

    test.skip('edit project works as expected with invalid data', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={[]}
                        edit={true}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        const mockResponse = { error: 'Project name already exists' };
        act(() => { (editProject as jest.Mock).mockResolvedValue(mockResponse) });
        const inputField = screen.getByPlaceholderText('New Project');
        expect(inputField).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(inputField, {
                target: {
                    value: 'My New Project'
                }
            });
        });

        expect(screen.getByText('Update')).toBeInTheDocument();

        const updateButton = screen.getByText('Update');
        await act(async () => { fireEvent.click(updateButton) });
    });

    test('discard button works as expected', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '1' });

        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue('2'),
        });
        (fetch as jest.Mock).mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(data),
        });
        await act(async () => {
            render(
                <AppContext.Provider value={mockAppContext}>
                    <CreateProject
                        userData={userData}
                        projectData={projectData}
                        fetchOrganizations={fetchOrganizations}
                        formRef={mockFormRef}
                        setCreatePopupVisibility={setCreatePopupVisibility}
                        organizationData={orgData}
                        users={[]}
                        myRoles={['admin']}
                    />
                </AppContext.Provider>);
        });

        expect(screen.getByText('Discard')).toBeInTheDocument();

        const discardButton = screen.getByText('Discard');
        await act(async () => { fireEvent.click(discardButton) });
    });
});