import { getOrganization, editOrganization, createOrganizationApi } from '../service';

describe('Organization API Functions', () => {
    const data = [
        {
            name: 'Fauxbio',
            user: {
                email: 'max.harrison@fauxbio.com',
            },
            status: 'Active',
            projects: 3,
            molecules: 240,
            users: 200,
            id: 12345,
            creationDate: '2024-08-01',
            lastModifiedDate: '2024-08-01',
        },
        {
            name: 'BioQuest',
            user: {
                email: 'elena.garcia@bioquest.com',
            },
            status: 'Active',
            projects: 3,
            molecules: 240,
            users: 200,
            id: 12345,
            creationDate: '2024-08-05',
            lastModifiedDate: '2024-08-01',
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getOrganization should fetch organization data successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await getOrganization();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_HOST_URL}/v1/organization`, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(result).toEqual(mockResponse);
    });

    test('editOrganization should update organization successfully', async () => {
        const mockResponse = data;
        const formData = new FormData();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await editOrganization(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_HOST_URL}/v1/organization/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        expect(result).toEqual(mockResponse);
    });

    test('editOrganization should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Organization');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await editOrganization(formData);

        expect(result).toEqual({ status: 500, error: { error: 'Server Error' } });
    });

    test('createOrganizationApi should create organization successfully', async () => {
        const mockResponse = data;
        const formData = new FormData();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await createOrganizationApi(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_HOST_URL}/v1/organization`, {
            mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        expect(result).toEqual(mockResponse);
    });

    test('createOrganizationApi should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Organization');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await createOrganizationApi(formData);

        expect(result).toEqual({ status: 500, error: { error: 'Server Error' } });
    });

    test('createOrganizationApi should handle fetch errors', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Organization');

        global.fetch = jest.fn(() => Promise.reject(new Error('Network Error'))) as jest.Mock;

        const result = await createOrganizationApi(formData);

        expect(result).toEqual(new Error('Network Error'));
    });
});