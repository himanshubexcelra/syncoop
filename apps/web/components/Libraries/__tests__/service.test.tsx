/*eslint max-len: ["error", { "code": 100 }]*/
import { getOverviewCounts } from '@/components/Projects/projectService';
import {
    getLibraries,
    createLibrary,
    editLibrary,
    getLibraryById,
    addToFavorites,
    addMoleculeToCart,
    submitOrder,
    updateMoleculeStatus,
    generatePathway,
    getLabJobOrderDetail,
    postLabJobOrder,
    deleteMolecule,
    deleteMoleculeCart,
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

    test('getLibraryCountById should fetch library count successfully', async () => {
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

    test('geMoleculeCountById should fetch molecule count successfully', async () => {
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

        expect(result).toEqual({ error: 'Server Error' });
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

    test('addToFavorites should update favourite molecule successfully', async () => {
        const formData = { molecule_id: 1, user_id: 1, favourite_id: 1, favourite: true };

        const result = await addToFavorites(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule/favorite`, {
            mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });
        expect(result).toEqual(true);
    });

    test('editLibrary payload and return success response', async () => {
        const mockFormData = {
            id: '123',
            name: 'Updated Library',
        };

        const mockResponse = { success: true, message: 'Library updated successfully' };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await editLibrary(mockFormData);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/library`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockFormData),
        });
        expect(result).toEqual(mockResponse);
    });

    test('addMoleculeToCart API with success reposnse', async () => {
        const mockMoleculeData: any = [
            { id: 'molecule1', quantity: 2 },
            { id: 'molecule2', quantity: 3 },
        ];
        const mockStatus = 1;

        const mockResponse = { success: true, message: 'Molecule added to cart successfully' };


        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await addMoleculeToCart(mockMoleculeData, mockStatus);

        // Assert fetch was called with the correct arguments
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart`, {
            mode: 'no-cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ molecules: mockMoleculeData, status: mockStatus }),
        });

        // Assert the response matches the mock data
        expect(result).toEqual(mockResponse);
    });

    test.skip('test case for deleteMoleculeCart API', async () => {
        const mockParams = {
            created_by: 1,
            moleculeStatus: 2,
            molecule_id: 123,
            library_id: 456,
            project_id: 789,
        };
        const mockResponse = { success: true, message: 'Cart item deleted successfully' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await deleteMoleculeCart(
            mockParams.created_by,
            mockParams.moleculeStatus,
            mockParams.molecule_id,
            mockParams.library_id,
            mockParams.project_id
        );

        const expectedUrl = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart`);
        expectedUrl.searchParams.append('user_id', String(mockParams.created_by));
        expectedUrl.searchParams.append('molecule_id', String(mockParams.molecule_id));
        expectedUrl.searchParams.append('library_id', String(mockParams.library_id));
        if (mockParams.project_id) {
            expectedUrl.searchParams.append('project_id', String(mockParams.project_id));
        }
        if (mockParams.moleculeStatus) {
            expectedUrl.searchParams.append('moleculeStatus', String(mockParams.moleculeStatus));
        }
        expect(fetch).toHaveBeenCalledWith(expectedUrl.toString(), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Assert the response matches the mock data
        expect(result).toEqual(mockResponse);
    });

    test('test case for addToFavorites API ', async () => {
        const mockFormData: any = {
            id: 'molecule123',
            favourite: true,
        };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(null),
            })
        ) as jest.Mock;


        const result = await addToFavorites(mockFormData);

        // Assert fetch was called with the correct arguments
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule/favorite`, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockFormData),
        });

        // Assert the response is true for status 200
        expect(result).toBe(true);
    });

    test('test case for submit order API', async () => {
        const mockOrderData: any = {
            id: 'order123',
            items: [
                { moleculeId: 'molecule1', quantity: 2 },
                { moleculeId: 'molecule2', quantity: 3 },
            ],
        };

        const mockResponse = { success: true, orderId: 'order123' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await submitOrder(mockOrderData);

        // Assert fetch was called with the correct arguments
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/molecule_order`, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockOrderData),
        });

        expect(result).toEqual(mockResponse);
    });

    test('test case for updateMoleculeStatus API', async () => {
        const mockFormData: any = [
            { id: 'molecule1', status: 'active' },
            { id: 'molecule2', status: 'inactive' },
        ];
        const mockStatus = 1;
        const mockUserId = 123;

        const mockResponse = { success: true, updated: true };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;
        const result = await updateMoleculeStatus(mockFormData, mockStatus, mockUserId);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/molecule`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                { formData: mockFormData, status: mockStatus, userId: mockUserId }),
        });

        expect(result).toEqual(mockResponse);
    });

    test('test case for generatePathway API', async () => {
        const mockFormData: any = {
            input: 'pathway_data',
            options: { key: 'value' },
        };

        const mockResponse = { success: true, pathwayId: '12345' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;
        await generatePathway(mockFormData);
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.PYTHON_API_HOST_URL}/generate_pathway_schemes`, {
            method: 'POST',
            headers: {
                Accept: '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockFormData),
        });
    });

    test('test case for getLabJobOrder API', async () => {
        const mockMoleculeId = 123;
        const mockResponse = {
            success: true, details: { id: mockMoleculeId, name: 'Test Molecule' }
        };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;
        const result = await getLabJobOrderDetail(mockMoleculeId);
        const expectedUrl = new URL(`${process.env.NEXT_API_HOST_URL}/v1/lab_job_order/`);
        if (mockMoleculeId) {
            expectedUrl.searchParams.append('molecule_id', String(mockMoleculeId));
        }
        expect(fetch).toHaveBeenCalledTimes(1); // Assert fetch was called once
        expect(fetch).toHaveBeenCalledWith(expectedUrl, {
            mode: 'no-cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(result).toEqual(mockResponse);

    });

    test.skip('test case for postLabJobOrder API', async () => {
        const mockData: any = {
            moleculeId: 'molecule123',
            quantity: 2,
            description: 'Test job order',
        };

        const mockResponse = { success: true, orderId: 'order123' };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;
        const result = await postLabJobOrder(mockData);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/lab_job_order`, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: mockData }),
        });
        expect(result).toEqual(mockResponse);
    });

    test('test case for deleteMolecule API', async () => {
        const mockMoleculeId = 123;
        const mockResponse = { success: true, message: 'Molecule deleted successfully' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await deleteMolecule(mockMoleculeId);

        const expectedUrl = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule/`);
        if (mockMoleculeId) {
            expectedUrl.searchParams.append('molecule_id', String(mockMoleculeId));
        }
        expect(fetch).toHaveBeenCalledTimes(1); // Assert fetch was called once
        expect(fetch).toHaveBeenCalledWith(expectedUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Assert the response matches the mock data
        expect(result).toEqual(mockResponse);
    });
});