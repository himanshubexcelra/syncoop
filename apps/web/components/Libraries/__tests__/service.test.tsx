/*eslint max-len: ["error", { "code": 100 }]*/
import { getOverviewCounts } from '@/components/Projects/projectService';
import {
    getLibraries,
    createLibrary,
    editLibrary,
    getLibraryById,
    addToFavourites,
} from '../service';

const libraryData = {
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
    },
    molecule: []
}

describe('Library API Functions', () => {
    const data = {
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getLibraries should fetch library data successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const withRelation = ['libraries'];
        const project_id = '2'
        const result = await getLibraries(withRelation, project_id);
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/project`);
        url.searchParams.append('project_id', project_id);
        if (withRelation.length) {
            url.searchParams.append('with', JSON.stringify(withRelation));
        }

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

    test('getLibraryById should fetch library data successfully', async () => {
        const mockResponse = libraryData;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const withRelation = ['molecule'];
        const library_id = '2'
        const result = await getLibraryById(withRelation, library_id);
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library?id=${library_id}`);
        if (withRelation.length) {
            url.searchParams.append('with', JSON.stringify(withRelation));
        }

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

    test.skip('getLibraryCountById should fetch library count successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const organization_id = 2;
        const result = await getOverviewCounts(organization_id);
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library`);
        if (organization_id) {
            url.searchParams.append('organization_id', String(organization_id));
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

    test.skip('geMoleculeCountById should fetch molecule count successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const organization_id = 2;
        const result = await getOverviewCounts(organization_id);
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library`);
        if (organization_id) {
            url.searchParams.append('organization_id', String(organization_id));
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

    test('editLibrary should update library successfully', async () => {
        const mockResponse = data;
        const formData = new FormData();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await editLibrary(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/library`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        expect(result).toEqual(mockResponse);
    });

    test('editLibrary should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test library');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await editLibrary(formData);

        expect(result).toEqual({ status: 500, error: { error: 'Server Error' } });
    });

    test('createLibraryApi should create library successfully', async () => {
        const mockResponse = data;
        const formData = new FormData();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await createLibrary(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/library`, {
            mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        expect(result).toEqual(mockResponse);
    });

    test('addToFavourites should update favourite molecule successfully', async () => {
        const mockResponse = data;
        const formData = { molecule_id: 1, user_id: 1, favourite_id: 1, favourite: true };

        const result = await addToFavourites(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/molecule`, {
            mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });
        expect(result).toEqual(mockResponse);
    });

    test('editLibrary should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Library');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await editLibrary(formData);

        expect(result).toEqual({ status: 500, error: { error: 'Server Error' } });
    });
});