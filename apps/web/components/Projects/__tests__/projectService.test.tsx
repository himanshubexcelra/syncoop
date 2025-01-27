/*eslint max-len: ["error", { "code": 100 }]*/
import {
    getProjects,
    getOverviewCounts,
    createProject,
    editProject,
    deleteProject
} from '../projectService';
const mockData = {
    id: 2,
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
            id: 2,
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
            id: 4,
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

describe('Project APIs test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getProjects should fetch project data successfully', async () => {
        const mockResponse = mockData;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await getProjects({ withRelation: [], organization_id: 1, withCount: [] });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockResponse);
    });

    test('geMoleculeCountById should fetch molecule count successfully', async () => {
        const mockResponse = mockData;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const organization_id = 2;
        const result = await getOverviewCounts(organization_id);
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library`);
        if (organization_id) {
            url.searchParams.append('orgId', String(organization_id));
        }
        url.searchParams.append('condition', 'count');
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(result).toEqual(mockResponse);
    });

    test('editProject should update project successfully', async () => {
        const mockResponse = mockData;
        const formData = new FormData();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await editProject(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/project`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        expect(result).toEqual(mockResponse);
    });

    test('editProject should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Project');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await editProject(formData);

        expect(result).toEqual({ error: 'Server Error' });
    });

    test('createProject should create project successfully', async () => {
        const mockResponse = mockData;
        // const formData = new FormData();
        const data = {
            organization: '2',
            owner: 'System Admin',
            type: 'Retrosynthesis',
            target: '',
            name: 'new',
            sharedUsers: [
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
                    ],
                    "permission": "Edit"
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
                    ],
                    "permission": "Admin"
                }
            ],
            organization_id: 2,
            user_id: 1,
        }
        // formData.append(data);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await createProject(data);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/project`, {
            mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...data }),
        });
        expect(result).toEqual(mockResponse);
    });

    test('deleteProject request to the correct URL', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ success: true }),
            })
        ) as jest.Mock;

        const params = { project_id: '123', parent_id: '456' };
        const result = await deleteProject(params);

        const expectedUrl = new URL(`${process.env.NEXT_API_HOST_URL}/v1/project`);
        expectedUrl.searchParams.append('project_id', String(params.project_id));
        expectedUrl.searchParams.append('parent_id', String(params.parent_id));
        expect(fetch).toHaveBeenCalledTimes(1); // Assert fetch was called once

        expect(fetch).toHaveBeenCalledWith(expectedUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        expect(result).toEqual({ success: true });
    });

})