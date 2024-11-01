/*eslint max-len: ["error", { "code": 100 }]*/
import {
    getLibraries,
    getLibraryCountById,
    createLibrary,
    editLibrary,
    getLibraryById,
    geMoleculeCountById,
    addToFavourites,
} from '../libraryService';

const libraryData = {
    id: 2,
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
    molecule: [],
    updatedBy: null
}

describe('Library API Functions', () => {
    const data = {
        id: 2,
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
                id: 2,
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
                id: 4,
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
        const projectId = '2'
        const result = await getLibraries(withRelation, projectId);
        const url = new URL(`${process.env.API_HOST_URL}/v1/project/${projectId}`);
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
        const libraryId = '2'
        const result = await getLibraryById(withRelation, libraryId);
        const url = new URL(`${process.env.API_HOST_URL}/v1/library?id=${libraryId}`);
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

    test('getLibraryCountById should fetch library count successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const organizationId = 2;
        const result = await getLibraryCountById(organizationId);
        const url = new URL(`${process.env.API_HOST_URL}/v1/library`);
        if (organizationId) {
            url.searchParams.append('organizationId', String(organizationId));
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

    test('geMoleculeCountById should fetch molecule count successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const organizationId = 2;
        const result = await geMoleculeCountById(organizationId);
        const url = new URL(`${process.env.API_HOST_URL}/v1/library`);
        if (organizationId) {
            url.searchParams.append('organizationId', String(organizationId));
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
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_HOST_URL}/v1/library`, {
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
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_HOST_URL}/v1/library`, {
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
        const formData = { moleculeId: 1, userId: 1, favourite: true };

        const result = await addToFavourites(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_HOST_URL}/v1/molecule`, {
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